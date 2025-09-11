using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.SOLICITUD;
using CARO.DATOS.MODELO.COM.SOLICITUD;
using ClosedXML.Excel;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Mail;
using System.Net;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Solicitudes
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasSolicitudes _consultasSolicitudes;
    private readonly FileUploads _fileUploads;
    private string filesPath = "CCFIRMA/SOLICITUDES";

    public IndexModel(
      IConsultasSolicitudes consultasSolicitudes,
      IMediator mediator
    )
    {
      _consultasSolicitudes = consultasSolicitudes;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    #region SOLICITUDES
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] SolicitudModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasSolicitudes.Listar(custom);

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarExportarAsync([FromQuery] SolicitudModel custom)
    {
      try
      {
        custom.ROWS = 100000;
        custom.INIT = 0;
        var datos = await _consultasSolicitudes.Listar(custom);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Reporte Solicitudes");

        // Título del reporte
        worksheet.Range("B2:E2").Merge().Value = "REPORTE DE SOLICITUDES";
        worksheet.Range("B2:E2").Style
            .Font.SetBold(true)
            .Font.SetFontSize(14)
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);

        // Datos personalizados
        worksheet.Cell("A4").Value = "Fecha solicitud:";
        worksheet.Cell("B4").Value = custom.FCHA;
        worksheet.Cell("A5").Value = "Sucursal:";
        worksheet.Cell("B5").Value = custom.DGDSUCRSLS;
        worksheet.Cell("A6").Value = "Estado:";
        worksheet.Cell("B6").Value = custom.DCESTDO;

        // Estilos de los datos personalizados
        worksheet.Range("A4:A6").Style.Font.SetBold(true);
        worksheet.Range("A4:A6").Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Right);
        worksheet.Range("B4:B6").Style.Font.SetBold(true);

        // Encabezados de la tabla
        string[] headers = { "Nombres", "Apellidos", "Celular", "Correo electrónico", "Solicitud de caso requerido", "Estado" };
        for (int i = 0; i < headers.Length; i++)
        {
          var cell = worksheet.Cell(7, i + 1);
          cell.Value = headers[i];
          cell.Style.Font.SetBold(true);
          cell.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#F47432"));
          cell.Style.Font.FontColor = XLColor.White;
          cell.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
          cell.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        }

        // Llenado de datos
        int row = 8;
        foreach (var item in datos)
        {
          worksheet.Cell(row, 1).Value = item.NMBRES;
          worksheet.Cell(row, 2).Value = item.APLLDS;
          worksheet.Cell(row, 3).Value = item.CELULAR;
          worksheet.Cell(row, 4).Value = item.CORREO;
          worksheet.Cell(row, 5).Value = item.COMENTARIOS;
          worksheet.Cell(row, 6).Value = item.DCESTDO;
          row++;
        }

        // Ajustar ancho de columnas para mejor visualización
        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        string base64File = Convert.ToBase64String(stream.ToArray());

        return new JsonResult(new { filename = "Reporte_Solicitudes.xlsx", success = true, fileBase64 = base64File });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }


    [HttpPost]
    public async Task<IActionResult> OnPostDownloadAsync([FromForm] SolicitudModel comando)
    {
      try
      {
        if (string.IsNullOrWhiteSpace(comando.FILES))
        {
          return BadRequest("No se especificaron archivos para descargar.");
        }

        var fileResult = await _fileUploads.DownloadFilesAsync(comando.FILES);

        if (fileResult == null || fileResult.FileContents.Length == 0)
        {
          return NotFound("No se pudo generar el archivo.");
        }

        if (comando.FILES.Contains(","))
        {
          return File(fileResult.FileContents, "application/zip", fileResult.FileDownloadName);
        }
        else
        {
          string fileName = Path.GetFileName(comando.FILES.Trim());
          string contentType = "application/octet-stream"; 
          return File(fileResult.FileContents, contentType, fileName);
        }
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
      }
    }


    [HttpPost]
    public async Task<IActionResult> OnPostUpdateEstadoAsync([FromForm] ComandoSolicitudEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        SolicitudModel custom = new SolicitudModel
        {
          ROWS = 1,
          INIT = 0,
          ID = comando.ID,
          CESTDO = comando.CESTDO
        };

        var dato = await _consultasSolicitudes.Listar(custom);
        SolicitudModel customData = dato.FirstOrDefault();

        if (comando.CESTDO == "3" && !string.IsNullOrWhiteSpace(customData.CORREO) && !string.IsNullOrWhiteSpace(comando.RCMNTRS))
        {
          string mensaje = GetEmailBody(customData, comando.RCMNTRS, 0);
          await SendEmailAsync(customData.CORREO, "Solicitud Rechazada", mensaje, null);
        }

        if (customData != null)
        {
          if (comando.CESTDO == "4" && !string.IsNullOrWhiteSpace(customData.ACORREO) && !string.IsNullOrWhiteSpace(comando.ACMNTRS))
          {


            var archivos = await _fileUploads.DownloadMultipleFilesAsync(comando.PATHS);

            if (archivos == null || archivos.Count == 0)
            {
              return NotFound("No se encontraron archivos para descargar.");
            }

      
            string mensaje = GetEmailBody(customData, comando.ACMNTRS, 1);
            await SendEmailAsync(customData.ACORREO, "Solicitud Aprobada", mensaje, archivos);

          }
        }


        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }
    private async Task SendEmailAsync(string toEmail, string subject, string body, List<FileContentResult> archivosAdjuntos)
    {
      using var smtpClient = new SmtpClient("smtp.gmail.com")
      {
        Port = 587,
        Credentials = new NetworkCredential(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, ConfiguracionProyecto.CORREOS_CONTACTO.KEY),
        EnableSsl = true,
      };

      using var mailMessage = new MailMessage
      {
        From = new MailAddress("formulariocaro@gmail.com", "CCFIRMA - CONSULTORIA"),
        Subject = subject,
        Body = body,
        IsBodyHtml = true
      };

      mailMessage.To.Add(toEmail);

      if (archivosAdjuntos != null && archivosAdjuntos.Count > 0)
      {
        foreach (var archivo in archivosAdjuntos)
        {
          var stream = new MemoryStream(archivo.FileContents);
          var attachment = new Attachment(stream, archivo.FileDownloadName, archivo.ContentType);
          mailMessage.Attachments.Add(attachment);
        }
      }

      await smtpClient.SendMailAsync(mailMessage);

      foreach (var attachment in mailMessage.Attachments)
      {
        attachment.Dispose();
      }
    }


    private string GetEmailBody(SolicitudModel comando, string comentarios, int indicador = 1)
    {
      return $@"
    <!DOCTYPE html>
    <html lang='es'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Solicitud de Servicio</title>
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #f4f7fc; margin: 0; padding: 0; color: #555; }}
            .container {{ width: 100%; max-width: 650px; margin: 30px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }}
            h2 {{ text-align: center; color: #2c3e50; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #e2e2e2; padding-bottom: 10px; }}
            .section-title {{ font-weight: bold; color: #34495e; margin-right: 5px; }}
            .details {{ background-color: #ecf0f1; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #bdc3c7; }}
            .footer {{ text-align: center; font-size: 14px; color: #7f8c8d; margin-top: 30px; border-top: 1px solid #ecf0f1; padding-top: 20px; }}
            .email-header {{ padding: 10px; background-color: #ff6c17ff; color: #ffffff; border-radius: 10px 10px 0 0; font-size: 18px; text-align: center; }}
            .signature {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #bdc3c7;
            }}
            .signature img {{
                max-width: 150px;
                margin-bottom: 10px;
            }}
            .signature p {{
                font-size: 14px;
                color: #34495e;
                margin: 5px 0;
            }}
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='email-header'>
                <h3>Detalles de la Solicitud de Servicio</h3>
            </div>
            <p style='margin-bottom: 20px'>{comentarios}</p>
            {(indicador == 1 ? $@"
            <p><span class='section-title'>Cliente:</span> {comando.APLLDS} {comando.NMBRES}</p>
            <p><span class='section-title'>Correo:</span> {comando.CORREO}</p>
            <p><span class='section-title'>Celular:</span> {comando.CELULAR}</p>
            <p><span class='section-title'>Comentarios:</span> {comando.COMENTARIOS}</p>" : "")}
        </div>
        <div class='signature'>
            <img src='https://acompliancepe.com/wp-content/uploads/2024/06/B6.png' alt='Logo'>
            <p>Visítanos en <a href='https://ccfirma.com' style='color: #2980b9;'>ccfirma.com</a></p>
        </div>
    </body>
    </html>
    ";
    }

    #endregion
  }

}
