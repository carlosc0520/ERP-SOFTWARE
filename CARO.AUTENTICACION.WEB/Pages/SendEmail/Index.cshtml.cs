using CARO.CONFIG;
using CARO.CORE;
using CARO.DATOS.MODELO.CCFIRMA;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Mail;
using System.Net;


namespace CARO.AUTENTICACION.WEB.Pages.SendEmail
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;
    private string filesPath = "CCFIRMA/EMAILS";

    public IndexModel(
       IMediator mediator
    )
    {
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    [HttpPost]
    public async Task<IActionResult> OnPostSendMailAsync([FromForm] SendMailModel custom)
    {
      try
      {
        if (string.IsNullOrWhiteSpace(custom.EMAILS))
          return BadRequest(new { success = false, message = "El campo EMAILS es obligatorio." });

        if (string.IsNullOrWhiteSpace(custom.BODY))
          return BadRequest(new { success = false, message = "El campo BODY es obligatorio." });

        await SendEmailAsync(custom);

        return new JsonResult(new { success = true, message = "Correo enviado correctamente." });
      }
      catch (SmtpException smtpEx)
      {
        return StatusCode(500, new { success = false, message = "Error al enviar correo (SMTP).", error = smtpEx.Message });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { success = false, message = "Ocurrió un error inesperado.", error = ex.Message });
      }
    }

    private async Task SendEmailAsync(SendMailModel custom)
    {
      var destinatarios = custom.EMAILS!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

      if (!destinatarios.Any())
        throw new ArgumentException("Debe especificar al menos un correo válido.", nameof(custom.EMAILS));

      using var smtpClient = new SmtpClient("smtp.gmail.com")
      {
        Port = 587,
        Credentials = new NetworkCredential(
              ConfiguracionProyecto.CORREOS_CONTACTO.CORREO,
              ConfiguracionProyecto.CORREOS_CONTACTO.KEY
          ),
        EnableSsl = true,
      };

      using var mailMessage = new MailMessage
      {
        From = new MailAddress(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, custom.ORIGEN ?? "Sistema"),
        Subject = custom.ASUNTO ?? "Sin asunto",
        Body = custom.BODY,
        IsBodyHtml = true
      };

      // Agregar cada correo validado
      foreach (var email in destinatarios)
      {
        if (MailAddress.TryCreate(email, out var addr))
          mailMessage.To.Add(addr);
        else
          throw new ArgumentException($"El correo '{email}' no es válido.");
      }

      // Adjuntar archivos
      if (custom.FILES != null && custom.FILES.Count > 0)
      {
        foreach (var archivo in custom.FILES)
        {
          using var memoryStream = new MemoryStream();
          await archivo.CopyToAsync(memoryStream);
          memoryStream.Position = 0; // Reiniciar el stream

          var attachment = new Attachment(memoryStream, archivo.FileName, archivo.ContentType);
          mailMessage.Attachments.Add(attachment);
        }
      }

      await smtpClient.SendMailAsync(mailMessage);
    }
  }
}
