using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.MANTENIMIENTOS;
using CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.EMPRESAS;
using CARO.DATOS.MODELO.MANTENIMIENTOS.EMPRESAS;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Mantenimientos.Empresas
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasEmpresas _consultasEmpresas;
    private readonly FileUploads _fileUploads;

    public IndexModel(
      IConsultasEmpresas consultasEmpresas,
      IMediator mediator
    )
    {
      _consultasEmpresas = consultasEmpresas;
      _mediator = mediator;
      _fileUploads = new FileUploads(); 
    }

    #region EMPRESAS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] EmpresasModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var empresas = await _consultasEmpresas.Listar(custom);

        foreach (var emp in empresas)
        {
          var rutacompleta = ConfiguracionProyecto.DISK + emp.RTAFTO;
          emp.RTAFTO = rutacompleta;
        }

        var totalRows = empresas?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = empresas, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar las empresas.", error = ex.Message });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoEmpresaInsertar comando)
    {
      try
      {
        if (comando.FTO != null && comando.FTO.Length > 0)
        {
          comando.RTAFTO = await _fileUploads.UploadFileAsync("CCFIRMA/EMPRESAS", comando.FTO); ;
        }

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
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoEmpresaEditar comando)
    {
      try
      {

        if (!string.IsNullOrEmpty(comando.RTAFTO) && comando.RTAFTO.Contains(ConfiguracionProyecto.DISK))
          comando.RTAFTO = comando.RTAFTO.Replace(ConfiguracionProyecto.DISK, "");


        if (comando.FTO != null && comando.FTO.Length > 0)
        {
          if (!string.IsNullOrEmpty(comando.RTAFTO))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAFTO);

          comando.RTAFTO = await _fileUploads.UploadFileAsync("CCFIRMA/EMPRESAS", comando.FTO);
        }


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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoEmpresaEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

  }
}
