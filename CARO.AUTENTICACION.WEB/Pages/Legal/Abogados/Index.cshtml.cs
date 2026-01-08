using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.LEGAL;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS;
using CARO.DATOS.MODELO.LEGAL.ABOGADOS;
using DocumentFormat.OpenXml.Drawing.Charts;
using DocumentFormat.OpenXml.Wordprocessing;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using System.Net;
using System.Net.Mail;

namespace CARO.AUTENTICACION.WEB.wwwroot.app.Legal.Abogados
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasAbogados _consultasAbogados;
    private readonly FileUploads _fileUploads;
    private string filesPath = "/CCFIRMA/SOLICITUDES";

    public IndexModel(
      IConsultasAbogados consultasAbogados,
      IMediator mediator
    )
    {
      _consultasAbogados = consultasAbogados;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    #region ABOGADOS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] AbogadosModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasAbogados.Listar(custom);

        foreach (var dat in datos)
        {
          var rutacompleta = ConfiguracionProyecto.DISK + dat.RTAFTO;
          dat.RTAFTO = rutacompleta;
        }

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoAbogadoInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoAbogadoEditar comando)
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoAbogadoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region HORARIOS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarHorariosAsync([FromQuery] HorariosModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasAbogados.ListarHorarios(custom);
        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddHorariosAsync([FromForm] ComandoHorariosInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateHorariosAsync([FromForm] ComandoHorariosEditar comando)
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
    public async Task<IActionResult> OnPostDeleteHorariosAsync([FromForm] ComandoHorariosEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region SOLICITUDES
    [HttpPost]
    public async Task<IActionResult> OnPostAddSolicitudAsync([FromForm] ComandoSolicitudInsertar comando)
    { 
      try
      {
        comando.RUTAS = await _fileUploads.UploadFilesAsync(this.filesPath,comando.FILES);
        string emails = "kojeda@ccfirma.com,rsaldarriaga@ccfirma.com";
        string emailBody = GetEmailBody(comando, emails);
        string emailReceptor = GetEmailBody(comando, null);
        await SendEmailAsync(emails, comando.CORREO, "Nueva Solicitud de Servicio - Cita", emailBody, emailReceptor, comando.FILES);

        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    private string GetEmailBody(ComandoSolicitudInsertar comando, string? emails = null)
    {
      TimeZoneInfo peruZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
      DateTime peruTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, peruZone);
      string fecha = peruTime.ToString("dd-MM-yyyy");
      string hora = peruTime.ToString("hh:mm tt", CultureInfo.InvariantCulture); // tt -> am/pm

      return $@"
      <!DOCTYPE html>
      <html lang='es'>
      <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <title>Solicitud de Servicio</title>
          <style>
              body {{
                  font-family: 'Arial', sans-serif;
                  background-color: #f4f7fc;
                  margin: 0;
                  padding: 0;
                  color: #555;
              }}
              .container {{
                  width: 100%;
                  max-width: 650px;
                  margin: 30px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              }}
              h2 {{
                  text-align: center;
                  color: #2c3e50;
                  font-size: 24px;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #e2e2e2;
                  padding-bottom: 10px;
              }}
              .section-title {{
                  font-weight: bold;
                  color: #34495e;
              }}
              .details {{
                  background-color: #ecf0f1;
                  padding: 15px;
                  margin: 15px 0;
                  border-radius: 8px;
                  border: 1px solid #bdc3c7;
              }}
              .footer {{
                  text-align: center;
                  font-size: 14px;
                  color: #7f8c8d;
                  margin-top: 30px;
                  border-top: 1px solid #ecf0f1;
                  padding-top: 20px;
              }}
              .email-header {{
                  padding: 10px;
                  background-color: #ff6c17;
                  color: #ffffff;
                  border-radius: 10px 10px 0 0;
                  font-size: 18px;
                  text-align: center;
              }}
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
              <p><span class='section-title'>Cliente:</span> {comando.APLLDS} {comando.NMBRES}</p>
              <p><span class='section-title'>Correo:</span> {comando.CORREO}</p>
              <p><span class='section-title'>Celular:</span> {comando.CELULAR}</p>
              <p><span class='section-title'>Comentarios:</span> {comando.COMENTARIOS}</p>

              <div class='details'>
                  <p><span class='section-title'>Abogado:</span> {comando.NAME_ABGDO}</p>
                  <p><span class='section-title'>Especialidad:</span> {comando.NAME_ESPCDD}</p>
                  <p><span class='section-title'>Fecha de Solicitud:</span> {fecha}</p>
                  <p><span class='section-title'>Hora:</span> {hora}</p>
                  <p><span class='section-title'>Tipo de Atención:</span> {comando.NAME_TATENCION}</p>

              </div>

              <div class='details'>
                  <p><span class='section-title'>Sucursal:</span> {comando.NAME_SUCURSAL}</p>
                  <p><span class='section-title'>Dirección:</span> {comando.NAME_DRCCN}</p>
              </div>

              {(string.IsNullOrEmpty(emails) ? $@"
              <div class='footer'>
                  <p>Gracias por confiar en nuestros servicios, nos pondremos en contacto contigo.</p>
                  <p>Si tienes alguna duda, no dudes en contactarnos.</p>
              </div>" : "")}
          
              <div class='signature'>
                  <img
                    style='max-width: 150px!important!'
                    src ='https://aicompliance.es/wp-content/uploads/2024/06/B6.png' alt='Logo'>
                  <p>Visítanos en <a href='https://ccfirma.com' style='color: #2980b9;'>ccfirma.com</a></p>
              </div>
          </div>
      </body>
      </html>
      ";
    }

    private async Task SendEmailAsync(string toEmail, string FromEmail, string subject, string body, string bodyRecepetor, List<IFormFile> files)
    {
 

      var task1 = SendEmailInternalAsync(toEmail, subject, body, files);
      // var task2 = SendEmailInternalAsync(FromEmail, subject, bodyRecepetor, null); 

      await Task.WhenAll(task1); 
    }

    private async Task SendEmailInternalAsync (string toEmail, string subject, string body, List<IFormFile>? files)
    {
      var smtpClient = new SmtpClient("smtp.gmail.com")
      {
        Port = 587,
        Credentials = new NetworkCredential(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, ConfiguracionProyecto.CORREOS_CONTACTO.KEY),
        EnableSsl = true,
      };

      var mailMessage = new MailMessage
      {
        From = new MailAddress("formulariocaro@gmail.com", "CCFIRMA - CONSULTORÍA"),
        Subject = subject,
        Body = body,
        IsBodyHtml = true
      };

      foreach (string email in toEmail.Split(','))
      {
        if (!string.IsNullOrWhiteSpace(email))
        {
          mailMessage.To.Add(email.Trim());
        }
      }

      if (files != null && files.Count > 0)
      {
        foreach (var file in files)
        {
          var fileName = Path.GetFileName(file.FileName);
          using (var stream = new MemoryStream())
          {
            await file.CopyToAsync(stream);
            mailMessage.Attachments.Add(new Attachment(new MemoryStream(stream.ToArray()), fileName));
          }
        }
      }

      await smtpClient.SendMailAsync(mailMessage);
    }


    #endregion

  }
}
