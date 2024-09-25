using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CURSO;
using CARO.DATOS.MODELO.COM.CURSO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Cursos
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

    #region CURSOS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] CursoModel custom)
    {
      try
      {
        var cursos = await _consultasCurso.Listar(custom);
        cursos.ForEach(curso =>
        {
          curso.IMAGEN = ConfiguracionProyecto.DISK + curso.RTAIMG;
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
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoCursoInsertar comando)
    {
      try
      {
        if (comando.IMG != null && comando.IMG.Length > 0)
        {
          comando.RTAIMG = await _fileUploads.UploadFileAsync("CCFIRMA/CURSOS", comando.IMG); ;
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
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoCursoEditar comando)
    {
      try
      {
        if (!string.IsNullOrEmpty(comando.RTAIMG) && comando.RTAIMG.Contains(ConfiguracionProyecto.DISK))
          comando.RTAIMG = comando.RTAIMG.Replace(ConfiguracionProyecto.DISK, "");


        if (comando.IMG != null && comando.IMG.Length > 0)
        {
          if (!string.IsNullOrEmpty(comando.RTAIMG))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAIMG);

          comando.RTAIMG = await _fileUploads.UploadFileAsync("CCFIRMA/CURSOS", comando.IMG);
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoCursoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion


    #region METODOS
    private async Task<string> GuardarImagenAsync(IFormFile imagen)
    {
      string folderPath = Path.Combine(ConfiguracionProyecto.DISK, "CCFIRMA", "COMERCIAL", "CURSOS");
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
