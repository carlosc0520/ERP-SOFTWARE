using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.USUARIOS;
using CARO.DATOS.EVENTOS.Comandos.USUARIOS.ROLES;
using CARO.DATOS.MODELO.USUARIOS.ROLES;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace CARO.AUTENTICACION.WEB.Pages.Usuarios.Roles
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasRoles _consultasRoles;

    public IndexModel(
      IConsultasRoles consultasRoles,
      IMediator mediator
    )
    {
      _consultasRoles = consultasRoles;
      _mediator = mediator;
    }

    #region ROLES
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] RolesModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var roles = await _consultasRoles.Listar(custom);
        var totalRows = roles?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = roles, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los cursos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoRolInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoRolEditar comando)
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoRolEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    #region PERMISOS-X-ROL
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarPermisosAsync([FromQuery] PermisosModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var roles = await _consultasRoles.ListarPermisos(custom);
        var totalRows = roles?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = roles, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los cursos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddPermisosAsync([FromForm] ComandoRolActualizar comando)
    {
      try
      {
        List<ComandoPermisosActualizar> customList = JsonSerializer.Deserialize<List<ComandoPermisosActualizar>>(comando.DATA);
        comando.DATOS = customList;
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarPermisosItemsAsync([FromQuery] PermisosItemsModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var permisosItems = await _consultasRoles.ListarPermisosItems(custom);
        var totalRows = permisosItems?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = permisosItems, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los cursos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddPermisosItemsAsync([FromForm] ComandoPermisoActualizar comando)
    {
      try
      {
        List<ComandoPermisosActualizarItems> customList = JsonSerializer.Deserialize<List<ComandoPermisosActualizarItems>>(comando.DATA);
        comando.DATOS = customList;
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    #endregion
  }
}
