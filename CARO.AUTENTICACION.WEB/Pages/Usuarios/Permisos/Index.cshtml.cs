using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.USUARIOS;
using CARO.DATOS.EVENTOS.Comandos.USUARIOS.PERMISOS;
using CARO.DATOS.MODELO.USUARIOS.PERMISOS;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Usuarios.Permisos
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasPermisos _consultasPermisos;

    public IndexModel(
      IConsultasPermisos consultasPermisos,
      IMediator mediator
    )
    {
      _consultasPermisos = consultasPermisos;
      _mediator = mediator;
    }

    #region ROLES
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] PermisosModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var permisos = await _consultasPermisos.ListarPermisos(custom);
        var totalRows = permisos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = permisos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los cursos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoPermisoInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoPermisoEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoPermisoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    #region ROLES
    [HttpGet]
    public async Task<IActionResult> OnGetVistasAsync([FromQuery] VistaModel custom)
    {
      try
      {
        var vistas = await _consultasPermisos.ListarVistas(custom);
        var totalRows = vistas?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = vistas, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar las vistas.", error = ex.Message });
      }

    }

    #endregion
  }
}
