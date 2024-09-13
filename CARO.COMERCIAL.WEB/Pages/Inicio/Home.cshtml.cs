using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.COMERCIAL.WEB.Pages.Inicio
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class HomeModel : PageModel
  {
    private readonly ITokenValidationService _tokenValidationService;
    private readonly IMediator _mediator;

    public HomeModel(
      IMediator mediator,
      ITokenValidationService tokenValidationService
    )
    {
      _mediator = mediator;
      _tokenValidationService = tokenValidationService;
    }

    [HttpGet]
    public async Task<IActionResult> OnGetValidateAsync(string accessToken, string? url = null)
    {
      bool success = await _tokenValidationService.IsTokenValid(accessToken);
      return new JsonResult(new
      {
        success = success
      });
    }
  }
}
