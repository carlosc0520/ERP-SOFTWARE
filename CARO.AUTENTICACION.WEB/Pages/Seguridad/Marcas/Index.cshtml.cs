using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.SEG;
using CARO.DATOS.MODELO.SEG.MARCA;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Seguridad.Marcas
{

  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasMarca _consultasMarca;

    public IndexModel(
      IConsultasMarca consultasMarca,
      IMediator mediator
    )
    {
      _consultasMarca = consultasMarca;
      _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> OnGetObtenerAsync([FromQuery] MarcaModel custom)
    {
      HttpContextDraw.SetModelValues(HttpContext, custom);
      var marcas = await _consultasMarca.Obtener(custom);
      var totalRows = marcas?.FirstOrDefault()?.TOTALROWS ?? 0;

      return new JsonResult(new
      {
        recordsTotal = totalRows,
        recordsFiltered = totalRows,
        data = marcas,
        draw = 1
      });
    }
  }
}
