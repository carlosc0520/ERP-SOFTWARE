using CARO.CONFIG;
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

    private readonly IConsultasCurso _consultasCurso;

    public IndexModel(
      IConsultasCurso consultasCurso,
      IMediator mediator
    )
    {
      _consultasCurso = consultasCurso;
      _mediator = mediator;
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
          if (curso.ID != null)
          {
            string imagePath = Path.Combine(ConfiguracionProyecto.DISK, curso.RTAIMG);

            if (System.IO.File.Exists(imagePath))
            {
              byte[] imageBytes = System.IO.File.ReadAllBytes(imagePath);
              curso.IMGFILE = Convert.ToBase64String(imageBytes);
              curso.TYPE = GetMimeType(imagePath);
              curso.NAME = Path.GetFileName(imagePath);
            }
            else curso.IMGFILE = null;

          }
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
        string filePath = await GuardarImagenAsync(comando.IMGCOURSE);
        comando.RTAIMG = filePath.Replace(ConfiguracionProyecto.DISK, "");
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);

        var result = await _mediator.Send(comando);

        if (!result.EsSatisfactoria && System.IO.File.Exists(filePath))
          System.IO.File.Delete(filePath);

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
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);

        if (comando.IMGCOURSE != null && comando.IMGCOURSE.Length > 0)
        {
          comando.RTAIMG = ConfiguracionProyecto.DISK + comando.RTAIMG;
          if (!string.IsNullOrEmpty(comando.RTAIMG) && System.IO.File.Exists(comando.RTAIMG))
            System.IO.File.Delete(comando.RTAIMG);


          string filePath = await GuardarImagenAsync(comando.IMGCOURSE);
          comando.RTAIMG = filePath.Replace(ConfiguracionProyecto.DISK, "");
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

    #region METODOS
    private async Task<string> GuardarImagenAsync(IFormFile imagen)
    {
      string folderPath = Path.Combine(ConfiguracionProyecto.DISK, "CCFIRMA", "COMERCIAL", "CURSOS", "DETALLE");
      if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

      string fileName = Path.GetFileName(imagen.FileName);
      string filePath = Path.Combine(folderPath, fileName);

      using (var stream = new FileStream(filePath, FileMode.Create))
      {
        await imagen.CopyToAsync(stream);
      }

      return filePath;
    }

    private string GetMimeType(string filePath)
    {
      var extension = Path.GetExtension(filePath).ToLowerInvariant();
      return extension switch
      {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".bmp" => "image/bmp",
        ".tiff" => "image/tiff",
        _ => "application/octet-stream"
      };
    }

    #endregion
  }
}
