using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.CANALDENUNCIAS;
using CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.CONFIGURACION;
using CARO.DATOS.MODELO.CANALDENUNCIAS;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Mail;
using System.Net;

namespace CARO.AUTENTICACION.WEB.Pages.CanalDenuncias.Configuracion
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;
    private readonly IConsultasConfiguracion _consultasConfiguracion;

    public IndexModel(
      IConsultasConfiguracion consultasConfiguracion,
      IMediator mediator
    )
    {
      _consultasConfiguracion = consultasConfiguracion;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }


    #region TIPO_DENUNCIA
    [HttpGet]
    public async Task<IActionResult> OnGetTipoDenunciaAsync([FromQuery] TipoDenunciaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasConfiguracion.ListarTipoDenuncia(custom);
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpGet]
    public async Task<IActionResult> OnGetDashboardAsync([FromQuery] DashboardaModel custom)
    {
      try
      {
        custom.IDUSR = int.Parse(HttpContextDraw.User(HttpContext, 2));
        var data = await _consultasConfiguracion.Dashboard(custom);
        return new JsonResult(new { success = true,  data = data});
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }


    [HttpPost]
    public async Task<IActionResult> OnPostAddTipoDenunciaAsync([FromForm] ComandoTipoRelacionInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateTipoDenunciaAsync([FromForm] ComandoTipoRelacionEditar comando)
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
    public async Task<IActionResult> OnPostDeleteTipoDenunciaAsync([FromForm] ComandoTipoRelacionEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region RELACION_EMPRESA
    [HttpGet]
    public async Task<IActionResult> OnGetRelacionEmpresaAsync([FromQuery] RelacionEmpresaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasConfiguracion.ListarRelacionEmpresa(custom);
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddRelacionEmpresaAsync([FromForm] ComandoTipoRelacionInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateRelacionEmpresaAsync([FromForm] ComandoTipoRelacionEditar comando)
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
    public async Task<IActionResult> OnPostDeleteRelacionEmpresaAsync([FromForm] ComandoTipoRelacionEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region RECEPTORES
    [HttpGet]
    public async Task<IActionResult> OnGetReceptorAsync([FromQuery] ReceptorModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasConfiguracion.ListarReceptor(custom);
        foreach (var d in data)
        {
          var rutacompleta = ConfiguracionProyecto.DISK + d.RTAFTO;
          d.RTAFTO = rutacompleta;
        }
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddReceptorAsync([FromForm] ComandoReceptorInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateReceptorAsync([FromForm] ComandoReceptorEditar comando)
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
    public async Task<IActionResult> OnPostDeleteReceptorAsync([FromForm] ComandoReceptorEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region PARAMETRO
    [HttpGet]
    public async Task<IActionResult> OnGetParametroAsync([FromQuery] ParametroDenunciaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasConfiguracion.ParametroDenuncia(custom);
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddParametroAsync([FromForm] ComandoParametroDenunciaInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateParametroAsync([FromForm] ComandoParametroDenunciaEditar comando)
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
    public async Task<IActionResult> OnPostDeleteParametroAsync([FromForm] ComandoParametroDenunciaEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    #region SOLICITUDES
    [HttpGet]
    public async Task<IActionResult> OnGetSolicitudesAsync([FromQuery] SolicitudDenunciaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasConfiguracion.ListarSolicitudes(custom);
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddSolicitudAsync([FromForm] ComandoSolicitudDenunciaAgregar comando)
    {
      try
      {
        string fechaDenuncia = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
        string correoDenunciante = "ccarbajal@ccfirma.com,kojeda@ccfirma.com";
        string cuerpo = $@"
             <div>
                <p>Estimados(as), le informamos de que se ha recibido una solicitud de soporte con los siguientes datos:</p>
                <ul>
                  <li><span>Nombres y Apellidos:</span><p>{comando.NOMBRE}, {comando.APELLIDO}</p></li>
                  <li><span>Asunto:</span><p>{comando.ASUNTO}</p></li>
                  <li><span>Correo:</span><p>{comando.CORREO}</p></li>
                  <li><span>Mensaje:</span><p>{comando.MENSAJE}</p></li>
                </ul>
            
             </div>
          ";
        await EnviarCorreoAsync(cuerpo, correoDenunciante, "0", fechaDenuncia, "Su denuncia fue admitida, pronto tendra noticias", "Solicitud Recibida", "https://canaletico.caroasociados.pe/");


        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    public async Task EnviarCorreoAsync(string cuerpo, string correoDestinatario, string codEstado, string fechaDenuncia, string tipoCorreo, string Subject, string Url = "https://canaletico.caroasociados.pe/modulos/ver-denuncias")
    {
      var mensaje = new MailMessage();
      var listaCorreos = correoDestinatario.Split(',', StringSplitOptions.RemoveEmptyEntries);

      foreach (var correo in listaCorreos)
      {
        mensaje.To.Add(correo.Trim());
      }
      mensaje.Subject = Subject;
      mensaje.From = new MailAddress(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, "CANAL DE DENUNCIAS");

      // Plantilla del correo en HTML
      string cuerpoHtml = @$"
      <html>
      <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <style>
              body {{
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }}
              .container {{
                  max-width: 600px;
                  margin: 30px auto;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  overflow: hidden;
              }}
              .header {{
                  background-color: #fdfdfd;
                  padding: 20px;
                  text-align: center;
                  color: #000000;
              }}
              .header img {{
                  max-height: 60px;
                  margin-bottom: 10px;
              }}
              .content {{
                  padding: 30px 20px;
              }}
              .content h2 {{
                  color: #333333;
              }}
              .content p {{
                  font-size: 16px;
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 15px;
              }}
              .button {{
                  display: inline-block;
                  background-color: #ED6A23;
                  color: #ffffff!important;
                  text-decoration: none;
                  padding: 12px 25px;
                  border-radius: 5px;
                  font-weight: bold;
                  transition: background-color 0.3s ease;
              }}
              .button:hover {{
                  background-color: #cf5a1d;
              }}
              .footer {{
                  padding: 15px;
                  text-align: center;
                  font-size: 12px;
                  color: #999999;
              }}
          </style>
      </head>
      <body>
          <div class='container'>
              <div class='header'>
                  <img src='https://acompliancepe.com/wp-content/uploads/2024/06/B6.png' alt='Logo'>
              </div>
              <div class='content'>
                  {cuerpo}
              </div>
              <div class='footer'>
                  <p>Este es un mensaje automático, por favor no responda a este correo.</p>
              </div>
          </div>
      </body>
      </html>";

      mensaje.Body = cuerpoHtml;
      mensaje.IsBodyHtml = true;

      try
      {
        using (var smtp = new SmtpClient("smtp.gmail.com"))
        {
          smtp.Credentials = new NetworkCredential(
              ConfiguracionProyecto.CORREOS_CONTACTO.CORREO,
              ConfiguracionProyecto.CORREOS_CONTACTO.KEY
          );
          smtp.Port = 587;
          smtp.EnableSsl = true; // Gmail requiere SSL habilitado

          await smtp.SendMailAsync(mensaje);
        }
      }
      catch (SmtpException ex)
      {
        Console.WriteLine("SMTP Error: " + ex.Message);
        Console.WriteLine("Status Code: " + ex.StatusCode);
        // log o throw personalizado si deseas notificar el error
      }
      catch (Exception ex)
      {
        Console.WriteLine("Error general al enviar el correo: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateSolicitudAsync([FromForm] ComandoSolicitudDenunciaEditar comando)
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

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteSolicitudAsync([FromForm] ComandoSolicitudDenunciaEliminar comando)
    {
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

  }
}
