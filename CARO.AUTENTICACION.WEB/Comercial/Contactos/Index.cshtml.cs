using CARO.CONFIG;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;
using CARO.DATOS.MODELO.COM.CONTACTO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using System.Net;
using System.Net.Mail;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Contactos
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
    {
    private readonly IMediator _mediator;
    private readonly IConsultasContacto _consultasContacto;

    public IndexModel(
      IConsultasContacto consultasContacto,
      IMediator mediator
    )
    {
      _consultasContacto = consultasContacto;
      _mediator = mediator;
    }

    #region CONTACTOS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] ContactoModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var cursos = await _consultasContacto.Listar(custom);
        var totalRows = cursos?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = cursos, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los cursos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoContactoInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoContactoEditar comando)
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
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoContactoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    #region EMAIL

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarEmailsAsync([FromQuery] DetEmailModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var emailsModel = await _consultasContacto.ListarEmails(custom);
        var totalRows = emailsModel?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { recordsTotal = totalRows, recordsFiltered = totalRows, data = emailsModel, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los emails.", error = ex.Message });
      }

    }



    [HttpPost]
    public async Task<IActionResult> OnPostSendMailAsync([FromForm] ComandoCorreoInsertar comando)
    {
      if (string.IsNullOrWhiteSpace(comando.CNTCTS) || string.IsNullOrWhiteSpace(comando.MSJE))
      {
        return BadRequest("Contactos o mensaje vacíos");
      }

      // Separar los correos electrónicos por ',' y remover espacios en blanco
      var destinatarios = comando.CNTCTS.Split(',')
                                        .Select(correo => correo.Trim())
                                        .Where(correo => !string.IsNullOrWhiteSpace(correo))
                                        .ToList();

      if (!destinatarios.Any())
      {
        return BadRequest("No se han proporcionado destinatarios válidos.");
      }


      List<AdjuntoModel> adjuntosImagenes = JsonConvert.DeserializeObject<List<AdjuntoModel>>(comando.ADJUNTOS);
      comando.DATA = adjuntosImagenes;

      var result = await _mediator.Send(comando);
      EmailModel entidadEmail = new EmailModel();
      entidadEmail.IDNTCA = result.Retorno;
      List<EmailModel> datosEmail = await _consultasContacto.ListarAdjuntos(entidadEmail);



      // Tareas paralelas para el envío de correos
      var tareasEnvio = destinatarios.Select(destinatario => EnviarCorreo(destinatario, comando.ASNTO, comando.MSJE, datosEmail , result.Retorno)).ToList();

      // Ejecutar todas las tareas de envío
      await Task.WhenAll(tareasEnvio);

      return new JsonResult(new { status = 200, success = true, mensaje = "Correos enviados correctamente" });
    }

    private async Task EnviarCorreo(string destinatario, string asunto, string mensajeHtml, List<EmailModel> adjuntosImagenes, int retorno)
    {

      try
      {
        using (var smtpClient = new SmtpClient("smtp.gmail.com"))
        {
          smtpClient.Port = 587;
          smtpClient.UseDefaultCredentials = false;
          smtpClient.Credentials = new NetworkCredential(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, ConfiguracionProyecto.CORREOS_CONTACTO.KEY);
          smtpClient.EnableSsl = true;

          string mensajeHtmlConImagenes = $@"{mensajeHtml}";
          foreach (var adjunto in adjuntosImagenes)
          {
            mensajeHtmlConImagenes += $@"
              <div style='text-align: center; margin-bottom: 5px;'>
                  <a href='{ConfiguracionProyecto.HOST}Comercial/Contactos/Index?handler=SendMailUrl&REDIRECT={adjunto.ID}&IDNTCA={retorno}' target='_blank'>
                      <img src='{adjunto.IMGURL}' alt='Imagen' width='600' />
                  </a>
              </div>";
          }

          mensajeHtmlConImagenes += $@"
          <div style='width: 100%; height: 1px; background-color: #cccccc; margin-top: 70px;'></div>
          <div style='margin-top: 5px; font-size: 12px; color: #666666!important; text-align: center;'>
              <p>This email was sent to {destinatario.ToLower()}</p>
              <p>Caro & Asociados · Av.Víctor Andrés Belaunde N°370 San Isidro, Lima 27, Perú · Lima 15000 · Peru</p>
          </div>";

          mensajeHtmlConImagenes += @"
          <div style='text-align: center; margin-top: 20px;'>
              <a href='https://ccfirma.com/' target='_blank'>
                  <img src='https://acompliancepe.com/wp-content/uploads/2024/06/B6.png' alt='Imagen Final' width='137' height='53' />
              </a>
          </div>";

          var mailMessage = new MailMessage
          {
            From = new MailAddress(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, "Caro & Asociados"),
            Subject = asunto,
            Body = mensajeHtmlConImagenes,
            IsBodyHtml = true  
          };

          mailMessage.To.Add(destinatario);

          await smtpClient.SendMailAsync(mailMessage);
        }
      }
      catch (Exception ex)  
      {
        Console.WriteLine($"Error enviando correo a {destinatario}: {ex.Message}");
      }
    }
    #endregion

    #region VISTAS-POR-NOTICIA
    [HttpGet]
    public async Task<IActionResult> OnGetSendMailUrlAsync([FromQuery] ComandoIncrementView comando)
    {
      try
      {
        var result = await _mediator.Send(comando);
        EmailModel entidadEmail = new EmailModel();
        entidadEmail.IDNTCA = int.Parse(comando.IDNTCA);
        entidadEmail.REDURL = comando.REDIRECT;
        List<EmailModel> datosEmail = await _consultasContacto.ListarAdjuntos(entidadEmail);
        EmailModel primero = datosEmail.FirstOrDefault();

        return Redirect(primero.REDURL);

      }
      catch (Exception ex) {
        return Redirect(comando.REDIRECT);
      }
    }


    #endregion
  }
}
