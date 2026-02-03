using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CASO;
using CARO.DATOS.MODELO.COM.CASO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Casos
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasCasosMasivos _consultasCasosMasivos;
    private readonly FileUploads _fileUploads;
    private string PATHCASOS = "CCFIRMA/COMERCIAL/CASOSMASIVOS";

    public IndexModel(
      IMediator mediator,
      IConsultasCasosMasivos consultasCasosMasivos
    )
    {
      _mediator = mediator;
      _consultasCasosMasivos = consultasCasosMasivos;
      _fileUploads = new FileUploads();
    }

    #region CASOS
    [HttpGet]
    public async Task<IActionResult> OnGetCasesAllAsync([FromQuery] CasoModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasCasosMasivos.ListarCasos(custom);

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostCasesAddAsync([FromForm] ComandoCasoInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Error al registrar el caso.",
          detalle = ex.Message // opcional (puedes quitarlo en producción)
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostCasesUpdateAsync([FromForm] ComandoCasoEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al actualizar el caso."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostCasesDeleteAsync([FromForm] ComandoCasoEliminar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return new JsonResult(new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al eliminar el caso.",
          error = ex.Message
        })
        {
          StatusCode = StatusCodes.Status500InternalServerError
        };
      }
    }
    #endregion CASOS
  }
}
