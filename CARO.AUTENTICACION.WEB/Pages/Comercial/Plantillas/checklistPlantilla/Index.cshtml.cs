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

    [HttpGet]
    public async Task<IActionResult> OnGetAllExportAsync([FromQuery] FormularioExportModel custom)
    {
      var data = await _consultasPlantilla.ListarFormulariosExport(custom);

      return new JsonResult(new
      {
        data = data
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
      mailMessage.To.Add("vescudero@ccfirma.com");
      //mailMessage.To.Add("ccarbajal@ccfirma.com");

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
    <title>Formulario de Respuesta</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 0; 
            padding: 20px; 
            color: #575F61; 
            line-height: 1.6;
        }}
        .email-wrapper {{ 
            width: 100%; 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 16px; 
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }}
        .email-header {{ 
            background: linear-gradient(135deg, #FF6A16 0%, #ff8c42 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }}
        .email-header::after {{
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 20px;
            background-color: #ffffff;
            border-radius: 20px 20px 0 0;
        }}
        .email-header h2 {{ 
            color: #ffffff; 
            font-size: 28px; 
            font-weight: 600;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }}
        .email-body {{ 
            padding: 40px 30px 30px;
        }}
        .info-card {{
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-left: 4px solid #FF6A16;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            transition: transform 0.2s ease;
        }}
        .info-card:hover {{
            transform: translateX(5px);
        }}
        .info-row {{ 
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #dee2e6;
        }}
        .info-row:last-child {{
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }}
        .info-label {{ 
            font-weight: 600; 
            color: #575F61;
            min-width: 120px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .info-value {{ 
            color: #808080;
            font-size: 15px;
            flex: 1;
            word-break: break-word;
        }}
        .info-value a {{
            color: #FF6A16;
            text-decoration: none;
            font-weight: 500;
            border-bottom: 1px solid transparent;
            transition: border-color 0.2s ease;
        }}
        .info-value a:hover {{
            border-bottom-color: #FF6A16;
        }}
        .icon {{
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #FF6A16;
            border-radius: 50%;
            margin-right: 8px;
        }}
        .cta-button {{
            display: inline-block;
            background: linear-gradient(135deg, #FF6A16 0%, #ff8c42 100%);
            color: #ffffff!important;
            padding: 15px 40px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(255, 106, 22, 0.3);
            transition: all 0.3s ease;
        }}
        .cta-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 106, 22, 0.4);
        }}
        .divider {{
            height: 1px;
            background: linear-gradient(to right, transparent, #dee2e6, transparent);
            margin: 30px 0;
        }}
        .footer {{ 
            text-align: center; 
            padding: 30px;
            background-color: #f8f9fa;
            border-top: 3px solid #FF6A16;
        }}
        .footer-logo {{
            max-width: 180px;
            margin-bottom: 15px;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }}
        .footer-text {{ 
            font-size: 14px; 
            color: #808080;
            margin: 8px 0;
        }}
        .footer-link {{
            color: #FF6A16;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s ease;
        }}
        .footer-link:hover {{
            color: #ff8c42;
        }}
        .badge {{
            display: inline-block;
            background-color: #FF6A16;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
        }}
    </style>
</head>
<body>
    <div class='email-wrapper'>
        <div class='email-header'>
            <div class='badge'>NUEVA RESPUESTA</div>
            <h2>📋 Formulario Completado</h2>
        </div>
        
        <div class='email-body'>
            <p style='color: #575F61; font-size: 16px; margin-bottom: 25px;'>
                Se ha recibido una nueva respuesta al formulario. A continuación, los detalles:
            </p>
            
            <div class='info-card'>
                <div class='info-row'>
                    <span class='info-label'>
                        <span class='icon'></span>Usuario
                    </span>
                    <span class='info-value'>{entidad.NOMBRES}</span>
                </div>
                
                <div class='info-row'>
                    <span class='info-label'>
                        <span class='icon'></span>Correo
                    </span>
                    <span class='info-value'>
                        <a href='mailto:{entidad.CORREO}'>{entidad.CORREO}</a>
                    </span>
                </div>
                
                <div class='info-row'>
                    <span class='info-label'>
                        <span class='icon'></span>Formulario
                    </span>
                    <span class='info-value'>
                        <a href='{entidad.ENLACE}' target='_blank'>Ver respuestas completas →</a>
                    </span>
                </div>
            </div>
            
            <div class='divider'></div>
            
            <p style='color: #808080; font-size: 13px; text-align: center; margin: 0;'>
                Este es un correo automático. Por favor, no responda a este mensaje.
            </p>
        </div>
        
        <div class='footer'>
            <img src='https://aicompliance.es/wp-content/uploads/2024/06/B6.png' alt='Logo' class='footer-logo'>
            <p class='footer-text'>
                Visítanos en <a href='https://ccfirma.com' class='footer-link'>ccfirma.com</a>
            </p>
            <p class='footer-text' style='font-size: 12px; margin-top: 15px;'>
                © 2026 CARO ASOCIADOS - Todos los derechos reservados
            </p>
        </div>
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
