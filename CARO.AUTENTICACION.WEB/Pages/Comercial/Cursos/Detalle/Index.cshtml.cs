using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CURSO;
using CARO.DATOS.MODELO.COM.CURSO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Cursos.Detalle
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasCurso _consultasCurso;
    private readonly FileUploads _fileUploads;

    public IndexModel(
      IConsultasCurso consultasCurso,
      IMediator mediator
    )
    {
      _consultasCurso = consultasCurso;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }


    #region PROFESORES
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] ProfesoresModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var profesores = await _consultasCurso.ListarProfesores(custom);
        foreach (var profesor in profesores)
        {
          profesor.RTAFTO = ConfiguracionProyecto.DISK + profesor.RTAFTO;
        }
        var totalRows = profesores?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = profesores, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los profesores.", error = ex.Message });
      }

    } 

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoProfesorInsertar comando)
    {
      try
      {
        if (comando.FTO != null && comando.FTO.Length > 0)
        {
          comando.RTAFTO = await _fileUploads.UploadFileAsync($"CCFIRMA/CURSOS/{comando.IDCRSO}", comando.FTO); ;
        }

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
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoProfesorEditar comando)
    {
      try
      {
        if (!string.IsNullOrEmpty(comando.RTAFTO) && comando.RTAFTO.Contains(ConfiguracionProyecto.DISK))
          comando.RTAFTO = comando.RTAFTO.Replace(ConfiguracionProyecto.DISK, "");

        if (comando.FTO != null && comando.FTO.Length > 0 && comando.DELETE == false)
        {
          if (!string.IsNullOrEmpty(comando.RTAFTO))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAFTO);

          comando.RTAFTO = await _fileUploads.UploadFileAsync($"CCFIRMA/CURSOS/{comando.IDCRSO}", comando.FTO);
        }

        if (comando.DELETE == true && comando.RTAFTO != null)
        {
          await _fileUploads.DeleteDirectoryAsync(comando.RTAFTO);
          comando.RTAFTO = null;
        }

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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoProfesorEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    #region SPONSORS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarSponsorAsync([FromQuery] SponsorsModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var sponsors = await _consultasCurso.ListarSponsors(custom);
        foreach (var sport in sponsors)
        {
          sport.RTAFTO = ConfiguracionProyecto.DISK + sport.RTAFTO;
        }
        var totalRows = sponsors?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = sponsors, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los sponsors.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddSponsorAsync([FromForm] ComandoSponsorInsertar comando)
    {
      try
      {
        if (comando.FTO != null && comando.FTO.Length > 0)
        {
          comando.RTAFTO = await _fileUploads.UploadFileAsync($"CCFIRMA/CURSOS/{comando.IDCRSO}/SPONSORS", comando.FTO);
        }

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
    public async Task<IActionResult> OnPostUpdateSponsorAsync([FromForm] ComandoSponsorEditar comando)
    {
      try
      {
        if (!string.IsNullOrEmpty(comando.RTAFTO) && comando.RTAFTO.Contains(ConfiguracionProyecto.DISK))
          comando.RTAFTO = comando.RTAFTO.Replace(ConfiguracionProyecto.DISK, "");

        if (comando.FTO != null && comando.FTO.Length > 0 && comando.DELETE == false)
        {
          if (!string.IsNullOrEmpty(comando.RTAFTO))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAFTO);

          comando.RTAFTO = await _fileUploads.UploadFileAsync($"CCFIRMA/CURSOS/{comando.IDCRSO}/SPONSORS", comando.FTO);
        }

        if (comando.DELETE == true && comando.RTAFTO != null)
        {
          await _fileUploads.DeleteDirectoryAsync(comando.RTAFTO);
          comando.RTAFTO = null;
        }

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
    public async Task<IActionResult> OnPostDeleteSponsorAsync([FromForm] ComandoSponsorEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion
  }
}
