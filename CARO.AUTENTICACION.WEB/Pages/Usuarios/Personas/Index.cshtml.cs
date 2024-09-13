using CARO.CONFIG;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.USUARIOS;
using CARO.DATOS.EVENTOS.Comandos.USUARIOS.PERMISOS;
using CARO.DATOS.EVENTOS.Comandos.USUARIOS.PERSONAS;
using CARO.DATOS.MODELO.USUARIOS.PERSONAS;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Cryptography;

namespace CARO.AUTENTICACION.WEB.Pages.Usuarios.Personas
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasPersonas _consultasPersonas;

    public IndexModel(
      IConsultasPersonas consultasPersonas,
      IMediator mediator
    )
    {
      _consultasPersonas = consultasPersonas;
      _mediator = mediator;
    }

    #region PERSONAS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] PersonaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var personas = await _consultasPersonas.Listar(custom);

        foreach (var persona in personas)
        {
          var rutacompleta = ConfiguracionProyecto.DISK + persona.RTAFTO;
          if (!string.IsNullOrEmpty(rutacompleta) && System.IO.File.Exists(rutacompleta) && rutacompleta != null)
          {
            byte[] fileBytes = await System.IO.File.ReadAllBytesAsync(rutacompleta);
            persona.FTO = Convert.ToBase64String(fileBytes);
            persona.NAMEFTO = Path.GetFileName(rutacompleta);
            persona.TPOFTO = ObtenerMimeType(rutacompleta);
          }
        }

        var totalRows = personas?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = personas, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar las personas.", error = ex.Message });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoPersonaInsertar comando)
    {
      try
      {
        if (comando.FTO != null && comando.FTO.Length > 0)
        {
          string folderPath = Path.Combine(ConfiguracionProyecto.DISK, "CCFIRMA", "PERSONAS");
          if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

          string filePath = await GuardarArchivoConHash(comando.FTO, folderPath);
          comando.RTAFTO = filePath;
        }

        comando.RTAFTO = comando.RTAFTO.Replace(ConfiguracionProyecto.DISK, "");
        comando.PASSWORD = await HashPassword(comando.PASSWORD);
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (IOException ioEx)
      {
        return StatusCode(500, "Error al guardar el archivo: " + ioEx.Message);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoPersonaEditar comando)
    {
      try
      {
        if (comando.FTO != null && comando.FTO.Length > 0 && comando.DELETE == false)
        {
          var rtaEliminar = Path.Combine(ConfiguracionProyecto.DISK, comando.RTAFTO);
          if (!string.IsNullOrEmpty(rtaEliminar) && System.IO.File.Exists(rtaEliminar))
            System.IO.File.Delete(rtaEliminar);


          string folderPath = Path.Combine(ConfiguracionProyecto.DISK, "CCFIRMA", "PERSONAS");
          if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

          string nuevaRuta = await GuardarArchivoConHash(comando.FTO, folderPath);
          comando.RTAFTO = nuevaRuta;
          comando.RTAFTO = comando.RTAFTO.Replace(ConfiguracionProyecto.DISK, "");
        }

        if(comando.DELETE == true && comando.RTAFTO != null)
        {
          var rtaCompleta = Path.Combine(ConfiguracionProyecto.DISK, comando.RTAFTO);
          if (!string.IsNullOrEmpty(rtaCompleta) && System.IO.File.Exists(rtaCompleta))
          {
            System.IO.File.Delete(rtaCompleta);
            comando.RTAFTO = null;
          }
        }

        if(!string.IsNullOrEmpty(comando.PASSWORD)) comando.PASSWORD = await HashPassword(comando.PASSWORD);
        else comando.PASSWORD = null;
        
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (IOException ioEx)
      {
        return StatusCode(500, "Error al manejar los archivos: " + ioEx.Message);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoPermisoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    #region METODOS
    private async Task<string> GuardarArchivoConHash(IFormFile archivo, string folderPath)
    {
      string filePath;
      using (var sha256 = SHA256.Create())
      {
        int attempt = 0;
        bool exists;
        do
        {
          var hash = await GenerarHashArchivo(archivo, sha256);
          if (attempt > 0) hash = $"{hash}_{attempt}";

          string fileName = $"{hash}{Path.GetExtension(archivo.FileName)}";
          filePath = Path.Combine(folderPath, fileName);

          exists = System.IO.File.Exists(filePath);
          attempt++;
        } while (exists);
      }

      using (var fileStream = new FileStream(filePath, FileMode.Create))
      {
        await archivo.CopyToAsync(fileStream);
      }

      return filePath;
    }

    private async Task<string> GenerarHashArchivo(IFormFile archivo, SHA256 sha256)
    {
      using (var stream = archivo.OpenReadStream())
      {
        var hashBytes = await sha256.ComputeHashAsync(stream);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
      }
    }

    private string ObtenerMimeType(string filePath)
    {
      var extension = Path.GetExtension(filePath)?.ToLower();
      return extension switch
      {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".bmp" => "image/bmp",
        _ => "application/octet-stream"
      };
    }

    public async Task<string> HashPassword(string password)
    {
      byte[] salt = new byte[16];

      using (var rng = RandomNumberGenerator.Create())
      {
        rng.GetBytes(salt);
      }

      using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256))
      {
        byte[] hash = pbkdf2.GetBytes(32);

        byte[] hashBytes = new byte[48];
        Array.Copy(salt, 0, hashBytes, 0, 16);  
        Array.Copy(hash, 0, hashBytes, 16, 32);
        return Convert.ToBase64String(hashBytes);
      }
    }

    #endregion
  }
}
