using CARO.CORE.Helpers;
using CARO.CORE;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using CARO.DATOS.CONSULTAS.CCFIRMA;
using CARO.DATOS.MODELO.CCFIRMA;
using CARO.DATOS.EVENTOS.Comandos.CCFIRMA.LIBRORECLAMACIONES;
using CARO.CONFIG;
using System.Net.Mail;
using System.Net;
using System.Globalization;

namespace CARO.AUTENTICACION.WEB.Pages.Ccfirma.libroReclamaciones
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;
    private readonly IConsultasLibroReclamaciones _consultasLibroReclamaciones;
    private string PATH = "CCFIRMA/LIBRORECLAMACIONES";

    public IndexModel(
      IConsultasLibroReclamaciones consultasLibroReclamaciones,
      IMediator mediator
    )
    {
      _consultasLibroReclamaciones = consultasLibroReclamaciones;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] LibroReclamacionModel custom)
    {
      try
      {
        HttpContextDraw.SetModelValues(HttpContext, custom);
        var data = await _consultasLibroReclamaciones.ListarReclamos(custom);
        var totalRows = data?.FirstOrDefault()?.TOTALROWS ?? 0;
        return new JsonResult(new { success = true, recordsTotal = totalRows, recordsFiltered = totalRows, data = data, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al listar los datos.", error = ex.Message });
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetCorrelactivoAsync([FromQuery] LibroReclamacionModel custom)
    {
      try
      {
        var data = await _consultasLibroReclamaciones.ObtenerCorreclativo(custom);
        return new JsonResult(new { success = true, data = data });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al obtener correclativo.", error = ex.Message });
      }
    }


    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoLibroReclamacionesInsertar comando)
    {
      try
      {
        comando.UEDCN = "LIBRO RECLAMACIONES";
        string subject = "Nueva Solicitud - Libro de Reclamaciones";

        string montoFormateado = comando.MONTORECLAMADO.HasValue
            ? comando.MONTORECLAMADO.Value.ToString("C", new CultureInfo("es-PE"))
            : "S/. 0.00"; // o simplemente "" si quieres dejarlo vacío

        string body = $@"
        <div style='font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;'>
          <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>
            <div style='background-color: #ff6c17; color: white; padding: 20px; text-align: center;'>
              <h2 style='margin: 0;'>Libro de Reclamaciones</h2>
            </div>
            <div style='padding: 20px;'>
              <table style='width: 100%; border-collapse: collapse;'>
                <tr><td colspan='2' style='padding: 8px; font-weight: 900;'>Datos de la Sede</td></tr>
                <tr><td colspan='2'><hr/></td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Sede:</td><td style='padding: 8px;'>{comando.SEDE}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Dirección:</td><td style='padding: 8px;'>{comando.DIRECCION}</td></tr>

                <tr><td colspan='2' style='padding: 8px; font-weight: 900;'>Datos del Solicitante</td></tr>
                <tr><td colspan='2'><hr/></td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>¿Es menor de edad?</td><td style='padding: 8px;'>{comando.MENOREDAD}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Tipo de documento:</td><td style='padding: 8px;'>{comando.TDOCRECL}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Número de documento:</td><td style='padding: 8px;'>{comando.NRODOCRECL}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Nombres:</td><td style='padding: 8px;'>{comando.NOMBREAPELLIDO1}</td></tr>";

        if (comando.MENOREDAD?.Trim().ToLower() == "si")
        {
          body += $@"
                <tr><td colspan='2' style='padding: 8px; font-weight: 900;'>Datos del Apoderado</td></tr>
                <tr><td colspan='2'><hr/></td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Tipo de documento:</td><td style='padding: 8px;'>{comando.TDOCRECL2}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Número de documento:</td><td style='padding: 8px;'>{comando.NRODOCRECL2}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Nombres:</td><td style='padding: 8px;'>{comando.NOMBREAPELLIDO12}</td></tr>";
        }

        if (comando.EMPRESA?.Trim().ToLower() == "si")
        {
          body += $@"
                <tr><td colspan='2' style='padding: 8px; font-weight: 900;'>Datos de la Empresa Representada</td></tr>
                <tr><td colspan='2'><hr/></td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Razón social:</td><td style='padding: 8px;'>{comando.EMPRESARSOCIAL}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Tipo de documento:</td><td style='padding: 8px;'>{comando.EMPRESATPODOC}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Número de documento:</td><td style='padding: 8px;'>{comando.EMPRESANUMERO}</td></tr>";
        }

        body += $@"
                <tr><td colspan='2' style='padding: 8px; font-weight: 900;'>Datos de Contacto</td></tr>
                <tr><td colspan='2'><hr/></td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Email:</td><td style='padding: 8px;'>{comando.EMAILRECL}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Teléfono:</td><td style='padding: 8px;'>{comando.TELEFONORECL}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Departamento:</td><td style='padding: 8px;'>{comando.DEPARTAMENTO}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Provincia:</td><td style='padding: 8px;'>{comando.PROVINCIA}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Distrito:</td><td style='padding: 8px;'>{comando.DISTRITO}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Dirección:</td><td style='padding: 8px;'>{comando.DIRECCIONRECL}</td></tr>

                <tr><td colspan='2' style='padding: 8px; font-weight: 900;'>Datos del Reclamo</td></tr>
                <tr><td colspan='2'><hr/></td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Fecha del reclamo:</td><td style='padding: 8px;'>{DateTime.Now.ToString("dd/MM/yy hh:mm tt")}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Tipo de servicio:</td><td style='padding: 8px;'>{comando.TIPOSERVICIO}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Monto reclamado:</td><td style='padding: 8px;'>{montoFormateado}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Detalle:</td><td style='padding: 8px;'>{comando.DETALLE}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Tipo de reclamo:</td><td style='padding: 8px;'>{comando.TIPORECLAMO}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Detalle del reclamo:</td><td style='padding: 8px;'>{comando.DETALLERECLAMO}</td></tr>
                <tr><td style='padding: 8px; font-weight: bold;'>Pedido:</td><td style='padding: 8px;'>{comando.PEDIDO}</td></tr>";

        if (comando.ARCHIVOS != null && comando.ARCHIVOS.Any(f => f.FILE != null))
        {
          body += $@"
                <tr><td colspan='2' style='padding: 8px; font-weight: 900;'>Archivos Adjuntos</td></tr>
                <tr><td colspan='2'><hr/></td></tr>
                <tr>
                    <td colspan='2'>
                        <table style='width: 100%; border: 1px solid #ddd; border-collapse: collapse;'>
                            <thead>
                                <tr style='background-color: #f0f0f0;'>
                                    <th style='border: 1px solid #ddd; padding: 8px;'>Nombre del archivo</th>
                                    <th style='border: 1px solid #ddd; padding: 8px;'>Comentario</th>
                                </tr>
                            </thead>
                            <tbody>";
          foreach (var archivo in comando.ARCHIVOS.Where(a => a.FILE != null))
          {
            var nombre = archivo.FILE.FileName;
            var comentario = archivo.COMENTARIOS ?? "";
            body += $@"
                                          <tr>
                                              <td style='border: 1px solid #ddd; padding: 8px;'>{nombre}</td>
                                              <td style='border: 1px solid #ddd; padding: 8px;'>{comentario}</td>
                                          </tr>";
          }
          body += @"
                            </tbody>
                        </table>
                    </td>
                </tr>";
        }

        body += @"
              </table>
            </div>
            <div style='background-color: #f5f5f5; text-align: center; padding: 10px; font-size: 12px; color: #888;'>
              Este es un mensaje automático del sistema Libro de Reclamaciones.
            </div>
          </div>
        </div>";

        string emails = "kojeda@ccfirma.com,rsaldarriaga@ccfirma.com";
        //string emails = "ccarbajalmt0520@gmail.com";
        ArchivoConComentario fileCopy = new ArchivoConComentario();
        fileCopy.FILE = comando.ARCHIVO;
        if (comando.ARCHIVOS == null)
        {
          comando.ARCHIVOS = new List<ArchivoConComentario>();
        }

        comando.ARCHIVOS.Add(fileCopy);


        await SendEmailInternalAsync(subject, body, comando.DIDEMPRSA + " - Libro de Reclamaciones",
          comando.ARCHIVOS, emails);

        if (comando.ARCHIVOS?.Any() == true)
        {
          var gui = Guid.NewGuid().ToString();

          List<IFormFile> listaArchivos = comando.ARCHIVOS
              .Where(x => x.FILE != null)
              .Select(x => x.FILE)
              .ToList();

          if (listaArchivos.Any())
          {
            comando.RUTAS = await _fileUploads.UploadFilesAsync(this.PATH + "/" + gui, listaArchivos, false);

            foreach (var file in comando.ARCHIVOS)
            {
              if (file.FILE != null)
              {
                var fileName = Path.GetFileName(file.FILE.FileName);
                file.FILENAME = fileName;
              }
            }
          }
        }



        var result = await _mediator.Send(comando);

        if (result.CodEstado > 0 && !string.IsNullOrWhiteSpace(comando.EMAILRECL))
        {
          LibroReclamoModel entidadReclamo = new LibroReclamoModel();
          entidadReclamo.FECHA = DateTime.Now.ToString("dd 'de' MMMM yyyy", new CultureInfo("es-PE"));
          entidadReclamo.NOMBRES = comando.NOMBREAPELLIDO1;
          entidadReclamo.ISQUEJA = comando.TIPORECLAMO;
          entidadReclamo.FECHAHOY = DateTime.Now.ToString("dd/MM/yyyy");
          entidadReclamo.CODIGO = result.CodEstado.ToString("D3") + "-" + DateTime.Now.Year;
          entidadReclamo.CORREOCONTACTO = "kojeda@ccfirma.com";
          entidadReclamo.CORREOCONTACTO2 = "rsaldarriaga@ccfirma.com";
          entidadReclamo.RESPONSABLE = "Karla Ojeda";
          entidadReclamo.AREA = "ÁREA LEGAL";
          entidadReclamo.CONTACTO = "kojeda@ccfirma.com";

          List<ArchivoConComentario> archivos = new List<ArchivoConComentario>();

          archivos.Add(new ArchivoConComentario
          {
            COMENTARIOS = "",
            FILE = comando.ARCHIVO
          });

          string body3 = $@"
            <div style='font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;'>
                <p>Estimado(a) señor(a) <strong>{comando.NOMBREAPELLIDO1}</strong>:</p>

                <p>Esperamos que este mensaje lo(a) encuentre bien a usted y su familia.</p>

                <p>
                    Hemos recibido su <strong>{entidadReclamo.ISQUEJA}</strong> registrado el día 
                    <strong>{entidadReclamo.FECHAHOY}</strong> a través de nuestro Libro de Reclamaciones.
                </p>

                <p>
                    Su caso ha sido ingresado bajo el número 
                    <strong>N° {entidadReclamo.CODIGO}</strong> y será atendido dentro del plazo máximo 
                    de <strong>15 días hábiles</strong>, conforme a la normativa vigente en materia de protección al consumidor.
                </p>

                <p>
                    Una vez que tengamos una respuesta a su Reclamo, nos pondremos en contacto con usted por este mismo medio.
                </p>

                <p>
                    Ante cualquier consulta adicional, no dude en contactarnos a través de los correos 
                    <a href='mailto:kojeda@ccfirma.com' style='color: #0056b3;'>kojeda@ccfirma.com</a> y 
                    <a href='mailto:rsaldarriaga@ccfirma.com' style='color: #0056b3;'>rsaldarriaga@ccfirma.com</a>.
                </p>

                <p>Agradecemos su confianza.</p>

                <br/>

                <p style='font-weight: bold;'>ÁREA DE ATENCIÓN AL CLIENTE</p>
                <p style='font-weight: bold;'>DCC CONSULTORES S.A.C.</p>
            </div>";


          await SendEmailInternalAsync("Acuse de recibo de su reclamación - DCC Consultores SAC",
          body3,
          "DCC CONSULTORES" + " - Libro de Reclamaciones",
          archivos, comando.EMAILRECL);
        }


        return new JsonResult(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    private async Task SendEmailInternalAsync(string subject, string body, string empresa, List<ArchivoConComentario> archivos, string emailSend)
    {
      var smtpClient = new SmtpClient("smtp.gmail.com")
      {
        Port = 587,
        Credentials = new NetworkCredential(ConfiguracionProyecto.CORREOS_CONTACTO.CORREO, ConfiguracionProyecto.CORREOS_CONTACTO.KEY),
        EnableSsl = true,
      };


      var mailMessage = new MailMessage
      {
        From = new MailAddress("formulariocaro@gmail.com", empresa),
        //From = new MailAddress("ccarbajalmt0520@gmail.com", empresa),
        Subject = subject,
        Body = body,
        IsBodyHtml = true
      };

      foreach (var correo in emailSend.Split(',', StringSplitOptions.RemoveEmptyEntries))
      {
        mailMessage.To.Add(correo.Trim());
      }


      if (archivos != null)
      {
        foreach (var archivo in archivos)
        {
          if (archivo.FILE != null && archivo.FILE.Length > 0)
          {
            var attachment = new Attachment(archivo.FILE.OpenReadStream(), archivo.FILE.FileName);
            mailMessage.Attachments.Add(attachment);
          }
        }
      }

      await smtpClient.SendMailAsync(mailMessage);
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoLibroReclamacionesEliminar comando)
    {
      comando.UEDCN = "LIBRO RECLAMACIONES";
      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }
  }
}
