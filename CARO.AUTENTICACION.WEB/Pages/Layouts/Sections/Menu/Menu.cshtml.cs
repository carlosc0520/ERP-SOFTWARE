using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace JANOX.INICIO.WEB.Pages.Layouts.Sections.Menu
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class MenuModel : PageModel
  {

    private readonly IMediator _mediator;
    private readonly IConsultasMenu _consultasMenu;

    public MenuModel(
      IConsultasMenu consultasMenu,
      IMediator mediator
    )
    {
      _consultasMenu = consultasMenu;
      _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> OnGetObtenerAsync([FromQuery] CARO.DATOS.MODELO.COM.MENU.MenuModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        custom.IDPRSNA = int.Parse(HttpContextDraw.User(HttpContext, 2));
        custom.ROWS = 99999;
        custom.INIT = 0;

        var submodulos = await _consultasMenu.Listar(custom);
        var totalRows = submodulos?.FirstOrDefault()?.TOTALROWS ?? 0;

        custom.UEDCN = HttpContextDraw.User(HttpContext, 3);
        custom.DESC = HttpContextDraw.User(HttpContext, 4);

        return new JsonResult(new
        {
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = submodulos,
          draw = custom.DRAW,
          usuario = custom
        });
      }
      catch (FormatException ex)
      {
        return BadRequest(new { message = "Error en el formato de los datos.", detalle = ex.Message });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { message = "Ocurrió un error inesperado.", detalle = ex.Message });
      }
    }

  }
}
