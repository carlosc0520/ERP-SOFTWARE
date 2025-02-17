using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA;
using CARO.DATOS.MODELO.COM.PLANTILLA;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Plantillas
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;
    private readonly IConsultasPlantilla _consultasPlantilla;

    public IndexModel(
      IConsultasPlantilla consultasPlantilla,
      IMediator mediator
    )
    {
      _consultasPlantilla = consultasPlantilla;
      _fileUploads = new FileUploads();
      _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] PlantillaModel custom)
    {
      HttpContextDraw.SetModelValues(HttpContext, custom);
      custom.IDMRCA = int.TryParse(HttpContextDraw.User(HttpContext, 5).ToString(), out int result) ? result : 0;
      var plantillas = await _consultasPlantilla.Listar(custom);
      var totalRows = plantillas?.FirstOrDefault()?.TOTALROWS ?? 0;

      return new JsonResult(new
      {
        recordsTotal = totalRows,
        recordsFiltered = totalRows,
        data = plantillas,
        draw = custom.DRAW
      });
    }

    [HttpGet]
    public async Task<IActionResult> OnGetObtenerFileAsync([FromQuery] PlantillaModel comando)
    {
      try
      {
        if (string.IsNullOrEmpty(comando.RTAPLNTLLA)) return BadRequest("La ruta del archivo no está especificada.");

        var memoryStream = await _fileUploads.ObtenerFile(comando.RTAPLNTLLA);

        byte[] fileBytes;
        using (var ms = new MemoryStream())
        {
          await memoryStream.CopyToAsync(ms);
          fileBytes = ms.ToArray();
        }

        string fileExtension = Path.GetExtension(comando.RTAPLNTLLA).ToLower();
        string fileName = Path.GetFileName(comando.RTAPLNTLLA);

        string mimeType = fileExtension switch
        {
          ".jpg" => "image/jpeg",
          ".jpeg" => "image/jpeg",
          ".png" => "image/png",
          ".gif" => "image/gif",
          ".pdf" => "application/pdf",
          ".doc" => "application/msword",
          ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ".xls" => "application/vnd.ms-excel",
          ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ".txt" => "text/plain",
          _ => "application/octet-stream" 
        };

        string base64String = Convert.ToBase64String(fileBytes);
        string dataUrl = $"data:{mimeType};base64,{base64String}";

        return new JsonResult(new { file = dataUrl, fileName = fileName });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoPlantillaInsertar comando)
    {
      try
      {
        comando.IDMRCA = ObtenerIdMarca();
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);

        if (comando.ARCHVO != null && comando.ARCHVO.Length > 0)
        {
          comando.RTAPLNTLLA = await _fileUploads.UploadFileAsync("CCFIRMA/PLANTILLAS", comando.ARCHVO); 
        }

        var result = await _mediator.Send(comando);
        if (!result.EsSatisfactoria)
          await _fileUploads.DeleteDirectoryAsync(comando.RTAPLNTLLA);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoPlantillaEditar comando)
    {
      try
      {
        comando.IDMRCA = ObtenerIdMarca();
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);

        if (comando.ARCHVO != null && comando.ARCHVO.Length > 0)
        {
          if (!string.IsNullOrEmpty(comando.RTAPLNTLLA))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAPLNTLLA);

          comando.RTAPLNTLLA = await _fileUploads.UploadFileAsync("CCFIRMA/PLANTILLAS", comando.ARCHVO);
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoPlantillaEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #region METODOS
    private async Task<string> GuardarArchivoAsync(IFormFile archivo)
    {
      string folderPath = Path.Combine(ConfiguracionProyecto.DISK, "CCFIRMA", "COMERCIAL", "PLANTILLAS")
                          .Replace("\\", "/");
      if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

      string fileName = Path.GetFileName(archivo.FileName);
      string filePath = Path.Combine(folderPath, fileName);

      using (var stream = new FileStream(filePath, FileMode.Create))
      {
        await archivo.CopyToAsync(stream);
      }

      return filePath;
    }
    private int ObtenerIdMarca()
    {
      return int.TryParse(HttpContextDraw.User(HttpContext, 5).ToString(), out int r) ? r : 0;
    }
    #endregion
  }
}
