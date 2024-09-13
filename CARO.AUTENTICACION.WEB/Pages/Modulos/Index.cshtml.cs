using CARO.CONFIG;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.SEG;
using CARO.DATOS.EVENTOS.Comandos.SEG.MODULOS;
using CARO.DATOS.MODELO.SEG.MODULOS;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Cryptography;

namespace CARO.AUTENTICACION.WEB.Pages.Modulos
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasModulo _consultasModulo;

    public IndexModel(
      IConsultasModulo consultasModulo,
      IMediator mediator
    )
    {
      _consultasModulo = consultasModulo;
      _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] ModuloModel custom)
    {
      try
      {
        custom.ID = int.Parse(HttpContextDraw.User(HttpContext, 2));
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var modulos = await _consultasModulo.Listar(custom);

        foreach (var mod in modulos)
        {
          var rutacompleta = ConfiguracionProyecto.DISK + mod.IMG;
          if (!string.IsNullOrEmpty(rutacompleta) && System.IO.File.Exists(rutacompleta) && rutacompleta != null)
          {
            byte[] fileBytes = await System.IO.File.ReadAllBytesAsync(rutacompleta);
            mod.FTO = Convert.ToBase64String(fileBytes);
            mod.NAMEFTO = Path.GetFileName(rutacompleta);
            mod.TPOFTO = ObtenerMimeType(rutacompleta);
          }
        }


        var totalRows = modulos?.FirstOrDefault()?.TOTALROWS ?? 0;

        return new JsonResult(new
        {
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = modulos,
          draw = custom.DRAW
        });
      }
      catch (FormatException)
      {
        return BadRequest(new { message = "Formato de ID no válido." });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = "Ocurrió un error inesperado: " + ex.Message });
      }
    }


    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoModuloInsertar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoModuloEditar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> OnGetDeleteAsync([FromForm] ComandoModuloEliminar entidad)
    {
      entidad.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(entidad);
      return new JsonResult(result);
    }

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
