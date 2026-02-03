using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS.COMENTARIO;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS.HONORARIO;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CLIENTE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CLIENTE.CONTACTO;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.EQUIPO;
using CARO.DATOS.MODELO.COM.GESTION;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net;
using System.Net.Mail;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Gestion
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasCasos _consultasCasos;
    private readonly FileUploads _fileUploads;
    private string PATHCASOS = "CCFIRMA/GESTION/CASOS";

    public IndexModel(
      IMediator mediator,
      IConsultasCasos consultasCasos
    )
    {
      _mediator = mediator;
      _consultasCasos = consultasCasos;
      _fileUploads = new FileUploads();
    }


    #region CASOS
    [HttpGet]
    public async Task<IActionResult> OnGetCasesAllAsync([FromQuery] CasosModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasCasos.ListarCasos(custom);

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetCasesAllHistoryAsync([FromQuery] HistoryModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasCasos.ListarCasosHistory(custom);

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostCasesAddAsync([FromForm] ComandoCasoInsertar comando)
    {
      try
      {
        // Validar honorarios
        if (comando.HONORARIOS != null && comando.HONORARIOS.Count > 0)
        {
          foreach (var honorario in comando.HONORARIOS)
          {
            honorario.URLHNRRIO = honorario.FILE;
            //if (honorario.FILE != null)
            //{
            // Retorna la ruta del archivo o lanza excepción
            //string rutaArchivo = await _fileUploads.UploadFileFindAsync(
            //    this.PATHCASOS,
            //    honorario.FILE
            //);

            // Asignar directamente la ruta retornada
            //}
          }
        }

        if (
         !string.IsNullOrEmpty(comando.GDACCNSCMRCLS) &&
         comando.GDACCNSCMRCLS == "4"
        )
        {
          try
          {
            var sendMail = GetEmailBodyCasoPendiente(comando.NAMECLIENTE, comando.CASO, comando.CMNTRS);
            await SendEmailAsync(sendMail, comando.CASO);
          }
          catch (Exception mailEx)
          {

          }
        }

        // Usuario editor
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);

        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        // Aquí entran errores de FTP, validaciones, etc.
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Error al subir archivos o registrar el caso.",
          detalle = ex.Message // opcional (puedes quitarlo en producción)
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostCasesUpdateAsync([FromForm] ComandoCasoEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        if (
            !string.IsNullOrEmpty(comando.GDACCNSCMRCLS) &&
            comando.GDACCNSCMRCLS == "4" &&
            comando.GDACCNSCMRCLS != comando.GDACCNSCMRCLSANT
        )
        {
          try
          {
            var sendMail = GetEmailBodyCasoPendiente(comando.NAMECLIENTE, comando.CASO, comando.CMNTRS);
            await SendEmailAsync(sendMail, comando.CASO);
          }
          catch (Exception mailEx)
          {

          }
        }

        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al actualizar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostCasesDeleteAsync([FromForm] ComandoCasoEliminar comando)
    {
      try
      {
        //comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return new JsonResult(new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al eliminar el cliente.",
          error = ex.Message
        })
        {
          StatusCode = StatusCodes.Status500InternalServerError
        };
      }
    }

    private string GetEmailBodyCasoPendiente(string nombreCliente, string nombreCaso, string comentarios)
    {
      TimeZoneInfo peruTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");

      DateTime fechaPeruActual = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, peruTimeZone);

      var fActual = fechaPeruActual.ToString("dd-MM-yyyy hh:mm tt", new System.Globalization.CultureInfo("es-PE"));

      return $@"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Caso Pendiente de Cotización</title>
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
        .greeting {{
            font-size: 16px;
            color: #575F61;
            margin-bottom: 15px;
            font-weight: 500;
        }}
        .motivo-box {{
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
            border-left: 4px solid #FF6A16;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            font-size: 15px;
            color: #575F61;
            line-height: 1.8;
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
            min-width: 140px;
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
        .icon {{
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #FF6A16;
            border-radius: 50%;
            margin-right: 8px;
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
            <div class='badge'>PENDIENTE DE COTIZACIÓN</div>
            <h2>💼 Caso en Espera</h2>
        </div>
        
        <div class='email-body'>
            <p class='greeting'>
                Estimados,
            </p>
            
            <div class='motivo-box'>
                <strong>MOTIVO:</strong> Se tiene el siguiente caso pendiente de cotización
            </div>
            
            <p style='color: #575F61; font-size: 16px; margin-bottom: 25px;'>
                A continuación, los detalles del caso:
            </p>
            
            <div class='info-card'>
                <div class='info-row'>
                    <span class='info-label'>
                        <span class='icon'></span>Cliente
                    </span>
                    <span class='info-value'>{nombreCliente}</span>
                </div>
                
                <div class='info-row'>
                    <span class='info-label'>
                        <span class='icon'></span>Caso
                    </span>
                    <span class='info-value'>{nombreCaso}</span>
                </div>

                <div class='info-row'>
                    <span class='info-label'>
                        <span class='icon'></span>Comentarios
                    </span>
                    <span class='info-value'>{comentarios}</span>
                </div>

                <div class='info-row'>
                    <span class='info-label'>
                        <span class='icon'></span>F. Cambio
                    </span>
                    <span class='info-value'>{fActual}</span>
                </div>
            </div>
            
            <div class='divider'></div>
            
            <p style='color: #808080; font-size: 13px; text-align: center; margin: 0;'>
                Este es un correo automático. Por favor, no responda a este mensaje.
            </p>
        </div>
        
        <div class='footer'>
            <img src='{ConfiguracionProyecto.LOGO_FIRMA}' alt='Logo' class='footer-logo'>
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

    private async Task SendEmailAsync(string body, string nameCaso)
    {
      using var smtpClient = new SmtpClient("smtp.gmail.com", 587)
      {
        Credentials = new NetworkCredential(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, ConfiguracionProyecto.CORREOS_CONTACTO.KEY),
        EnableSsl = true,
      };

      using var mailMessage = new MailMessage
      {
        From = new MailAddress(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, "CCFIRMA - GESTIÓN"),
        Subject = "Cotización Pendiente Caso - " + nameCaso,
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



    #endregion CASOS

    #region COMENTARIOSXCASO
    [HttpGet]
    public async Task<IActionResult> OnGetComentsAllAsync([FromQuery] ComentarioModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasCasos.ListarComentariosXCasos(custom);

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostComentsAddAsync([FromForm] ComandoCasoComentarioInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al registrar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostComentsUpdateAsync([FromForm] ComandoCasoComentarioEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al actualizar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostComentsDeleteAsync([FromForm] ComandoCasoComentarioEliminar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return new JsonResult(new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al eliminar el cliente.",
          error = ex.Message
        })
        {
          StatusCode = StatusCodes.Status500InternalServerError
        };
      }
    }


    #endregion COMENTARIOSXCASO

    #region HONORARIOSXCASO
    [HttpGet]
    public async Task<IActionResult> OnGetHonorariosAllAsync([FromQuery] HonorarioModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);

        var datos = await _consultasCasos.ListarHonorariosXCasos(custom);

        // Concatenar DISK a URLHNRRIO solo si tiene valor
        //if (datos != null)
        //{
        //  foreach (var item in datos)
        //  {
        //    if (!string.IsNullOrWhiteSpace(item.URLHNRRIO))
        //    {
        //      item.URLHNRRIO = ConfiguracionProyecto.DISK + item.URLHNRRIO;
        //    }
        //  }
        //}

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;

        return new JsonResult(new
        {
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = datos,
          draw = custom.DRAW
        });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostHonorariosAddAsync([FromForm] ComandoCasoHonorarioInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        //if (comando.FILE != null)
        //{
        //  // Retorna la ruta del archivo o lanza excepción
        //  string rutaArchivo = await _fileUploads.UploadFileFindAsync(
        //      this.PATHCASOS,
        //      comando.FILE
        //  );

        //  // Asignar directamente la ruta retornada
        //  comando.URLHNRRIO = rutaArchivo;
        //}

        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al registrar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostHonorariosUpdateAsync([FromForm] ComandoCasoHonorarioEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        //if (comando.URLHNRRIO != null && comando.URLHNRRIO.StartsWith(ConfiguracionProyecto.DISK))
        //{
        //  comando.URLHNRRIO = comando.URLHNRRIO.Substring(ConfiguracionProyecto.DISK.Length);
        //}

        //if (comando.FILE != null)
        //{
        //  // si viene un FILE Y URLHNRRIO, se asume que se va a actualizar el archivo Y se debe eliminar el anterior
        //  if (!string.IsNullOrWhiteSpace(comando.URLHNRRIO))
        //  {
        //    // Eliminar archivo anterior
        //    await _fileUploads.DeleteDirectoryAsync(comando.URLHNRRIO);
        //  }

        //  // Retorna la ruta del archivo o lanza excepción
        //  string rutaArchivo = await _fileUploads.UploadFileFindAsync(
        //      this.PATHCASOS,
        //      comando.FILE
        //  );
        //  // Asignar directamente la ruta retornada
        //  comando.URLHNRRIO = rutaArchivo;
        //}

        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al actualizar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostHonorariosDeleteAsync([FromForm] ComandoCasoHonorarioEliminar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        if (comando.URLHNRRIO != null && comando.URLHNRRIO.StartsWith(ConfiguracionProyecto.DISK))
        {
          comando.URLHNRRIO = comando.URLHNRRIO.Substring(ConfiguracionProyecto.DISK.Length);
        }
        if (!string.IsNullOrWhiteSpace(comando.URLHNRRIO))
        {
          // Eliminar archivo anterior
          await _fileUploads.DeleteDirectoryAsync(comando.URLHNRRIO);
        }

        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return new JsonResult(new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al eliminar el cliente.",
          error = ex.Message
        })
        {
          StatusCode = StatusCodes.Status500InternalServerError
        };
      }
    }


    #endregion HONORARIOSXCASO

    #region CLIENTESXCASO

    [HttpGet]
    public async Task<IActionResult> OnGetClientsAllAsync([FromQuery] ClienteModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasCasos.ListarClientesXCasos(custom);

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostClientsAddAsync([FromForm] ComandoClienteXCasoInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al registrar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostClientsUpdateAsync([FromForm] ComandoClienteXCasoEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al actualizar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostClientsDeleteAsync([FromForm] ComandoClienteXCasoEliminar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return new JsonResult(new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al eliminar el cliente.",
          error = ex.Message
        })
        {
          StatusCode = StatusCodes.Status500InternalServerError
        };
      }
    }


    #endregion CLIENTESXCASO

    #region CONTACTOXCLIENTESXCASO

    [HttpGet]
    public async Task<IActionResult> OnGetContactsAllAsync([FromQuery] ContactoModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasCasos.ListarContactoXClientesXCasos(custom);

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostContactsAddAsync([FromForm] ComandoContactoInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al registrar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostContactsUpdateAsync([FromForm] ComandoContactoEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al actualizar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostContactsDeleteAsync([FromForm] ComandoContactoEliminar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return new JsonResult(new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al eliminar el cliente.",
          error = ex.Message
        })
        {
          StatusCode = StatusCodes.Status500InternalServerError
        };
      }
    }


    #endregion CONTACTOXCLIENTESXCASO

    #region EQUIPOXCASO

    [HttpGet]
    public async Task<IActionResult> OnGetEquipmentAllAsync([FromQuery] EquipoModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var datos = await _consultasCasos.ListarEquiposXCasos(custom);

        var totalRows = datos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = datos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostEquipmentAddAsync([FromForm] ComandoEquipoXCasoInsertar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al registrar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostEquipmentUpdateAsync([FromForm] ComandoEquipoXCasoEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al actualizar la empresa."
        });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostEquipmentDeleteAsync([FromForm] ComandoEquipoXCasoEliminar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return new JsonResult(new
        {
          EsSatisfactoria = false,
          message = "Ocurrió un error al eliminar el cliente.",
          error = ex.Message
        })
        {
          StatusCode = StatusCodes.Status500InternalServerError
        };
      }
    }


    #endregion EQUIPOXCASO


  }
}
