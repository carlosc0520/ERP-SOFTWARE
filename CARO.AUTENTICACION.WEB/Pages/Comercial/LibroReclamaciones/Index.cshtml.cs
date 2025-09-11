using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.CCFIRMA;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.MODELO.CCFIRMA;
using CARO.DATOS.MODELO.COM.CLIENTE;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.LibroReclamaciones
{
  //IConsultasLibroReclamaciones
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;
    private readonly IConsultasLibroReclamaciones _consultasLibroReclamaciones;

    public IndexModel(
       IConsultasLibroReclamaciones consultasLibroReclamaciones,
       IMediator mediator
    )
    {
      _consultasLibroReclamaciones = consultasLibroReclamaciones;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] LibroReclamacionModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasLibroReclamaciones.ListarReclamos(custom);
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }
    }
  }
}
