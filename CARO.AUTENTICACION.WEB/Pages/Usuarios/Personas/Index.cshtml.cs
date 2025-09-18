using CARO.CONFIG;
using CARO.CORE;
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
    private readonly FileUploads _fileUploads;  

    public IndexModel(
      IConsultasPersonas consultasPersonas,
      IMediator mediator
    )
    {
      _consultasPersonas = consultasPersonas;
      _mediator = mediator;
      _fileUploads = new FileUploads();  
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
          persona.RTAFTO = rutacompleta;
        }

        var totalRows = personas?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = personas, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar las personas.", error = ex.Message });
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarFindAsync([FromQuery] PersonaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var personas = await _consultasPersonas.Listar(custom);

        foreach (var persona in personas)
        {
          var rutacompleta = ConfiguracionProyecto.DISK + persona.RTAFTO;
          persona.RTAFTOEMP = ConfiguracionProyecto.DISK + persona.RTAFTOEMP;
          persona.RTAFTO2 = await _fileUploads.ObtenerFileBase64(persona.RTAFTO);
          persona.RTAFTO = rutacompleta;
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
          comando.RTAFTO = await _fileUploads.UploadFileAsync("CCFIRMA/PERSONAS", comando.FTO); ;
        }

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

        if (!string.IsNullOrEmpty(comando.RTAFTO) && comando.RTAFTO.Contains(ConfiguracionProyecto.DISK))
          comando.RTAFTO = comando.RTAFTO.Replace(ConfiguracionProyecto.DISK, "");


        if (comando.FTO != null && comando.FTO.Length > 0 && comando.DELETE == false)
        {
          if (!string.IsNullOrEmpty(comando.RTAFTO))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAFTO); 

          comando.RTAFTO = await _fileUploads.UploadFileAsync("CCFIRMA/PERSONAS", comando.FTO);
        }

        if (comando.DELETE == true && comando.RTAFTO != null)
        {
          await _fileUploads.DeleteDirectoryAsync(comando.RTAFTO);
          comando.RTAFTO = null; 
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
