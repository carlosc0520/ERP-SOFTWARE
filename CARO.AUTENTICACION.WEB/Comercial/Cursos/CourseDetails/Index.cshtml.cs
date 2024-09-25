using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CURSO;
using CARO.DATOS.MODELO.COM.CURSO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Cursos.CourseDetails
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel 
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;
    private readonly IConsultasCurso _consultasCurso;

    public IndexModel(
      IConsultasCurso consultasCurso,
      IMediator mediator
    )
    {
      _consultasCurso = consultasCurso;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    #region detalle-curso
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] CursoModel custom)
    {
      try
      {
        var cursos = await _consultasCurso.ListarDetalleCurso(custom);
        cursos.ForEach(curso =>
        {
          if (curso.ID != null) curso.RTAIMG = ConfiguracionProyecto.DISK + curso.RTAIMG;
        });


        var totalRows = cursos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = cursos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los cursos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoDetalleCursoInsertar comando)
    {
      try
      {
        if (comando.IMGCOURSE != null && comando.IMGCOURSE.Length > 0)
        {
          comando.RTAIMG = await _fileUploads.UploadFileAsync($"CCFIRMA/CURSOS/{comando.IDCRSO}/DETALLE", comando.IMGCOURSE); ;
        }

        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        if (!result.EsSatisfactoria)
          await _fileUploads.DeleteDirectoryAsync(comando.RTAIMG);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoDetalleCursoEditar comando)
    {
      try
      {
        if (!string.IsNullOrEmpty(comando.RTAIMG) && comando.RTAIMG.Contains(ConfiguracionProyecto.DISK))
          comando.RTAIMG = comando.RTAIMG.Replace(ConfiguracionProyecto.DISK, "");

        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);

        if (comando.IMGCOURSE != null && comando.IMGCOURSE.Length > 0)
        {
          if (!string.IsNullOrEmpty(comando.RTAIMG))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAIMG);

          comando.RTAIMG = await _fileUploads.UploadFileAsync($"CCFIRMA/CURSOS/{comando.IDCRSO}/DETALLE", comando.IMGCOURSE); ;
        }

        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoDetalleCursoEliminar comando)
    {
      try
      {
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
