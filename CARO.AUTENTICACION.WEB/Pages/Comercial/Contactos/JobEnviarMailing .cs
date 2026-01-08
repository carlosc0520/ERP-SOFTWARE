using CARO.AUTENTICACION.WEB.Pages.Comercial.Contactos;
using CARO.CORE.Models;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;
using CARO.DATOS.MODELO.COM.CONTACTO;
using MediatR;
using Newtonsoft.Json;
using Quartz;
using static QRCoder.PayloadGenerator;

public class JobEnviarMailing : IJob
{
  private readonly IMediator _mediator;
  private readonly IConsultasContacto _consultasContacto;
  private readonly EventosHandler _eventosHandler;

  public JobEnviarMailing(IMediator mediator, IConsultasContacto consultasContacto, EventosHandler eventosHandler)
  {
    _consultasContacto = consultasContacto;
    _mediator = mediator;
    _eventosHandler = eventosHandler;
  }

  public async Task Execute(IJobExecutionContext context)
  {
    try
    {
      //int mailingId = context.JobDetail.JobDataMap.GetInt("mailingId");
      //MailingModel custom = new MailingModel
      //{
      //  MAILING_ID = mailingId,
      //  INIT = 0,
      //  ROWS = 1
      //};
      //var mailing = await _consultasContacto.ListarMailings(custom);
      //var data = mailing.FirstOrDefault();
      //List<ContactosDataModel>? CONTACTOS_DATA =
      // data.CONTACTOS_DATA != null
      //     ? JsonConvert.DeserializeObject<List<ContactosDataModel>>(data.CONTACTOS_DATA)
      //     : new List<ContactosDataModel>();

      //var dataImagenes = JsonConvert.DeserializeObject<ImagenesWrapper>(data.IMAGENES_JSON);
      //List<AdjuntosCorreoMalingModel> imagenesSubidas = dataImagenes.imagenes;

      //var lista = JsonConvert.DeserializeObject<List<DestinatarioModel>>(data.CONTACTOS);
      //var destinatarios = lista
      //    .Select(x => x.DESTINATARIO?.Trim())
      //    .Where(x => !string.IsNullOrWhiteSpace(x))
      //    .Distinct()
      //    .ToList();

      //var tareas = destinatarios.Select(destinatario =>
      //    _eventosHandler.EnviarCorreoIndividualAsync(
      //        destinatario,
      //        data.ASUNTO,
      //        data.CUERPO_HTML,
      //        mailingId,
      //        imagenesSubidas,
      //        CONTACTOS_DATA
      //    )
      //);

      //var resultados = await Task.WhenAll(tareas);
      //var comandoMailingInsertar = new ComandoMailingInsertar
      //{
      //  MAILING_ID = mailingId,     // OUTPUT
      //  INDICADOR = 4,          // Primer envío
      //  ASUNTO = null,
      //  CUERPO_HTML = null,
      //  IMAGENES_JSON = null,
      //  UCRCN = "ADMIN_MAILING",
      //  DESTINATARIOS = null,
      //  DESTINATARIO = null,
      //  FPROGRAMADA = null,
      //  ESTADO = "ENVIADO",
      //  EVENTO = "SENT",
      //  IDMRCA = null,
      //};

      //var respuestaSP = await _mediator.Send(comandoMailingInsertar);

      //Console.WriteLine($"[Quartz] Mailing {mailingId} enviado correctamente.");
    }
    catch (Exception ex)
    {
      Console.WriteLine($"[Quartz ERROR] {ex.Message}");
    }
  }
}
