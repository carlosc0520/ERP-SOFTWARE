using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.MANTENIMIENTOS;
using CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.MODULOS;
using CARO.DATOS.MODELO.MANTENIMIENTOS.MODULOS;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Cryptography;

namespace CARO.AUTENTICACION.WEB.Pages.Mantenimientos.Vistas
{

  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasModulosGD _consultasModulosGD;
    private readonly FileUploads _fileUploads;

    public IndexModel(
      IConsultasModulosGD consultasModulosGD,
      IMediator mediator
    )
    {
      _consultasModulosGD = consultasModulosGD;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    #region MODULOS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] ModulosModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var modulos = await _consultasModulosGD.Listar(custom);
        foreach (var mod in modulos)
        {
          var rutacompleta = ConfiguracionProyecto.DISK + mod.IMG;
          mod.IMG = rutacompleta;
        }
        var totalRows = modulos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = modulos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los modulos", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoModulosInsertar comando)
    {
      try
      {
        if (comando.FTO != null && comando.FTO.Length > 0)
        {
          comando.IMG = await _fileUploads.UploadFileAsync("CCFIRMA/MODULOS", comando.FTO); ;
        }

        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoModulosEditar comando)
    {
      try
      {
        if (!string.IsNullOrEmpty(comando.IMG) && comando.IMG.Contains(ConfiguracionProyecto.DISK))
          comando.IMG = comando.IMG.Replace(ConfiguracionProyecto.DISK, "");

        if (comando.FTO != null && comando.FTO.Length > 0 && comando.DELETE == false)
        {
          if (!string.IsNullOrEmpty(comando.IMG))
            await _fileUploads.DeleteDirectoryAsync(comando.IMG);

          comando.IMG = await _fileUploads.UploadFileAsync("CCFIRMA/MODULOS", comando.FTO);
        }

        if (comando.DELETE == true && comando.IMG != null)
        {
          await _fileUploads.DeleteDirectoryAsync(comando.IMG);
          comando.IMG = null;
        }

        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoModulosEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region SUB-MODULOS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarSubModuloAsync([FromQuery] SubModulosModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var submodulos = await _consultasModulosGD.ListarSubModulos(custom);
        var totalRows = submodulos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = submodulos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los submodulos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddSubModuloAsync([FromForm] ComandoSubModulosInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateSubModuloAsync([FromForm] ComandoSubModulosEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteSubModuloAsync([FromForm] ComandoSubModulosEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region DET-SUB-MODULOS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarDetSubModuloAsync([FromQuery] SubModulosDetModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var detsubmodulos = await _consultasModulosGD.ListarDetSubModulos(custom);
        var totalRows = detsubmodulos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = detsubmodulos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los detalle del submodulo.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddDetSubModuloAsync([FromForm] ComandoDetSubModulosInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateDetSubModuloAsync([FromForm] ComandoDetSubModulosEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteDetSubModuloAsync([FromForm] ComandoDetSubModulosEliminar comando)
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

    #endregion
  }
}
