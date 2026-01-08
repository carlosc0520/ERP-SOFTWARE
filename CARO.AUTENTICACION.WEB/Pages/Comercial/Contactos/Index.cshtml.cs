using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.CORE.Models;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.CONSULTAS.SEG;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;
using CARO.DATOS.MODELO.COM.CONTACTO;
using CARO.DATOS.MODELO.SEG.GRUPODATO;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Quartz.Util;
using System.Text.Json;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Contactos
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasContacto _consultasContacto;
    private readonly IConsultasGrupoDato _consultasGrupoDato;

    private readonly FileUploads _fileUploads;
    private readonly EventosHandler _eventosHandler;
    private readonly SchedulerService _schedulerService;

    public IndexModel(
      IConsultasContacto consultasContacto,
      IMediator mediator,
      SchedulerService schedulerService,
      IConsultasGrupoDato consultasGrupoDato
    )
    {
      _consultasContacto = consultasContacto;
      _mediator = mediator;
      _fileUploads = new FileUploads();
      _eventosHandler = new EventosHandler();
      _schedulerService = schedulerService;
      _consultasGrupoDato = consultasGrupoDato;
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

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarMailingsAsync([FromQuery] MailingModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        custom.UCRCN = HttpContextDraw.User(HttpContext, 1);
        var cursos = await _consultasContacto.ListarMailings(custom);
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

    #region MAILINGS  
    [HttpPost]
    public async Task<IActionResult> OnPostSendMailingAsync([FromForm] ComandoCorreoInsertar comando)
    {
      try
      {
        // ---------------------------
        // ✔ Validaciones iniciales
        // ---------------------------
        if (comando == null)
          return BadRequest("El comando recibido es nulo.");

        if (string.IsNullOrWhiteSpace(comando.MSJE))
          return BadRequest("El mensaje HTML no puede estar vacío.");

        if (string.IsNullOrWhiteSpace(comando.CORREOSEND))
          return BadRequest("Debe configurar el correo de envio.");

        if (string.IsNullOrWhiteSpace(comando.ASNTO))
          comando.ASNTO = "(sin asunto)";

        // ---------------------------
        // ✔ Separar destinatarios
        // ---------------------------
        if (comando.CNTCTS == null || comando.CNTCTS.Count == 0)
          return BadRequest("Debe proporcionar al menos un destinatario.");

        // Limpiar, normalizar y eliminar duplicados
        List<string> destinatarios = comando.CNTCTS
            .Select(x => x?.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (destinatarios.Count == 0)
          return BadRequest("No se encontraron destinatarios válidos.");

        try
        {
          // ---------------------------
          // ✔ Subir imágenes si existen
          // ---------------------------
          List<AdjuntosCorreoMalingModel>? imagenesSubidas = null;

          if (comando.DATA != null && comando.DATA.Any())
          {
            try
            {
              imagenesSubidas = await _fileUploads.UploadMailingImagesAsync(comando.DATA);

              if (imagenesSubidas != null)
              {
                foreach (var img in imagenesSubidas)
                {
                  if (!string.IsNullOrEmpty(img?.URIIMG) && !string.IsNullOrEmpty(img?.INDEX))
                  {
                    comando.MSJE = comando.MSJE.Replace(
                        $"src=\"{img.INDEX}\"",
                        $"src=\"{img.URIIMG}\""
                    );
                  }
                }
              }
            }
            catch (Exception ex)
            {
              return StatusCode(500, new { success = false, error = $"Error al subir imágenes: {ex.Message}" });
            }
          }

          // ---------------------------
          // ✔ Obtener usuario actual
          // ---------------------------
          string usuarioActual = "automatic_mailing";
          try
          {
            usuarioActual = HttpContextDraw.User(HttpContext, 1) ?? "automatic_mailing";
          }
          catch { }
          comando.UCRCN = usuarioActual;

          // ---------------------------
          // ✔ Preparar JSON de imágenes
          // ---------------------------
          string? imagenesJson = null;
          try
          {
            if (imagenesSubidas != null)
            {
              imagenesJson = JsonSerializer.Serialize(new
              {
                imagenes = imagenesSubidas.Select(i => new
                {
                  i.INDEX,
                  i.URIIMG,
                  i.URL,
                  TYPE = i.TYPE
                })
              });
            }
          }
          catch (Exception ex)
          {
            return StatusCode(500, new { success = false, error = $"Error serializando imágenes: {ex.Message}" });
          }

          // ---------------------------
          // ✔ Insertar mailing (SP)
          // ---------------------------
          var comandoMailingInsertar = new ComandoMailingInsertar
          {
            MAILING_ID = 0,
            INDICADOR = 1,
            ASUNTO = comando.ASNTO,
            CUERPO_HTML = comando.MSJE,
            IMAGENES_JSON = imagenesJson,
            UCRCN = comando.UCRCN,
            DESTINATARIOS = string.Join(',', destinatarios),
            DESTINATARIO = null,
            MENSAJE = comando.MENSAJE,
            FPROGRAMADA = comando.FPROGRAMADA,
            ESTADO = comando.FPROGRAMADA != null ? "PENDIENTE" : "ENVIADO",
            EVENTO = "SENT",
            IDMRCA = comando.IDMRCA,
            CORREOSEND = comando.CORREOSEND,
            PLACEHOLDER = comando.PLACEHOLDER
          };

          var respuestaSP = await _mediator.Send(comandoMailingInsertar);
          decimal mailingId = respuestaSP?.CodEstado ?? -1;

          if (mailingId <= 0)
            return StatusCode(500, new { success = false, error = "No se pudo insertar el mailing en BD." });

          // ---------------------------
          // ✔ Programación futura
          // ---------------------------
          if (comando.FPROGRAMADA != null)
          {
            return new JsonResult(new
            {
              success = true,
              mailingId,
              message = "Se programó el envío correctamente."
            });
          }


          // ---------------------------
          // ✔ llamada para el secret key
          // ---------------------------
          EmailSendModel correoModel = await _consultasGrupoDato.obtenerEmailSend(new EmailSendModel
          {
            CRREO = comando.CORREOSEND
          });

          if (correoModel == null || string.IsNullOrEmpty(correoModel.SECRETKEY))
          {
            return StatusCode(500, new
            {
              success = false,
              error = "No se pudo obtener la configuración del correo de envío."
            });
          }


          // ---------------------------
          // ✔ Envío en paralelo
          // ---------------------------
          var tareas = destinatarios.Select(email =>
          {
            return _eventosHandler.EnviarCorreoIndividualAsync(
                email,
                comando.ASNTO,
                comando.MSJE,
                mailingId,
                imagenesSubidas,
                comando.CONTACTOS_DATA,
                comando.CORREOSEND,
                correoModel.SECRETKEY,
                comando.PLACEHOLDER
            );
          });

          var resultados = await Task.WhenAll(tareas);

          return new JsonResult(new
          {
            success = true,
            mailingId,
            resultados,
            message = "Correos enviados correctamente."
          });
        }
        catch (Exception ex)
        {
          return StatusCode(500, new
          {
            success = false,
            error = ex.Message,
            detail = ex.ToString()
          });
        }
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }


    [HttpGet]
    public async Task<IActionResult> OnGetRunPendingMailingsAsync()
    {
      try
      {
        await _schedulerService.RunPendingsNowAsync();
        return new JsonResult(new { success = true, message = "Processos ejecutados correctamente." });
      }
      catch (Exception ex)
      {
        return StatusCode(500, ex.Message);
      }
    }


    #endregion

    #region ENDPOINTS_METRICAS_MAILING
    [HttpGet]
    public async Task<IActionResult> OnGetMailingOpenAsync([FromQuery] int mailingId, [FromQuery] string destinatario)
    {
      if (mailingId <= 0 || string.IsNullOrEmpty(destinatario))
        return BadRequest("Parámetros inválidos");

      var comando = new ComandoMailingInsertar
      {
        MAILING_ID = mailingId,
        INDICADOR = 2,
        DESTINATARIO = destinatario,
        EVENTO = "OPEN"
      };

      await _mediator.Send(comando);

      // Devuelve una imagen transparente para el pixel tracking
      return File(new byte[] { }, "image/png");
    }

    // 🔹 Click en enlaces o imágenes
    [HttpGet]
    public async Task<IActionResult> OnGetMailingClickAsync([FromQuery] int mailingId, [FromQuery] string destinatario, [FromQuery] string link, [FromQuery] string index = null, [FromQuery] string type = null)
    {
      if (mailingId <= 0 || string.IsNullOrEmpty(destinatario) || string.IsNullOrEmpty(link))
        return BadRequest("Parámetros inválidos");

      var evento = "CLICK" + (string.IsNullOrEmpty(index) ? "" : $"_IMG{index}");

      var comando = new ComandoMailingInsertar
      {
        MAILING_ID = mailingId,
        INDICADOR = 2,
        DESTINATARIO = destinatario,
        EVENTO = evento
      };

      await _mediator.Send(comando);

      // Redirige al link real
      return Redirect(link);
    }

    // 🔹 Reenvío del correo
    [HttpGet]
    public async Task<IActionResult> OnGetMailingForwardAsync([FromQuery] int mailingId, [FromQuery] string destinatario)
    {
      if (mailingId <= 0 || string.IsNullOrEmpty(destinatario))
        return BadRequest("Parámetros inválidos");

      var comando = new ComandoMailingInsertar
      {
        MAILING_ID = mailingId,
        INDICADOR = 2,
        DESTINATARIO = destinatario,
        EVENTO = "FORWARD"
      };

      await _mediator.Send(comando);

      // No se necesita contenido, solo registrar evento
      return new EmptyResult();
    }

    // 🔹 Cancelación de suscripción
    [HttpGet]
    public async Task<IActionResult> OnGetUnsbscribeMailingAsync([FromQuery] int mailingId, [FromQuery] string destinatario)
    {
      if (mailingId <= 0 || string.IsNullOrEmpty(destinatario))
        return BadRequest("Parámetros inválidos");

      var comando = new ComandoMailingInsertar
      {
        MAILING_ID = mailingId,
        INDICADOR = 3,
        DESTINATARIO = destinatario,
        EVENTO = "UNSUBSCRIBE"
      };

      await _mediator.Send(comando);

      return Redirect("https://ccfirma.com/hablamos/");
    }

    // 🔹 Marcado como SPAM
    [HttpGet]
    public async Task<IActionResult> OnGetMailingSpamAsync([FromQuery] int mailingId, [FromQuery] string destinatario)
    {
      if (mailingId <= 0 || string.IsNullOrEmpty(destinatario))
        return BadRequest("Parámetros inválidos");

      var comando = new ComandoMailingInsertar
      {
        MAILING_ID = mailingId,
        INDICADOR = 2,
        DESTINATARIO = destinatario,
        EVENTO = "SPAM"
      };

      await _mediator.Send(comando);

      return new EmptyResult();
    }

    // 🔹 Conversión (por ejemplo, compra o acción completada)
    [HttpGet]
    public async Task<IActionResult> OnGetMailingConversionAsync([FromQuery] int mailingId, [FromQuery] string destinatario)
    {
      if (mailingId <= 0 || string.IsNullOrEmpty(destinatario))
        return BadRequest("Parámetros inválidos");

      var comando = new ComandoMailingInsertar
      {
        MAILING_ID = mailingId,
        INDICADOR = 2,
        DESTINATARIO = destinatario,
        EVENTO = "CONVERSION"
      };

      await _mediator.Send(comando);

      return new EmptyResult();
    }

    // 🔹 Enlace fallido / bounce
    [HttpGet]
    public async Task<IActionResult> OnGetMailingLinkBounceAsync([FromQuery] int mailingId, [FromQuery] string destinatario)
    {
      if (mailingId <= 0 || string.IsNullOrEmpty(destinatario))
        return BadRequest("Parámetros inválidos");

      var comando = new ComandoMailingInsertar
      {
        MAILING_ID = mailingId,
        INDICADOR = 2,
        DESTINATARIO = destinatario,
        EVENTO = "LINK_BOUNCE"
      };

      await _mediator.Send(comando);

      return new EmptyResult();
    }

    #endregion


  }
}
