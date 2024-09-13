using CARO.DATOS.EVENTOS.Comandos.SEG.LOGIN;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Login
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly ITokenValidationService _tokenValidationService;
    private readonly IMediator _mediator;

    public IndexModel(
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
      return new JsonResult(new {
          success = success 
      });
    }

    [HttpPost]
    public async Task<IActionResult> OnPostLoginAsync([FromForm] ComandoLoguearUsuario comando)
    {
      var result = await _mediator.Send(comando);
      if (!result.Succeeded)
      {
        return BadRequest(new { message = result.ErrorMessage });
      }

      return new JsonResult(result);
    }

  }
}
