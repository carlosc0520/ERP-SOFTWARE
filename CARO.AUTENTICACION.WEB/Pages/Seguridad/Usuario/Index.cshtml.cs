using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.SEG;
using CARO.DATOS.EVENTOS.Comandos.SEG.USUARIO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Seguridad.Usuario
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;

    public IndexModel(
      IMediator mediator
    )
    {
      _mediator = mediator;
    }

    #region LOGIN
    [HttpPost]
    public async Task<IActionResult> OnPostLoginResetPasswordAsync([FromForm] ComandoLoginResetPassword comando)
    {
      try
      {
        comando.ID = int.Parse(HttpContextDraw.User(HttpContext, 2));
        comando.CORREO = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Error al cambiar contraseña de usuario.",
          detalle = ex.Message
        });
      }
    }
    #endregion LOGIN
  }
}
