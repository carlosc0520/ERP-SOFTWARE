using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.MANTENIMIENTOS;
using CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.GRUPODATO;
using CARO.DATOS.MODELO.MANTENIMIENTOS.GRUPODATO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Mantenimientos.GrupoDato
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasGrupoDatoGD _consultasGrupoDatoGD;

    public IndexModel(
      IConsultasGrupoDatoGD consultasGrupoDatoGD,
      IMediator mediator
    )
    {
      _consultasGrupoDatoGD = consultasGrupoDatoGD;
      _mediator = mediator;
    }

    #region GRUPO-DATO
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] GrupoDatoGDModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var grupoDatoGD = await _consultasGrupoDatoGD.Listar(custom);
        var totalRows = grupoDatoGD?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = grupoDatoGD, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los grupo dato.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoGrupoDatoInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoGrupoDatoEditar comando)
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoGrupoDatoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region GRUPO-DATO-DETALLE
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarDetalleAsync([FromQuery] GrupoDatoDetalleGDModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var grupoDatoGDDetalle = await _consultasGrupoDatoGD.ListarDetalle(custom);
        var totalRows = grupoDatoGDDetalle?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = grupoDatoGDDetalle, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los detalle de grupo dato.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddDetalleAsync([FromForm] ComandoGrupoDatoDetInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateDetalleAsync([FromForm] ComandoGrupoDatoDetEditar comando)
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
    public async Task<IActionResult> OnPostDeleteDetalleAsync([FromForm] ComandoGrupoDatoDetEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion
  }
}
