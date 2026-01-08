using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA;
using CARO.DATOS.MODELO.COM.PLANTILLA;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Mail;
using System.Net;
using CARO.DATOS.MODELO.COM.SOLICITUD;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Plantillas.checklistPlantilla
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
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }


    #region FORMULARIO
    [HttpGet]
    public async Task<IActionResult> OnGetAllAsync([FromQuery] FormularioModel custom)
    {
      HttpContextDraw.SetModelValues(HttpContext, custom);
      var data = await _consultasPlantilla.ListarFormularios(custom);
      var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;

      return new JsonResult(new
      {
        recordsTotal = totalRows,
        recordsFiltered = totalRows,
        data = data,
        draw = custom.DRAW
      });
    }

    public async Task<IActionResult> OnGetAllEmailsAsync([FromQuery] FormularioModel custom)
    {
      HttpContextDraw.SetModelValues(HttpContext, custom);
      var data = await _consultasPlantilla.ListarFormulariosEmails(custom);
      var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;

      return new JsonResult(new
      {
        recordsTotal = totalRows,
        recordsFiltered = totalRows,
        data = data,
        draw = custom.DRAW
      });
    }

    [HttpGet]
    public async Task<IActionResult> OnGetAllRespAsync([FromQuery] FormularioRespuestaModel custom)
    {
      HttpContextDraw.SetModelValues(HttpContext, custom);
      var data = await _consultasPlantilla.ListarRespuestas(custom);

      return new JsonResult(new
      {
        data = data
      });
    }


    [HttpGet]
    public async Task<IActionResult> OnGetFormAsync([FromQuery] FormularioModel custom)
    {
      var data = await _consultasPlantilla.ListarForm(custom);

      return new JsonResult(new
      {
        data = data
      });
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoFormularioInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);

        if (comando.FTO != null && comando.FTO.Length > 0)
        {
          comando.LOGO = await _fileUploads.UploadFileAsync("CCFIRMA/PLANTILLAS/FORMULARIOS", comando.FTO);
        }

        var result = await _mediator.Send(comando);
        if (!result.EsSatisfactoria)
          await _fileUploads.DeleteDirectoryAsync(comando.LOGO);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddRespuestasAsync([FromForm] ComandoFormularioRespuestasInsertar comando)
    {
      try
      {
        comando.UEDCN = "FORMULARIO";
        var result = await _mediator.Send(comando);

        if (result.CodEstado > 0)
        {
          FormularioResModel entidad = new FormularioResModel
          {
            CORREO = comando.EMAIL?.Trim(),
            NOMBRES = comando.NOMBRES?.Trim(),
            NAMEFORM = comando.NAMEFORM?.Trim(),
            ENLACE = $"{ConfiguracionProyecto.HOST_PROD}Perfil/Forms/index?preview=true&id={comando.IDFORMU}&sendmail={comando.EMAIL?.Trim()}"
          };

          try
          {
            var sendMail = GetEmailBody(entidad);
            await SendEmailAsync(sendMail, entidad.NAMEFORM);
          }
          catch (Exception mailEx)
          {

          }
        }

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }


    private async Task SendEmailAsync(string body, string nameFormulario)
    {
      using var smtpClient = new SmtpClient("smtp.gmail.com", 587)
      {
        Credentials = new NetworkCredential(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, ConfiguracionProyecto.CORREOS_CONTACTO.KEY),
        EnableSsl = true,
      };

      using var mailMessage = new MailMessage
      {
        From = new MailAddress(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, "CCFIRMA - FORMULARIOS"),
        Subject = "Formulario - " + nameFormulario,
        Body = body,
        IsBodyHtml = true
      };

      mailMessage.To.Add("kojeda@ccfirma.com");
      mailMessage.To.Add("rsaldarriaga@ccfirma.com");

      await smtpClient.SendMailAsync(mailMessage);

      foreach (var attachment in mailMessage.Attachments)
      {
        attachment.Dispose();
      }
    }

    private string GetEmailBody(FormularioResModel entidad)
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
                <h3>Formulario de Respuesta</h3>
            </div>
            <p><span class='section-title'>Usuario:</span> {entidad.NOMBRES}</p>
            <p><span class='section-title'>Correo:</span> {entidad.CORREO}</p>
            <p><span class='section-title'>Enlace Formulario:</span> {entidad.ENLACE}</p>
        </div>
        <div class='signature'>
            <img src='https://aicompliance.es/wp-content/uploads/2024/06/B6.png' alt='Logo'>
            <p>Visítanos en <a href='https://ccfirma.com' style='color: #2980b9;'>ccfirma.com</a></p>
        </div>
    </body>
    </html>
    ";
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoFormularioEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);

        if (comando.FTO != null && comando.FTO.Length > 0)
        {
          if (!string.IsNullOrEmpty(comando.LOGO))
            await _fileUploads.DeleteDirectoryAsync(comando.LOGO);

          comando.LOGO = await _fileUploads.UploadFileAsync("CCFIRMA/PLANTILLAS/FORMULARIOS", comando.FTO);
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoFormularioEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion FORMULARIO

    #region PREGUNTAS
    [HttpGet]
    public async Task<IActionResult> OnGetAllPreguntasAsync([FromQuery] PreguntaModel custom)
    {
      HttpContextDraw.SetModelValues(HttpContext, custom);
      var data = await _consultasPlantilla.ListarPreguntas(custom);
      var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;

      return new JsonResult(new
      {
        recordsTotal = totalRows,
        recordsFiltered = totalRows,
        data = data,
        draw = custom.DRAW
      });
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddPreguntaAsync([FromForm] ComandoPreguntaInsertar comando)
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
    public async Task<IActionResult> OnPostUpdatePreguntaAsync([FromForm] ComandoPreguntaEditar comando)
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
    public async Task<IActionResult> OnPostDeletePreguntaAsync([FromForm] ComandoPreguntaEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion PREGUNTAS
  }
}
