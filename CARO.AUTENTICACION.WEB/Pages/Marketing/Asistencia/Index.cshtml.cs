using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.MARKETING;
using CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA;
using CARO.DATOS.MODELO.MARKETING.ASISTENCIA;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Font;
using QRCoder;
using iText.IO.Image;
using iText.Layout;
using System.IO.Compression;


namespace CARO.AUTENTICACION.WEB.Pages.Marketing.Asistencia
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasAsistencia _consultasAsistencia;
    private readonly FileUploads _fileUploads;

    public IndexModel(
      IConsultasAsistencia consultasAsistencia,
      IMediator mediator
    )
    {
      _consultasAsistencia = consultasAsistencia;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    #region CALENDARIO
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] AsistenciaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var calendario = await _consultasAsistencia.Listar(custom);
        var totalRows = calendario?.FirstOrDefault()?.TOTALROWS ?? 0;

        return new JsonResult(new
        {
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = calendario,
          draw = custom.DRAW
        });
      }
      catch (FormatException)
      {
        return BadRequest(new { message = "Formato de ID no válido." });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = "Ocurrió un error inesperado: " + ex.Message });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoCalendarioInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoCalendarioEditar comando)
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoCalendarioEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region PARTICIPANTES
    [HttpGet]
    public async Task<IActionResult> OnGetParticipantesAsync([FromQuery] ParticipantesModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var participantes = await _consultasAsistencia.ListarParticipantes(custom);
        var totalRows = participantes?.FirstOrDefault()?.TOTALROWS ?? 0;

        return new JsonResult(new
        {
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = participantes,
          draw = custom.DRAW
        });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = "Ocurrió un error inesperado: " + ex.Message });
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetQRDownloadAsync([FromQuery] ParticipantesModel custom)
    {
      try
      {
        var participantes = await _consultasAsistencia.ListarParticipantes(custom);

        if (participantes == null || !participantes.Any())
        {
          return BadRequest(new { message = "No se encontraron participantes." });
        }

        // Solo obtén el archivo de plantilla una vez
        var archivoStream = await _fileUploads.ObtenerFile(participantes.First().RTAPDF);
        using (var tempStream = new MemoryStream())
        {
          await archivoStream.CopyToAsync(tempStream);
          tempStream.Position = 0;

          if (custom.IND == 1)
          {
            var base64String = await GeneratePdfBase64(tempStream, participantes.First());
            return new JsonResult(new { data = base64String, nombre = participantes.First().NOMBRES });
          }
          else if (custom.IND == 2)
          {
            var zipBase64 = await GenerateZipForParticipants(tempStream, participantes);
            return new JsonResult(new { data = zipBase64, nombre = "Credenciales Participantes" });
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = "Ocurrió un error inesperado: " + ex.Message });
      }

      return BadRequest(new { message = "Ocurrió un error inesperado." });
    }

    private async Task<string> GeneratePdfBase64(Stream templateStream, ParticipantesModel participante)
    {
      using (var outputStream = new MemoryStream())
      using (var tempStream = new MemoryStream())
      {
        templateStream.Position = 0; // Reinicia la posición del flujo de plantilla

        using (PdfReader pdfReader = new PdfReader(templateStream))
        using (PdfWriter pdfWriter = new PdfWriter(outputStream))
        using (PdfDocument pdfDocument = new PdfDocument(pdfReader, pdfWriter))
        {
          var page = pdfDocument.GetFirstPage();
          var canvas = new PdfCanvas(page);
          var font = PdfFontFactory.CreateFont();

          canvas.BeginText()
              .SetFontAndSize(font, 12)
              .MoveText(participante.EJEX ?? 0, participante.EJEY ?? 0)
              .ShowText(participante.NOMBRES)
              .EndText();

          using (var qrGenerator = new QRCodeGenerator())
          {
            using (var qrCodeData = qrGenerator.CreateQrCode(participante.CODIGO, QRCodeGenerator.ECCLevel.Q))
            using (var qrCode = new QRCode(qrCodeData))
            {
              using (var qrCodeImage = qrCode.GetGraphic(10))
              {
                using (var qrStream = new MemoryStream())
                {
                  qrCodeImage.Save(qrStream, System.Drawing.Imaging.ImageFormat.Png);
                  qrStream.Position = 0;
                  var imageData = ImageDataFactory.Create(qrStream.ToArray());

                  var qrImage = new iText.Layout.Element.Image(imageData);
                  qrImage.SetWidth(100);
                  qrImage.SetHeight(100);
                  qrImage.SetFixedPosition(participante.EJEX2 ?? 0, participante.EJEY2 ?? 0);

                  var document = new Document(pdfDocument);
                  document.Add(qrImage);
                }
              }
            }
          }
        }

        var pdfBytes = outputStream.ToArray();
        return Convert.ToBase64String(pdfBytes);
      }
    }

    private async Task<string> GenerateZipForParticipants(Stream templateStream, IEnumerable<ParticipantesModel> participantes)
    {
      using (var zipStream = new MemoryStream())
      {
        using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
        {
          var tasks = participantes.Select(async participante =>
          {
            var base64Pdf = await GeneratePdfBase64(templateStream, participante);
            var pdfBytes = Convert.FromBase64String(base64Pdf);
            var zipEntry = archive.CreateEntry($"{participante.NOMBRES}.pdf", CompressionLevel.Optimal);
            using (var entryStream = zipEntry.Open())
            {
              await entryStream.WriteAsync(pdfBytes, 0, pdfBytes.Length);
            }
          });

          await Task.WhenAll(tasks);
        }

        return Convert.ToBase64String(zipStream.ToArray());
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddParticipanteAsync([FromForm] ComandoParticipanteInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateParticipanteAsync([FromForm] ComandoParticipanteEditar comando)
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
    public async Task<IActionResult> OnPostDeleteParticipanteAsync([FromForm] ComandoParticipanteEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region PARTICIPANTES
    [HttpGet]
    public async Task<IActionResult> OnGetAsistenciasAsync([FromQuery] AsistenciaFechaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var participantes = await _consultasAsistencia.ListarAsistencias(custom);
        var totalRows = participantes?.FirstOrDefault()?.TOTALROWS ?? 0;

        return new JsonResult(new
        {
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = participantes,
          draw = custom.DRAW
        });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = "Ocurrió un error inesperado: " + ex.Message });
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetAsistenciasParticipanteAsync([FromQuery] AsistenciaFechaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var participantes = await _consultasAsistencia.ListarAsistenciasParticipante(custom);
        var totalRows = participantes?.FirstOrDefault()?.TOTALROWS ?? 0;

        return new JsonResult(new
        {
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = participantes,
          draw = custom.DRAW
        });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = "Ocurrió un error inesperado: " + ex.Message });
      }
    }


    [HttpPost]
    public async Task<IActionResult> OnPostAddAsistenciaAsync([FromForm] ComandoAsistenciaAgregar comando)
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



    #endregion


    #region CONFIGURACION

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateConfigAsync([FromForm] ComandoEditarConfiguracion comando)
    {
      try
      {

        if (!string.IsNullOrEmpty(comando.RTAFTO) && comando.RTAFTO.Contains(ConfiguracionProyecto.DISK))
          comando.RTAFTO = comando.RTAFTO.Replace(ConfiguracionProyecto.DISK, "");


        if (comando.FILE != null && comando.FILE.Length > 0)
        {
          if (!string.IsNullOrEmpty(comando.RTAFTO))
            await _fileUploads.DeleteDirectoryAsync(comando.RTAFTO);

          comando.RTAFTO = await _fileUploads.UploadFileAsync("CCFIRMA/CURSOS/PLANTILLAS/QR", comando.FILE);
        }


        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (IOException ioEx)
      {
        return StatusCode(500, "Error al manejar los archivos: " + ioEx.Message);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    #endregion
  }
}
