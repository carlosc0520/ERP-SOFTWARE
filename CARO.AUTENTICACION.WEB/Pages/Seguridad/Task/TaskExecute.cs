using CARO.CONFIG;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.CONSULTAS.SEG;
using CARO.DATOS.MODELO.COM.CASO;
using CARO.DATOS.MODELO.COM.GESTION;
using CARO.DATOS.MODELO.SEG.GRUPODATO;
using CARO.DATOS.MODELO.SEG.TAREA;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Globalization;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace CARO.AUTENTICACION.WEB.Pages.Seguridad.Task
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  [Route("api/[controller]")]
  public class TaskExecute : Controller
  {
    private readonly IConfiguration _configuration;
    private readonly IConsultasCasosMasivos _consultasCasosMasivos;
    private readonly IConsultasCasos _consultasCasos;
    private readonly IConsultasGrupoDato _consultasGrupoDato;
    private readonly IConsultasLogTareas _consultasLogTareas; // AGREGAR
    private readonly IMemoryCache _cache;
    private static readonly TimeZoneInfo _peruTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");

    // Cache keys para evitar ejecuciones duplicadas en memoria
    private const string CACHE_KEY_PENDIENTES_DCC = "TAREA_PENDIENTES_DCC_";
    private const string CACHE_KEY_VENCIDOS = "TAREA_VENCIDOS_";
    private const int CACHE_DURACION_MINUTOS = 60; // 1 hora

    private const string EMAIL_HEADER = @"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{0}</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f7fa;'>
    <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color: #f5f7fa; padding: 20px 0;'>
        <tr>
            <td align='center'>
                <table width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width: 900px; background-color: #ffffff; border-radius: 8px;'>
                    <tr>
                        <td style='background-color: #FF6A16; padding: 40px 30px; text-align: center;'>
                            <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                                <tr>
                                    <td style='text-align: center;'>
                                        <div style='display: inline-block; background-color: #ff8c42; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px;'>
                                            NOTIFICACIÓN AUTOMÁTICA
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='text-align: center;'>
                                        <h2 style='color: #ffffff; font-size: 26px; font-weight: 600; margin: 10px 0 0 0;'>{1}</h2>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 40px 30px;'>";

    private const string EMAIL_FOOTER = @"
                            <table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin-top: 30px;'>
                                <tr>
                                    <td style='border-top: 1px solid #dee2e6; padding-top: 30px;'>
                                        <p style='color: #808080; font-size: 13px; text-align: center; margin: 0;'>
                                            Este es un correo automático. Por favor, no responda a este mensaje.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 3px solid #FF6A16;'>
                            <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                                <tr>
                                    <td style='text-align: center;'>
                                        <p style='font-size: 14px; color: #808080; margin: 8px 0;'>
                                            Visítanos en <a href='https://ccfirma.com' style='color: #FF6A16; text-decoration: none; font-weight: 600;'>ccfirma.com</a>
                                        </p>
                                        <p style='font-size: 12px; color: #808080; margin: 8px 0;'>
                                            © 2026 CARO ASOCIADOS - Todos los derechos reservados
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    public TaskExecute(
         IMediator mediator,
         IConsultasCasosMasivos consultasCasosMasivos,
         IConsultasCasos consultasCasos,
         IConsultasGrupoDato consultasGrupoDato,
         IConsultasLogTareas consultasLogTareas, // AGREGAR
         IMemoryCache cache,
         IConfiguration configuration
       )
    {
      _consultasCasosMasivos = consultasCasosMasivos;
      _consultasCasos = consultasCasos;
      _consultasGrupoDato = consultasGrupoDato;
      _consultasLogTareas = consultasLogTareas; // AGREGAR
      _cache = cache;
      _configuration = configuration;
    }

    #region CASOS
    [HttpGet("CasesTask")]
    public async Task<IActionResult> OnGetCasesTaskAsync([FromQuery] string key)
    {
      var expectedKey = _configuration["TaskScheduler:ApiKey"];

      if (string.IsNullOrWhiteSpace(key) || key != expectedKey)
      {
        return Unauthorized(new { error = "API Key inválida" });
      }

      var resultados = new List<string>();
      var errores = new List<string>();
      var tareasOmitidas = new List<string>();

      try
      {
        var resultGD = await _consultasGrupoDato.ObtenerAll(new GrupoDatoModel { GDTOS = "GDCASESTASK" });

        // Tarea 1: Casos Pendientes Honorarios DCC
        await EjecutarTareaPendientesDCC(resultGD, resultados, errores, tareasOmitidas);

        // Tarea 2: Casos Vencidos Trabajados
        await EjecutarTareaVencidosTrabajados(resultGD, resultados, errores, tareasOmitidas);

        // Retornar resultado combinado
        return new JsonResult(new
        {
          EsSatisfactoria = true,
          message = "Proceso de tareas completado",
          tareasEjecutadas = resultados.Count,
          tareasOmitidas = tareasOmitidas.Count,
          errores = errores.Count,
          detalles = resultados,
          omitidas = tareasOmitidas.Count > 0 ? tareasOmitidas : null,
          erroresDetalle = errores.Count > 0 ? errores : null
        });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { error = "Error interno del servidor", detalles = ex.Message, erroresAdicionales = errores });
      }
    }

    private async System.Threading.Tasks.Task EjecutarTareaPendientesDCC(List<GrupoDatoModel> resultGD, List<string> resultados, List<string> errores, List<string> tareasOmitidas)
    {
      const string TIPO_TAREA = "PENDIENTES_DCC";

      try
      {
        var taskConfig = resultGD.FirstOrDefault(x => x.VLR1 == "1");
        if (taskConfig == null) return;

        if (!ValidarEjecucionProgramada(taskConfig.VLR2, out string diaEjecucion, out string horaEjecucion, out string horaActual))
        {
          tareasOmitidas.Add($"{TIPO_TAREA}: No es el momento programado (Programado: {diaEjecucion} {horaEjecucion}, Actual: {horaActual})");
          return;
        }

        //// Verificar si ya se ejecutó hoy usando cache
        //string cacheKey = $"{CACHE_KEY_PENDIENTES_DCC}{DateTime.Now:yyyyMMdd}";
        //if (_cache.TryGetValue(cacheKey, out bool _))
        //{
        //  tareasOmitidas.Add($"{TIPO_TAREA}: Ya ejecutada hoy (cache)");
        //  return;
        //}

        // Verificar en base de datos si ya se ejecutó en la última hora
        if (await YaSeEjecutoTarea(TIPO_TAREA, diaEjecucion, horaEjecucion))
        {
          tareasOmitidas.Add($"{TIPO_TAREA}: Ya ejecutada hoy (BD)");
          //_cache.Set(cacheKey, true, TimeSpan.FromMinutes(CACHE_DURACION_MINUTOS));
          return;
        }

        var casosPendientes = await _consultasCasos.ListarCasos(new CasosModel
        {
          GDACCNSCMRCLS = "3",
          INIT = 0,
          ROWS = 1000,
          IDEMPRSA = 1
        });

        if (casosPendientes == null || casosPendientes.Count == 0)
        {
          await RegistrarEjecucionTarea(TIPO_TAREA, diaEjecucion, horaEjecucion, 0, "", "EXITOSA", "No hay casos pendientes");
          resultados.Add($"{TIPO_TAREA}: No hay casos pendientes");
          //_cache.Set(cacheKey, true, TimeSpan.FromMinutes(CACHE_DURACION_MINUTOS));
          return;
        }

        var correosEnviados = await EnviarCorreosNotificacion(
          taskConfig.VLR3,
          GetEmailBodyCasosPendientesDCC(casosPendientes),
          $"Casos Pendientes Honorarios DCC - {casosPendientes.Count} caso(s)"
        );

        await RegistrarEjecucionTarea(TIPO_TAREA, diaEjecucion, horaEjecucion, casosPendientes.Count, string.Join(", ", correosEnviados), "EXITOSA", null);

        // Guardar en cache para evitar re-ejecución
        //_cache.Set(cacheKey, true, TimeSpan.FromMinutes(CACHE_DURACION_MINUTOS));

        resultados.Add($"{TIPO_TAREA}: {casosPendientes.Count} casos, {correosEnviados.Length} correos enviados");
      }
      catch (Exception ex)
      {
        errores.Add($"Error en {TIPO_TAREA}: {ex.Message}");
        await RegistrarEjecucionTarea(TIPO_TAREA, "", "", 0, "", "ERROR", ex.Message);
      }
    }

    private async System.Threading.Tasks.Task EjecutarTareaVencidosTrabajados(List<GrupoDatoModel> resultGD, List<string> resultados, List<string> errores, List<string> tareasOmitidas)
    {
      const string TIPO_TAREA = "VENCIDOS_TRABAJADOS";

      try
      {
        var taskConfig = resultGD.FirstOrDefault(x => x.VLR1 == "2");
        if (taskConfig == null) return;

        if (!ValidarEjecucionProgramada(taskConfig.VLR2, out string diaEjecucion, out string horaEjecucion, out string horaActual))
        {
          tareasOmitidas.Add($"{TIPO_TAREA}: No es el momento programado (Programado: {diaEjecucion} {horaEjecucion}, Actual: {horaActual})");
          return;
        }

        // Verificar si ya se ejecutó hoy usando cache
        //string cacheKey = $"{CACHE_KEY_VENCIDOS}{DateTime.Now:yyyyMMdd}";
        //if (_cache.TryGetValue(cacheKey, out bool _))
        //{
        //  tareasOmitidas.Add($"{TIPO_TAREA}: Ya ejecutada hoy (cache)");
        //  return;
        //}

        // Verificar en base de datos si ya se ejecutó en la última hora
        if (await YaSeEjecutoTarea(TIPO_TAREA, diaEjecucion, horaEjecucion))
        {
          tareasOmitidas.Add($"{TIPO_TAREA}: Ya ejecutada hoy (BD)");
          //_cache.Set(cacheKey, true, TimeSpan.FromMinutes(CACHE_DURACION_MINUTOS));
          return;
        }

        var casosVencidos = await _consultasCasosMasivos.ListarCasos(new CasoModel
        {
          GDSMFROCSO = "4",
          INIT = 0,
          ROWS = 1000,
          IDEMPRSA = 1
        });

        if (casosVencidos == null || casosVencidos.Count == 0)
        {
          await RegistrarEjecucionTarea(TIPO_TAREA, diaEjecucion, horaEjecucion, 0, "", "EXITOSA", "No hay casos vencidos");
          resultados.Add($"{TIPO_TAREA}: No hay casos vencidos");
          //_cache.Set(cacheKey, true, TimeSpan.FromMinutes(CACHE_DURACION_MINUTOS));
          return;
        }

        var correosEnviados = await EnviarCorreosNotificacion(
          taskConfig.VLR3,
          GetEmailBodyCasosVencidosTrabajados(casosVencidos),
          $"Casos Vencidos Trabajados - {casosVencidos.Count} caso(s)"
        );

        await RegistrarEjecucionTarea(TIPO_TAREA, diaEjecucion, horaEjecucion, casosVencidos.Count, string.Join(", ", correosEnviados), "EXITOSA", null);

        // Guardar en cache para evitar re-ejecución
        //_cache.Set(cacheKey, true, TimeSpan.FromMinutes(CACHE_DURACION_MINUTOS));

        resultados.Add($"{TIPO_TAREA}: {casosVencidos.Count} casos, {correosEnviados.Length} correos enviados");
      }
      catch (Exception ex)
      {
        errores.Add($"Error en {TIPO_TAREA}: {ex.Message}");
        await RegistrarEjecucionTarea(TIPO_TAREA, "", "", 0, "", "ERROR", ex.Message);
      }
    }

    private bool ValidarEjecucionProgramada(string configuracion, out string diaEjecucion, out string horaEjecucion, out string horaActual)
    {
      diaEjecucion = string.Empty;
      horaEjecucion = string.Empty;
      horaActual = string.Empty;

      var partes = configuracion?.Split('|');
      if (partes == null || partes.Length != 2)
        return false;

      diaEjecucion = partes[0].ToUpper();
      horaEjecucion = partes[1];

      var culturaEspanol = new CultureInfo("es-ES");
      var ahora = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _peruTimeZone);
      var diaActual = culturaEspanol.DateTimeFormat.GetDayName(ahora.DayOfWeek).ToUpper();
      horaActual = ahora.ToString("HH:mm");

      // Validar día
      if (diaEjecucion != diaActual)
        return false;

      // Validar hora con ventana de ±5 minutos
      if (!TimeSpan.TryParse(horaEjecucion, out TimeSpan horaProgramada))
        return false;

      if (!TimeSpan.TryParse(horaActual, out TimeSpan horaActualSpan))
        return false;

      var diferencia = Math.Abs((horaProgramada - horaActualSpan).TotalMinutes);

      // Permitir ejecución si está dentro de los 5 minutos antes o después
      return diferencia <= 5;
    }

    private async System.Threading.Tasks.Task<bool> YaSeEjecutoTarea(string tipoTarea, string diaEjecucion, string horaEjecucion)
    {
      try
      {
        var hoy = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _peruTimeZone).Date;
        return await _consultasLogTareas.YaSeEjecutoTarea(tipoTarea, hoy);
      }
      catch
      {
        return false;
      }
    }


    private async System.Threading.Tasks.Task RegistrarEjecucionTarea(string tipoTarea, string diaEjecucion, string horaEjecucion, int casosEncontrados, string correosEnviados, string estado, string mensajeError)
    {
      try
      {
        var ahora = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _peruTimeZone);

        var log = new LogTareaEjecutadaModel
        {
          TipoTarea = tipoTarea,
          FechaEjecucion = ahora,
          DiaEjecucion = diaEjecucion,
          HoraEjecucion = horaEjecucion,
          CasosEncontrados = casosEncontrados,
          CorreosEnviados = correosEnviados,
          Estado = estado,
          MensajeError = mensajeError
        };

        await _consultasLogTareas.RegistrarEjecucion(log);
      }
      catch (Exception ex)
      {
        // Log del error pero no detener la ejecución
        Console.WriteLine($"Error al registrar log: {ex.Message}");
      }
    }
    private async System.Threading.Tasks.Task<string[]> EnviarCorreosNotificacion(string destinatariosStr, string emailBody, string asunto)
    {
      if (string.IsNullOrWhiteSpace(destinatariosStr))
        return Array.Empty<string>();

      var correosLimpios = destinatariosStr
        .Split(',')
        .Select(c => c.Trim())
        .Where(c => !string.IsNullOrEmpty(c))
        .ToArray();

      if (correosLimpios.Length > 0)
      {
        await SendEmailAsync(emailBody, correosLimpios, asunto);
      }

      return correosLimpios;
    }

    private string GetEmailBodyCasosPendientesDCC(List<CasosModel> casosPendientes)
    {
      var fActual = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _peruTimeZone).ToString("dd-MM-yyyy hh:mm tt", new CultureInfo("es-PE"));

      var filasTabla = new StringBuilder();
      int contador = 1;

      foreach (var caso in casosPendientes)
      {
        filasTabla.Append($@"
                                        <tr>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61; text-align: center; font-weight: 600;'>{contador}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.DIDCLENTE ?? "N/A"}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.CASO ?? "N/A"}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.DIDEQPO ?? "N/A"}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.DGDAREACSO ?? "N/A"}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.DGDESTDOPRCSL ?? "N/A"}</td>
                                        </tr>");
        contador++;
      }

      return GenerarEmailCompleto(
        "Casos Pendientes Honorarios DCC",
        "📋 Casos Pendientes Honorarios DCC",
        "Se han identificado casos que están pendientes de honorarios DCC y requieren atención inmediata.",
        casosPendientes.Count,
        "casos pendientes",
        new[] { "#", "Cliente", "Caso", "Equipo", "Área", "Estado Procesal" },
        filasTabla.ToString(),
        fActual,
        "Pendientes Honorarios DCC"
      );
    }

    private string GetEmailBodyCasosVencidosTrabajados(List<CasoModel> casosVencidos)
    {
      var fActual = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _peruTimeZone).ToString("dd-MM-yyyy hh:mm tt", new CultureInfo("es-PE"));

      var filasTabla = new StringBuilder();
      int contador = 1;

      foreach (var caso in casosVencidos)
      {
        filasTabla.Append($@"
                                        <tr>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61; text-align: center; font-weight: 600;'>{contador}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.DIDCLNTE ?? "N/A"}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.CASO ?? "N/A"}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.DGDAREACSO ?? "N/A"}</td>
                                            <td style='padding: 12px 10px; border-bottom: 1px solid #dee2e6; font-size: 14px; color: #575F61;'>{caso.NAMEABGDS ?? "N/A"}</td>
                                        </tr>");
        contador++;
      }

      return GenerarEmailCompleto(
        "Casos Vencidos Trabajados",
        "⚠️ Casos Vencidos Trabajados",
        "Se han identificado casos que están vencidos trabajados y requieren atención inmediata.",
        casosVencidos.Count,
        "casos",
        new[] { "#", "Cliente", "Caso", "Área", "Abogados(as)" },
        filasTabla.ToString(),
        fActual,
        "Vencidos Trabajados"
      );
    }

    private string GenerarEmailCompleto(string titulo, string encabezado, string motivo, int totalCasos, string labelCasos, string[] columnas, string filasTabla, string fechaNotificacion, string estado)
    {
      var columnasHtml = new StringBuilder();
      foreach (var columna in columnas)
      {
        var align = columna == "#" ? "center" : "left";
        var width = columna == "#" ? " width: 50px;" : "";
        columnasHtml.Append($@"
                                                    <th style='padding: 15px 10px; text-align: {align}; font-size: 13px; font-weight: 600; color: #ffffff; border-bottom: 2px solid #ff8c42;{width}'>{columna}</th>");
      }

      var emailContent = $@"
                            <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                                <tr>
                                    <td>
                                        <p style='font-size: 16px; color: #575F61; margin: 0 0 15px 0; font-weight: 500;'>
                                            Estimado Equipo,
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='background-color: #fff3e0; border-left: 4px solid #FF6A16; padding: 20px; margin: 25px 0; border-radius: 8px;'>
                                        <p style='font-size: 15px; color: #575F61; line-height: 1.8; margin: 0;'>
                                            <strong>MOTIVO:</strong> {motivo}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px 20px; margin: 20px 0; border-radius: 8px;'>
                                        <p style='font-size: 15px; color: #575F61; margin: 0;'>
                                            <strong>● Total de {labelCasos}:</strong> {totalCasos}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding: 25px 0 15px 0;'>
                                        <p style='color: #575F61; font-size: 16px; margin: 0;'>
                                            A continuación, el detalle completo de los casos:
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width='100%' cellpadding='0' cellspacing='0' border='0' style='border-collapse: collapse; background-color: #ffffff;'>
                                            <thead>
                                                <tr style='background-color: #FF6A16;'>{columnasHtml}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filasTabla}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='background-color: #f8f9fa; border-left: 4px solid #FF6A16; padding: 20px; margin: 20px 0; border-radius: 8px;'>
                                        <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                                            <tr>
                                                <td style='padding-bottom: 10px;'>
                                                    <p style='font-size: 14px; color: #575F61; margin: 0;'>
                                                        <strong>● Fecha de Notificación:</strong> {fechaNotificacion}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-bottom: 10px;'>
                                                    <p style='font-size: 14px; color: #575F61; margin: 0;'>
                                                        <strong>● Acción Requerida:</strong> Revisar y procesar los casos
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <p style='font-size: 14px; color: #575F61; margin: 0;'>
                                                        <strong>● Estado:</strong> {estado}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>";

      return string.Format(EMAIL_HEADER, titulo, encabezado) + emailContent + EMAIL_FOOTER;
    }
    #endregion CASOS

    #region CORREOS
    private async System.Threading.Tasks.Task SendEmailAsync(string body, string[] destinatarios, string asunto)
    {
      using var smtpClient = new SmtpClient("smtp.gmail.com", 587)
      {
        Credentials = new NetworkCredential(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, ConfiguracionProyecto.CORREOS_CONTACTO.KEY),
        EnableSsl = true,
      };

      using var mailMessage = new MailMessage
      {
        From = new MailAddress(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, "CCFIRMA - GESTIÓN"),
        Subject = asunto,
        Body = body,
        IsBodyHtml = true
      };

      foreach (var destinatario in destinatarios)
      {
        mailMessage.To.Add(destinatario);
      }

      await smtpClient.SendMailAsync(mailMessage);
    }
    #endregion
  }
}
