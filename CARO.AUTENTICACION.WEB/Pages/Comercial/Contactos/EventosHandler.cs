using CARO.CONFIG;
using CARO.CORE.Models;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;
using System.Net;
using System.Net.Mail;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Contactos
{
  public class EventosHandler
  {
    private string ENDPOINT = "https://caroasociados.pe/Comercial/Contactos/Index?handler=";

    private async Task<string> BuildHtmlFinalAsync(string htmlBase, string destinatario, decimal mailingId,
     List<AdjuntosCorreoMalingModel> imagenesSubidas, List<ContactosDataModel> CONTACTOS_DATA)
    {
      string htmlFinal = htmlBase;

      var variables = new List<string>
        {
            "V_EMAIL",
            "V_NOMBRE",
            "V_APELLIDO",
            "V_CLIENTE",
            "V_NCOMPLETO",
            "V_GDEST",
            "V_SRN"
        };

      // 1. BUSCAR contacto asociado a ese email
      var contacto = CONTACTOS_DATA
          .FirstOrDefault(x => x.V_EMAIL.Equals(destinatario, StringComparison.OrdinalIgnoreCase));

      // 3. Reemplazar variables
      foreach (var variable in variables)
      {
        string marcador = $"#{variable}";

        string valor = variable switch
        {
          "V_EMAIL" => contacto?.V_EMAIL ?? "",
          "V_NOMBRE" => contacto?.V_NOMBRE ?? "",
          "V_APELLIDO" => contacto?.V_APELLIDO ?? "",
          "V_CLIENTE" => contacto?.V_CLIENTE ?? "",
          "V_NCOMPLETO" => contacto?.V_NOMBRES ?? "",
          "V_GDEST" => contacto?.V_GDSEXO == "1" ? "Estimado" : "Estimada",
          "V_SRN" => contacto?.V_GDSEXO == "1" ? "Sr." : "Srta.",
          _ => ""
        };

        htmlFinal = htmlFinal.Replace(marcador, valor);
      }


      // 🔹 Tracking de apertura
      htmlFinal = htmlFinal.Replace(
          "mailing_tracking",
          $"{this.ENDPOINT}MailingOpen&mailingId={mailingId}&destinatario={Uri.EscapeDataString(destinatario)}"
      );

      // 🔹 Tracking de unsubscribe
      htmlFinal = htmlFinal.Replace(
          "unsubscribe_link",
          $"{this.ENDPOINT}UnsbscribeMailing&mailingId={mailingId}&destinatario={Uri.EscapeDataString(destinatario)}"
      );

      // 🔹 Tracking de clicks
      if (imagenesSubidas != null)
      {
        foreach (var item in imagenesSubidas)
        {
          string realIndex = item.INDEX ?? "";
          string placeholder = $"replace_uri_{realIndex}";
          string url = string.IsNullOrEmpty(item.URL) ? string.Empty : item.URL;

          string trackingLink =
              $"{this.ENDPOINT}MailingClick" +
              $"&mailingId={mailingId}" +
              $"&destinatario={Uri.EscapeDataString(destinatario)}" +
              $"&index={realIndex}" +
              $"&type=imagen" +
              $"&link={Uri.EscapeDataString(url)}";

          htmlFinal = htmlFinal.Replace(placeholder, trackingLink);
        }
      }

      // 🔹 Reemplazar destinatario real
      htmlFinal = htmlFinal.Replace("mailing@mailing", destinatario);

      return htmlFinal;
    }

    public async Task<object> EnviarCorreoIndividualAsync(string destinatario, string asunto, string htmlBase,
      decimal mailingId, List<AdjuntosCorreoMalingModel> imagenesSubidas,
      List<ContactosDataModel> CONTACTOS_DATA, string correoSend, string secretKey, string placeHolder)
    {
      try
      {
        string htmlFinal = await BuildHtmlFinalAsync(
            htmlBase,
            destinatario,
            mailingId,
            imagenesSubidas,
            CONTACTOS_DATA
        );

        await SendMailing(destinatario, asunto, htmlFinal, correoSend, secretKey, placeHolder);

        return new { destinatario, enviado = true };
      }
      catch (Exception ex)
      {
        return new { destinatario, enviado = false, error = ex.Message };
      }
    }
    public async Task SendMailing(string destinatario, string asunto, string mensajeHtml,
      string correoSend, string secretKey, string placeHolder)
    {
      using (var smtpClient = new SmtpClient("smtp.gmail.com"))
      {
        smtpClient.Port = 587;
        smtpClient.Credentials = new NetworkCredential(
            correoSend.ToLower(),
            secretKey
        );
        smtpClient.EnableSsl = true;

        using (var mailMessage = new MailMessage())
        {
          mailMessage.From = new MailAddress(correoSend.ToLower(), placeHolder);
          mailMessage.To.Add(destinatario);
          mailMessage.Subject = asunto;
          mailMessage.Body = mensajeHtml;
          mailMessage.IsBodyHtml = true;
          mailMessage.BodyEncoding = System.Text.Encoding.UTF8;
          mailMessage.SubjectEncoding = System.Text.Encoding.UTF8;

          await smtpClient.SendMailAsync(mailMessage);
        }
      }
    }

  }
}
