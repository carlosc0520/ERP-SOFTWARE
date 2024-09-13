using CARO.DATOS.CONSULTAS.SEG;
using CARO.DATOS.MODELO.SEG.GRUPODATO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Seguridad.GrupoDato
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasGrupoDato _consultasGrupoDato;

    public IndexModel(
      IConsultasGrupoDato consultasGrupoDato,
      IMediator mediator
    )
    {
      _consultasGrupoDato = consultasGrupoDato;
      _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> OnGetObtenerAllAsync([FromQuery] GrupoDatoModel custom)
    {
      var grupoDatos = await _consultasGrupoDato.ObtenerAll(custom);
      var totalRows = grupoDatos?.FirstOrDefault()?.TOTALROWS ?? 0;

      return new JsonResult(new
      {
        recordsTotal = totalRows,
        recordsFiltered = totalRows,
        data = grupoDatos,
        draw = 1
      });
    }
  }
}
