using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CLIENTE;
using CARO.DATOS.MODELO.COM.CLIENTE;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.IdentityModel.Tokens;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Clientes
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;
    private readonly IConsultasClientes _consultasClientes;

    public IndexModel(
      IConsultasClientes consultasClientes,
      IMediator mediator
    )
    {
      _consultasClientes = consultasClientes;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    #region CLIENTES
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] ClienteModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasClientes.Listar(custom);
        data.ForEach(row =>
        {
          if (!row.RTAIMG.IsNullOrEmpty()) row.RTAIMG = ConfiguracionProyecto.DISK + row.RTAIMG;
        });

        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpGet]
    public async Task<IActionResult> OnGetReporteAsync([FromQuery] ReporteSeguimientoModel custom)
    {
      try
      {
        var data = await _consultasClientes.ListarReporte(custom);
        return new JsonResult(new { success = true, data = data });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoClienteInsertar comando)
    {
      try
      {

        comando.RTAIMG = comando.IMG?.Length > 0 ? await _fileUploads.UploadFileAsync("CCFIRMA/CLIENTES", comando.IMG) : comando.RTAIMG;
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        if (!result.EsSatisfactoria)
          await _fileUploads.DeleteDirectoryAsync(comando.RTAIMG);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoClienteEditar comando)
    {
      try
      {
        if (!string.IsNullOrEmpty(comando.RTAIMG) && comando.RTAIMG.Contains(ConfiguracionProyecto.DISK))
          comando.RTAIMG = comando.RTAIMG.Replace(ConfiguracionProyecto.DISK, "");

        if (comando.IMG?.Length > 0)
        {
          if (!string.IsNullOrEmpty(comando.RTAIMG))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAIMG);

          comando.RTAIMG = await _fileUploads.UploadFileAsync("CCFIRMA/CLIENTES", comando.IMG);
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoClienteEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    #region CLIENTES
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarSeguimientoAsync([FromQuery] SeguimientoClienteModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasClientes.ListarDetalle(custom);
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddSeguimientoAsync([FromForm] ComandoSeguimientoClienteInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateSeguimientoAsync([FromForm] ComandoSeguimientoClienteEditar comando)
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
    public async Task<IActionResult> OnPostDeleteSeguimientoAsync([FromForm] ComandoSeguimientoClienteEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion
  }
}
