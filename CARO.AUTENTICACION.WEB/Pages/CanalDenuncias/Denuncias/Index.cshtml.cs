using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.CANALDENUNCIAS;
using CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS;
using CARO.DATOS.MODELO.CANALDENUNCIAS;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ScottPlot.Drawing.Colorsets;
using System.Net;
using System.Net.Mail;
using System.Text.Json;

namespace CARO.AUTENTICACION.WEB.Pages.CanalDenuncias.Denuncias
{
  [IgnoreAntiforgeryToken(Order = 1001)]

  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;
    private readonly IConsultasDenuncias _consultasDenuncias;
    private readonly IConsultasConfiguracion _consultasConfiguracion;

    private string PATH = "CCFIRMA/DENUNCIAS";

    public IndexModel(
      IConsultasDenuncias consultasDenuncias,
      IConsultasConfiguracion consultasConfiguracion,
      IMediator mediator
    )
    {
      _consultasDenuncias = consultasDenuncias;
      _consultasConfiguracion = consultasConfiguracion;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }


    #region DENUNCIAS
    [HttpGet]
    public async Task<IActionResult> OnGetDenunciasAsync([FromQuery] DenunciaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        custom.IDRECEPTOR = int.Parse(HttpContextDraw.User(HttpContext, 2));
        var data = await _consultasDenuncias.ListarDenuncias(custom);

        if (data?.Any() == true && custom.ID != null && custom.ID > 0)
        {
          DenunciaModel primero = data.FirstOrDefault();

          if (primero != null)
          {
            primero.TESTIGOS = !string.IsNullOrEmpty(primero.JSON_TESTIGOS)
                ? JsonSerializer.Deserialize<List<TestigoModel>>(primero.JSON_TESTIGOS)
                : new List<TestigoModel>();

            primero.DOCUMENTOS = !string.IsNullOrEmpty(primero.JSON_DOCUMENTOS)
                ? JsonSerializer.Deserialize<List<DocumentoModel>>(primero.JSON_DOCUMENTOS)
                : new List<DocumentoModel>();

            primero.CHAT = !string.IsNullOrEmpty(primero.JSON_CHAT)
              ? JsonSerializer.Deserialize<List<ChatDenunciaModel>>(primero.JSON_CHAT)
              : new List<ChatDenunciaModel>();

            primero.IDACT = int.Parse(HttpContextDraw.User(HttpContext, 2));
            foreach (var doc in primero.DOCUMENTOS)
            {
              doc.RUTA = ConfiguracionProyecto.DISK + doc.RUTA;
            }
          }

          return new JsonResult(new
          {
            success = true,
            data = primero,
            draw = custom.DRAW
          });
        }

        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new
        {
          success = true,
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = data,
          draw = custom.DRAW
        });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpGet]
    public async Task<IActionResult> OnGetDenunciasFindAsync([FromQuery] DenunciaModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasDenuncias.ListarDenunciasFind(custom);

        if (data?.Any() == true && custom.ID != null && custom.ID > 0)
        {
          DenunciaModel primero = data.FirstOrDefault();

          if (primero != null)
          {
            primero.TESTIGOS = !string.IsNullOrEmpty(primero.JSON_TESTIGOS)
                ? JsonSerializer.Deserialize<List<TestigoModel>>(primero.JSON_TESTIGOS)
                : new List<TestigoModel>();

            primero.DOCUMENTOS = !string.IsNullOrEmpty(primero.JSON_DOCUMENTOS)
                ? JsonSerializer.Deserialize<List<DocumentoModel>>(primero.JSON_DOCUMENTOS)
                : new List<DocumentoModel>();

            primero.CHAT = !string.IsNullOrEmpty(primero.JSON_CHAT)
              ? JsonSerializer.Deserialize<List<ChatDenunciaModel>>(primero.JSON_CHAT)
              : new List<ChatDenunciaModel>();

            foreach (var doc in primero.DOCUMENTOS)
            {
              doc.RUTA = ConfiguracionProyecto.DISK + doc.RUTA;
            }
          }

          return new JsonResult(new
          {
            success = true,
            data = primero,
            draw = custom.DRAW
          });
        }

        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new
        {
          success = true,
          recordsTotal = totalRows,
          recordsFiltered = totalRows,
          data = data,
          draw = custom.DRAW
        });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostValidateDenunciaAsync([FromForm] ValidateDenunciaModel custom)
    {
      try
      {
        var data = await _consultasDenuncias.FindDenuncia(custom);

        if (data == null || (data is IEnumerable<object> collection && !collection.Any()))
        {
          return new JsonResult(new { success = false, message = "Los datos son incorrectos, no se encontro la denuncia." });
        }

        return new JsonResult(new { success = true, data = data, id = data.ID });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Error en la validación", error = ex.Message });
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddDenunciaAsync([FromForm] ComandoDenunciaInsertar comando)
    {
      try
      {
        comando.UEDCN = "CANAL DENUNCIAS";
        comando.TESTIGOS = JsonSerializer.Deserialize<List<ComandoTestigoModel>>(comando.JSON_TESTIGOS);
        comando.DOCUMENTOS = JsonSerializer.Deserialize<List<ComandoDocumentoModel>>(comando.JSON_DOCUMENTOS);
        var gui = Guid.NewGuid().ToString();

        if (comando.FILES != null && comando.FILES.Count > 0)
        {
          foreach (var file in comando.FILES)
          {
            var fileName = Path.GetFileName(file.FileName);

            var documento = comando.DOCUMENTOS.FirstOrDefault(d => d.NARCHIVO == fileName);

            if (documento != null)
            {
              documento.SIZE = file.Length;
              documento.NARCHIVO = fileName;
              documento.RUTA = this.PATH + "/" + gui + "/" + fileName;
            }
          }

          var rutas = await _fileUploads.UploadFilesAsync(this.PATH + "/" + gui, comando.FILES, false);
        }



        var result = await _mediator.Send(comando);

        if (comando.CORREO != null)
        {
          string codEstado = result.CodEstado.ToString();
          string fechaDenuncia = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
          string correoDenunciante = comando.CORREO;
          string cuerpo = $@"
             <p>Estimado(a) {comando.APELLIDOS},{comando.NOMBRES}, le informamos de que
                su comunicación ha sido recibida correctamente. Para poder acceder a la información le solicitaremos
                la siguiente contraseña: {comando.CONTRASENA} con el identificador DENUNCIA_{result.CodEstado}. Guárdelo en un lugar seguro para conocer
                el avance de la denuncia.
             </p>
          ";
          await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fechaDenuncia, "Su denuncia fue admitida, pronto tendra noticias", "Denuncia Recibida", "https://canaletico.caroasociados.pe/modulos/ver-denuncias");
        }

        if (comando.IDRECEPTOR != null)
        {
          ReceptorModel receptorModel = new ReceptorModel();
          receptorModel.INIT = 0;
          receptorModel.ROWS = 1;
          receptorModel.IDEMPRESA = comando.IDEMPRESA.ToString();
          receptorModel.ID = comando.IDRECEPTOR;

          var resultReceptores = await _consultasConfiguracion.ListarReceptor(receptorModel);
          receptorModel = resultReceptores.FirstOrDefault();

          if (receptorModel != null && !string.IsNullOrEmpty(receptorModel.CORREO))
          {
            string codEstado = result.CodEstado.ToString();
            string fechaDenuncia = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
            string correoReceptor = receptorModel.CORREO;
            string cuerpo = $@"
             <p>Estimado(a) {receptorModel.NCMPTO}, le comunicamos que ha sido asignado a la denuncia {codEstado}
                con el rol de receptor. Entre en el canal para signar un decisor a la denuncia.</p>
            ";
            string url = "https://canaletico.caroasociados.pe/panel/denuncia/" + result.CodEstado.ToString();
            await EnviarCorreoAsync(cuerpo, correoReceptor, codEstado, fechaDenuncia, "Usted fue asignado(a) como Receptor(a)", "Asignación de denuncia como receptor", url);
          }
        }


        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddMovimientoAsync([FromForm] ComandoMovimientoDenunciaInsertar comando)
    {
      try
      {
        comando.IDUSER = int.Parse(HttpContextDraw.User(HttpContext, 2));
        var data = await _consultasDenuncias.ObtenerDataEmail(comando.IDDENUNCIA ?? 0);
        string codEstado = "";
        string fecha = "";
        string correoDenunciante = "";
        string cuerpo = "";
        string url = "";

        // MODIFICAR TIPO DE DENUNCIA
        if (comando.INDIC == 1 && data.CORREO != null && data != null)
        {
          codEstado = "";
          fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
          correoDenunciante = data.CORREO;
          cuerpo = $@"
             <p>Estimado(a) {data.NOMBRES}, Se modificó el tipo de la denuncia a {comando.DIDTPODENUNCIA}</p>
          ";
          await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Denuncia modificada");
        }

        // DESESTIMAR DENUNCIA
        if (comando.INDIC == 2 && data.CORREO != null && data != null)
        {
          codEstado = "";
          fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
          correoDenunciante = data.CORREO;
          cuerpo = $@"
                 <p>Estimado(a) {data.NOMBRES}, su denuncia fue desestimada por el motivo de:</p>
                 <p>{comando.COMENTARIO}</p>
              ";
          await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Denuncia desestimada");
        }

        if (comando.INDIC == 3) // ESTADO DE ASIGNACION DE EQUIPO
        {

          // informar usuario cambio de estado de denuncia
          if (data.CORREO != null && data != null)
          {
            codEstado = "";
            fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
            correoDenunciante = data.CORREO;
            cuerpo = $@"
                 <p>Estimado(a) {data.NOMBRES}, le comunicamos que su denuncia con identificador DENUNCIA_{comando.IDDENUNCIA} ha sido aceptada y procedemos a su tramitación</p>
              ";
            await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Denuncia Validada");
          }

          // informar al gestionador
          if (comando.CORREOREP != null)
          {
            codEstado = "";
            fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
            correoDenunciante = comando.CORREOREP;
            cuerpo = $@"
                 <p>Estimado(a) {comando.NOMBREREP ?? ""}, le comunicamos que Usted fue asignado como Gestionador de la Denuncia</p>
              ";
            url = "https://canaletico.caroasociados.pe/panel/denuncia/" + comando.IDDENUNCIA;
            await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Asignación de denuncia", url);
          }
        }

        if (comando.INDIC == 5) // ESTADO DE INVESTIGACIÓN
        {

          // informar usuario cambio de estado de denuncia
          if (data.CORREO != null && data != null)
          {
            codEstado = "";
            fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
            correoDenunciante = data.CORREO;
            cuerpo = $@"
                 <p>Estimado(a) {data.NOMBRES}, le comunicamos que su denuncia con identificador DENUNCIA_{comando.IDDENUNCIA} ha avanzado a la fase de investigación.</p>
              ";
            await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Cambio de Fase");
          }

          // informar al gestionador
          if (comando.CORREOREP != null)
          {
            codEstado = "";
            fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
            correoDenunciante = comando.CORREOREP;
            cuerpo = $@"
                 <p>Estimado(a) {comando.NOMBREREP ?? ""}, Usted fue asignado como Investigador de la denuncia</p>
              ";
            url = "https://canaletico.caroasociados.pe/panel/denuncia/" + comando.IDDENUNCIA;
            await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Asignación de denuncia", url);
          }
        }

        if (comando.INDIC == 6 && data.CORREOGEST != null) // ASIGNACION DE DECISOR
        {

          codEstado = "";
          fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
          correoDenunciante = data.CORREOGEST;
          cuerpo = $@"
                 <p>Estimado(a) {data.NAMEGEST ?? ""}, el Investigador ha cambiado el estado de la denuncia.</p>
              ";
          url = "https://canaletico.caroasociados.pe/panel/denuncia/" + comando.IDDENUNCIA;
          await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Cambio de Fase", url);

        }

        if (comando.INDIC == 7) // ESTADO DE DECISIÓN
        {

          // informar usuario cambio de estado de denuncia
          if (data.CORREO != null && data != null)
          {
            codEstado = "";
            fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
            correoDenunciante = data.CORREO;
            cuerpo = $@"
                 <p>Estimado(a) {data.NOMBRES}, le comunicamos que su denuncia con identificador DENUNCIA_{comando.IDDENUNCIA} ha avanzado a la fase de decisor.</p>
              ";
            await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Cambio de Fase");
          }

          // informar al gestionador
          if (comando.CORREOREP != null)
          {
            codEstado = "";
            fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
            correoDenunciante = comando.CORREOREP;
            cuerpo = $@"
                 <p>Estimado(a) {comando.NOMBREREP ?? ""}, Usted fue asignado como Decisor de la denuncia</p>
              ";
            url = "https://canaletico.caroasociados.pe/panel/denuncia/" + comando.IDDENUNCIA;
            await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Asignación de denuncia", url);
          }
        }

        if (comando.INDIC == 8 && data.CORREOGEST != null) // ESTADO DE COMPLIANCE
        {

          codEstado = "";
          fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
          correoDenunciante = data.CORREOGEST;
          cuerpo = $@"
                 <p>Estimado(a) {data.NAMEGEST ?? ""}, El Decisor ha cambiado el estado de la denuncia</p>
              ";
          url = "https://canaletico.caroasociados.pe/panel/denuncia/" + comando.IDDENUNCIA;
          await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Asignación de denuncia", url);

        }

        if (comando.INDIC == 10)
        {
          var gui = Guid.NewGuid().ToString();
          comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
          if (comando.FILES != null && comando.FILES.Count > 0)
          {
            foreach (var file in comando.FILES)
            {
              var fileName = Path.GetFileName(file.FileName);
              comando.RUTA = this.PATH + "/" + gui + "/" + fileName;
            }

            var rutas = await _fileUploads.UploadFilesAsync(this.PATH + "/" + gui, comando.FILES, false);
          }

          // informar usuario cambio de estado de denuncia
          if (data.CORREO != null && data != null)
          {
            codEstado = "";
            fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
            correoDenunciante = data.CORREO;
            cuerpo = $@"
                 <p>Estimado(a) {data.NOMBRES}, le comunicamos que ha finalizado el trámite de su denuncia con identificador DENUNCIA_{comando.IDDENUNCIA}. Consulta la denuncia para ver los detalles.</p>
              ";
            await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Trámite de la denuncia terminado");
          }
        }

        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    #endregion


    #region EMAIL_SERVICE
    public async Task EnviarCorreoAsync(string cuerpo, string correoDestinatario, string codEstado, string fechaDenuncia, string tipoCorreo, string Subject, string Url = "https://canaletico.caroasociados.pe/modulos/ver-denuncias")
    {
      var mensaje = new MailMessage();
      mensaje.To.Add(correoDestinatario);
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
                  <img src='https://aicompliance.es/wp-content/uploads/2024/06/B6.png' alt='Logo'>
              </div>
              <div class='content'>
                  {cuerpo}
                  <p><strong>Fecha de Actualización:</strong> {fechaDenuncia}</p>
                  <p>Para ver los detalles completos de esta denuncia, por favor acceda mediante el siguiente botón:</p>
                  <p>
                      <a href='{Url}' class='button'>Ver Detalles</a>
                  </p>
                  <p>Saludos,</p>
                  <p><em>Equipo del Canal de Denuncias</em></p>
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

    #endregion

    #region CHAT_DENUNCIA
    [HttpPost]
    public async Task<IActionResult> OnPostAddChatDenunciaAsync([FromForm] ComandoChatDenunciaInsertar comando)
    {
      try
      {
        var data = await _consultasDenuncias.ObtenerDataEmail(comando.IDDENUNCIA ?? 0);

        if (comando.TPO == true)
        {
          comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
          comando.IDRECEPTOR = int.Parse(HttpContextDraw.User(HttpContext, 2));
          string codEstado = "";
          string fecha = "";
          string correoDenunciante = "";
          string cuerpo = "";

          codEstado = "";
          fecha = DateTime.Now.ToString("dd-MM-yyyy HH:mm tt");
          correoDenunciante = data.CORREO;
          cuerpo = $@"
             <p>Estimado(a) {data.NOMBRES}, le informamos que el equipo gestor del canal ha añadido un nuevo comentario a su denuncia
              con identificador DENUNCIA_{comando.IDDENUNCIA}. Entre en el canal para leerlo.</p>
          ";
          await EnviarCorreoAsync(cuerpo, correoDenunciante, codEstado, fecha, "", "Nuevo comentario en la denuncia");

        }
        var result = await _mediator.Send(comando);
        if (comando.TPO == true)
        {
          result.Retorno = int.Parse(HttpContextDraw.User(HttpContext, 2));
        }

        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteChatDenunciaAsync([FromForm] ComandoChatDenunciaEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region DOCUMENTOS
    [HttpPost]
    public async Task<IActionResult> OnPostAddDocumentoAsync([FromForm] ComandoDocumentoInsertar comando)
    {
      try
      {
        var gui = Guid.NewGuid().ToString();
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        if (comando.FILES != null && comando.FILES.Count > 0)
        {
          foreach (var file in comando.FILES)
          {
            var fileName = Path.GetFileName(file.FileName);

            comando.SIZE = file.Length;
            comando.NARCHIVO = fileName;
            comando.RUTA = this.PATH + "/" + gui + "/" + fileName;
          }

          var rutas = await _fileUploads.UploadFilesAsync(this.PATH + "/" + gui, comando.FILES, false);
        }

        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteDocumentoAsync([FromForm] ComandoDocumentoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      if (comando.RUTA != null)
      {
        List<string> filePaths = null;
        filePaths.Add(comando.RUTA);
        await _fileUploads.DeleteFilesAPIAsync(filePaths);
      }
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    #region TESTIGOS

    [HttpPost]
    public async Task<IActionResult> OnPostAddTestigoAsync([FromForm] ComandoTestigoInsertar comando)
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
    public async Task<IActionResult> OnPostDeleteTestigoAsync([FromForm] ComandoTestigoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion

    #region ACCIONES
    [HttpGet]
    public async Task<IActionResult> OnGetAccionesAsync([FromQuery] AccionesModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasConfiguracion.ListarAcciones(custom);
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }

    }

    [HttpPost]
    public async Task<IActionResult> OnPostAddAccionesAsync([FromForm] ComandoAccionInsertar comando)
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
    public async Task<IActionResult> OnPostUpdateAccionesAsync([FromForm] ComandoAccionEditar comando)
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
    public async Task<IActionResult> OnPostDeleteAccionesAsync([FromForm] ComandoAccionEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
    #endregion


  }
}
