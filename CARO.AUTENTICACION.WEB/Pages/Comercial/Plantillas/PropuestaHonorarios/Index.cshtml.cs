using CARO.CORE;
using CARO.DATOS.MODELO.COM.PLANTILLA;
using DocumentFormat.OpenXml.Packaging;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OpenXmlPowerTools;
using DocumentFormat.OpenXml.Wordprocessing;
using Adobe.PDFServicesSDK;
using Adobe.PDFServicesSDK.auth;
using Adobe.PDFServicesSDK.exception;
using Adobe.PDFServicesSDK.io;
using Adobe.PDFServicesSDK.pdfjobs.jobs;
using Adobe.PDFServicesSDK.pdfjobs.parameters.exportpdf;
using Adobe.PDFServicesSDK.pdfjobs.results;
using Org.BouncyCastle.Utilities.Zlib;
using Adobe.PDFServicesSDK.pdfjobs.parameters.createpdf;


namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Plantillas.PropuestaHonorarios
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly FileUploads _fileUploads;

    public IndexModel(
      IMediator mediator
    )
    {
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    [HttpPost]
    public async Task<IActionResult> OnPostGenerateDocumentAsync([FromForm] PlantillaPrestacionServicio entidad)
    {
      try
      { 
        string rutaRemota = "CCFIRMA/PLANTILLAS/Propuesta_de_honorarios_2026.docx";
        //string rutaRemota = "CCFIRMA/PLANTILLAS/LIBRO_DE_RECLAMACIONES.docx";
        string tempFilePath = Path.Combine(Path.GetTempPath(), $"Propuesta_{Guid.NewGuid()}.docx");

        // Descargar archivo
        var fileBytes = await _fileUploads.DownloadFileAsync(rutaRemota);
        if (fileBytes == null || fileBytes.Length == 0)
          return NotFound("El archivo no se encuentra en el servidor FTP.");

        // Completar datos de fecha
        var fecha = DateTime.Now;
        entidad.DIA = fecha.Day.ToString("00");
        entidad.MES = char.ToUpper(fecha.ToString("MMMM", new System.Globalization.CultureInfo("es-ES"))[0]) +
                      fecha.ToString("MMMM", new System.Globalization.CultureInfo("es-ES")).Substring(1);
        entidad.YEAR = fecha.Year.ToString();

        await System.IO.File.WriteAllBytesAsync(tempFilePath, fileBytes);
        using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(tempFilePath, true))
        {

          // Leer el contenido XML completo del documento
          string docText;
          using (StreamReader sr = new StreamReader(wordDoc.MainDocumentPart.GetStream()))
          {
            docText = sr.ReadToEnd();
          }

          // Reemplazar todas las propiedades de la clase
          foreach (var property in entidad.GetType().GetProperties())
          {
            string placeholder = $"##{property.Name}##";
            string value = property.GetValue(entidad)?.ToString() ?? string.Empty;

            docText = docText.Replace(placeholder, value);
          }

          // Escribir el contenido actualizado al documento
          using (StreamWriter sw = new StreamWriter(wordDoc.MainDocumentPart.GetStream(FileMode.Create)))
          {
            sw.Write(docText);
          }
        }

        // Word → Base64
        string fileBase64Word = Convert.ToBase64String(System.IO.File.ReadAllBytes(tempFilePath));

        // Convertir a PDF con Adobe
        string pdfBase64;
        try
        {
          var credentials = new ServicePrincipalCredentials("46cd4f7ab4ef4916b5d8d3ac1e9fb34c", "p8e-lrPUmk2_aqKM9w6PGDspV4IB8Mx8gnCo");
          var pdfServices = new PDFServices(credentials);

          using var inputStream = System.IO.File.OpenRead(tempFilePath);
          var inputAsset = pdfServices.Upload(inputStream, PDFServicesMediaType.DOCX.GetMIMETypeValue());

          var job = new CreatePDFJob(inputAsset);
          var response = pdfServices.GetJobResult<CreatePDFResult>(pdfServices.Submit(job), typeof(CreatePDFResult));

          using var ms = new MemoryStream();
          pdfServices.GetContent(response.Result.Asset).Stream.CopyTo(ms);
          pdfBase64 = Convert.ToBase64String(ms.ToArray());
        }
        catch (Exception ex)
        {
          return StatusCode(500, $"Error al convertir a PDF: {ex.Message}");
        }

        System.IO.File.Delete(tempFilePath);

        return new JsonResult(new { success = true, base64Pdf = pdfBase64 });
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Error al generar el documento: {ex.Message}");
      }
    }


  }
}
