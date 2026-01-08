using CARO.AUTENTICACION.WEB.Pages.Comercial.Contactos;
using CARO.CORE.Models;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;
using CARO.DATOS.MODELO.COM.CONTACTO;
using MediatR;
using Newtonsoft.Json;
using Quartz;

public class SchedulerService
{
  private readonly ISchedulerFactory _schedulerFactory;
  private readonly IMediator _mediator;
  private readonly EventosHandler _eventosHandler;
  private readonly IConsultasContacto _consultasContacto;

  public SchedulerService(
      ISchedulerFactory schedulerFactory,
      IMediator mediator,
      EventosHandler eventosHandler,
      IConsultasContacto consultasContacto)
  {
    _schedulerFactory = schedulerFactory;
    _mediator = mediator;
    _eventosHandler = eventosHandler;
    _consultasContacto = consultasContacto;
  }

  // ================================================
  // 1) PROGRAMAR ENVÍO - CORREGIDO CON TIMEZONE
  // ================================================
  public async Task ProgramarEnvioAsync(int mailingId, DateTime fechaProgramada)
  {
    var scheduler = await _schedulerFactory.GetScheduler();
    string idMailing = mailingId.ToString();

    if (!scheduler.IsStarted)
      await scheduler.Start();

    // Normalizar fecha recibida (viene en LOCAL)
    DateTime fechaLocal = fechaProgramada;

    if (fechaLocal.Kind == DateTimeKind.Unspecified)
      fechaLocal = DateTime.SpecifyKind(fechaLocal, DateTimeKind.Local);

    // Quartz requiere UTC
    DateTime fechaQuartz = fechaLocal.ToUniversalTime();

    var job = JobBuilder.Create<JobEnviarMailing>()
        .WithIdentity($"mailing_job_{idMailing}")
        .UsingJobData("mailingId", idMailing)
        .Build();

    var trigger = TriggerBuilder.Create()
        .WithIdentity($"mailing_trigger_{idMailing}")
        .StartAt(fechaQuartz) // ahora correcto
        .Build();

    await scheduler.ScheduleJob(job, trigger);
  }

  // ====================================================
  // 2) PROCESAR PENDIENTES - CORRECCIÓN DE FECHAS SQL
  // ====================================================
  public async Task RunPendingsNowAsync()
  {
    MailingModel filtro = new MailingModel
    {
      ESTADO = "PENDIENTE",
      INIT = 0,
      ROWS = 1000
    };

    var pendientes = await _consultasContacto.ListarMailings(filtro);
    pendientes = pendientes.Where(x => x.ESTADO == "PENDIENTE").ToList();

    // NORMALIZAR FECHAS COMING FROM SQL
    foreach (var p in pendientes)
    {
      if (p.FPROGRAMADA.HasValue)
      {
        DateTime f = p.FPROGRAMADA.Value;

        // SQL entrega "Unspecified" → asumir que ES UTC porque así lo guardamos
        if (f.Kind == DateTimeKind.Unspecified)
          f = DateTime.SpecifyKind(f, DateTimeKind.Utc);

        // Convertir a local por si Quartz lo requiere
        p.FPROGRAMADA = f.ToLocalTime();
      }
    }

    // ====================================================
    // 3) EJECUTAR CORREOS PENDIENTES
    // ====================================================
    foreach (var mail in pendientes)
    {
      var lista = JsonConvert.DeserializeObject<List<DestinatarioModel>>(mail.CONTACTOS);

      var destinatarios = lista
          .Select(x => x.DESTINATARIO?.Trim())
          .Where(x => !string.IsNullOrWhiteSpace(x))
          .ToList();

      List<ContactosDataModel>? CONTACTOS_DATA =
          mail.CONTACTOS_DATA != null
              ? JsonConvert.DeserializeObject<List<ContactosDataModel>>(mail.CONTACTOS_DATA)
              : new List<ContactosDataModel>();

      await Task.WhenAll(destinatarios.Select(d =>
          _eventosHandler.EnviarCorreoIndividualAsync(
              d,
              mail.ASUNTO,
              mail.CUERPO_HTML,
              (decimal)mail.MAILING_ID,
              JsonConvert.DeserializeObject<ImagenesWrapper>(mail.IMAGENES_JSON)?.imagenes,
              CONTACTOS_DATA,
              mail.CORREOSEND,
              mail.SECRETKEY,
              mail.PLACEHOLDER
          )
      ));

      // Actualizar estado del mailing
      await _mediator.Send(new ComandoMailingInsertar
      {
        MAILING_ID = mail.MAILING_ID,
        INDICADOR = 4,
        ESTADO = "ENVIADO",
        EVENTO = "SENT"
      });

      Console.WriteLine($"[Quartz] Mailing {mail.MAILING_ID} enviado correctamente.");
    }
  }
}
