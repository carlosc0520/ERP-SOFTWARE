using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.MANTENIMIENTOS;
using CARO.DATOS.CONSULTAS.MARCAS.AIC;
using CARO.DATOS.MODELO.MANTENIMIENTOS.GRUPODATO;
using CARO.DATOS.MODELO.MARCAS.AIC;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Marcas.AIC
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasAIC _consultasAIC;

    public IndexModel(
      IConsultasAIC consultasAIC,
      IMediator mediator
    )
    {
      _consultasAIC = consultasAIC;
      _mediator = mediator;
    }

    #region INICIO
    [HttpGet]
    public async Task<IActionResult> OnGetCourseFistTopAsync([FromQuery] CursosModelAIC custom)
    {
      try
      {
        return new JsonResult(new { data = await _consultasAIC.CourseFistTop(custom), success = true });
      }
      catch
      {
        return new JsonResult(new { data = new CursosModelAIC(), success = false });
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetTeachersAsync([FromQuery] TeachesModelAIC custom)
    {
      try
      {
        return new JsonResult(new { data = await _consultasAIC.Teachers(custom), success = true });
      }
      catch
      {
        return new JsonResult(new { data = new TeachesModelAIC(), success = false });
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetAuspiciadoresAsync([FromQuery] SponsorsModelAIC custom)
    {
      try
      {
        return new JsonResult(new { data = await _consultasAIC.Auspiciadores(custom), success = true });
      }
      catch
      {
        return new JsonResult(new { data = new SponsorsModelAIC(), success = false });
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetCoursesAllAsync([FromQuery] CursosModelAIC custom)
    {
      try
      {
        return new JsonResult(new { data = await _consultasAIC.CoursesAll(custom), success = true });
      }
      catch
      {
        return new JsonResult(new { data = new CursosModelAIC(), success = false });
      }
    }

    #endregion
  }
}
