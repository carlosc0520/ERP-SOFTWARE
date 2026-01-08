using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.MODELO.COM.CONTACTO;
using Quartz;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Contactos
{
  public class PendingMailingsScheduler : IHostedService
  {
    private readonly IServiceProvider _sp;
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly IConsultasContacto _consultasContacto;

    public PendingMailingsScheduler(IServiceProvider sp, ISchedulerFactory schedulerFactory, IConsultasContacto consultasContacto)
    {
      _sp = sp;
      _schedulerFactory = schedulerFactory;
      _consultasContacto = consultasContacto;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
      using var scope = _sp.CreateScope();

      // Mailings pendientes desde tu propia consulta
      MailingModel filtro = new MailingModel
      {
        MAILING_ID = null,
        INIT = 0,
        ROWS = 10000,
        ESTADO = "PENDIENTE"
      };

      var pendientes = await _consultasContacto.ListarMailings(filtro);

      var scheduler = await _schedulerFactory.GetScheduler();

      foreach (var p in pendientes)
      {
        var jobKey = new JobKey($"mailing_job_{p.MAILING_ID}");

        // Ya está programado en Quartz → saltar
        if (await scheduler.CheckExists(jobKey))
          continue;

        // Crear JOB
        var job = JobBuilder.Create<JobEnviarMailing>()
            .WithIdentity(jobKey)
            .UsingJobData("mailingId", (p.MAILING_ID ?? 0).ToString())
            .Build();

        // ---- FECHA SEGURA ----

        DateTime fechaProgramada = p.FPROGRAMADA ?? DateTime.Now.AddSeconds(5);

        if (fechaProgramada < DateTime.Now)
          fechaProgramada = DateTime.Now.AddSeconds(5);

        // -----------------------

        var trigger = TriggerBuilder.Create()
            .WithIdentity($"mailing_trigger_{p.MAILING_ID}")
            .StartAt(fechaProgramada)
            .Build();

        await scheduler.ScheduleJob(job, trigger);
      }
    }


    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
  }

}
