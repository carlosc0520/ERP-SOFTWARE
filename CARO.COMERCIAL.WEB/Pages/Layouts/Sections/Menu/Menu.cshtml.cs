using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.COMERCIAL.WEB.Pages.Layouts.Sections.Menu
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class MenuModel : PageModel
  {
    private readonly ITokenValidationService _tokenValidationService;
    private readonly IConsultasMenu _consultasMenu;
    private readonly IMediator _mediator;

    public MenuModel(
      IMediator mediator,
      IConsultasMenu consultasMenu,
      ITokenValidationService tokenValidationService
    )
    {
      _mediator = mediator;
      _consultasMenu = consultasMenu;
      _tokenValidationService = tokenValidationService;
    }

    [HttpGet]
    public async Task<IActionResult> OnGetListarAsync([FromQuery] CARO.DATOS.MODELO.COM.MENU.MenuModel custom)
    {
      HttpContextDraw.SetModelValues(HttpContext, custom);
      var menu = await _consultasMenu.Listar(custom);
      var totalRows = menu?.FirstOrDefault()?.TOTALROWS ?? 0;

      return new JsonResult(new
      {
        recordsTotal = totalRows,
        recordsFiltered = totalRows,
        data = menu,
        draw = custom.DRAW
      });
    }


  }
}
