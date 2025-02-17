using Microsoft.AspNetCore.Mvc.RazorPages;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.MODELO.COM.PLANTILLA;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Newtonsoft.Json;
using OpenXmlPowerTools;
using CARO.CORE;

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Plantillas.locacionServicios
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
    public async Task<IActionResult> OnPostGenerateDocumentAsync([FromForm] PlantillaLocacionServiciosModel entidad)
    {
      try
      {
        string rutaRemota = "CCFIRMA/PLANTILLAS/CONTRATO LOCACIÓN DE SERVICIOS.docx"; // Ruta en el servidor FTP
        string tempFileName = $"CONTRATO_Temp_{Guid.NewGuid()}.docx"; // Nombre temporal
        string tempFilePath = Path.Combine(Path.GetTempPath(), tempFileName); // Ruta temporal en el servidor

        byte[] fileBytes = await _fileUploads.DownloadFileAsync(rutaRemota);
        if (fileBytes == null || fileBytes.Length == 0)
        {
          return NotFound("El archivo no se encuentra en el servidor FTP.");
        }

        await System.IO.File.WriteAllBytesAsync(tempFilePath, fileBytes);
        using (WordprocessingDocument doc = WordprocessingDocument.Open(tempFilePath, true))
        {
          SimplifyMarkupSettings settings = new SimplifyMarkupSettings
          {
            RemoveComments = true,
            RemoveProof = true,
            RemoveRsidInfo = true
          };

          MarkupSimplifier.SimplifyMarkup(doc, settings);
          var body = doc.MainDocumentPart.Document.Body;
          void ReplaceTextInParagraph(DocumentFormat.OpenXml.Wordprocessing.Paragraph para, Dictionary<string, string> replacements)
          {
            string combinedText = string.Join("", para.Elements<Run>()
                .SelectMany(run => run.Elements<Text>())
                .Select(textElement => textElement.Text));

            foreach (var placeholder in replacements.Keys.ToList())
            {
              string propertyValue = replacements[placeholder];

              if (combinedText.Contains(placeholder))
              {
                combinedText = combinedText.Replace(placeholder, propertyValue);
                para.RemoveAllChildren<Run>();
                foreach (var part in combinedText.Split(new[] { '\n', '\r' }, StringSplitOptions.None))
                {
                  var run = new Run(new Text(part));
                  para.Append(run);
                }
              }
            }
          }

          var replacements = new Dictionary<string, string>();
          foreach (var property in entidad.GetType().GetProperties())
          {
            string placeholder = $"##{property.Name}##";
            string propertyValue = property.GetValue(entidad)?.ToString() ?? string.Empty;
            replacements[placeholder] = propertyValue;
          }

          foreach (var para in body.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>())
          {
            ReplaceTextInParagraph(para, replacements);
          }
        }

        byte[] modifiedFileBytes = System.IO.File.ReadAllBytes(tempFilePath);
        string fileBase64 = Convert.ToBase64String(modifiedFileBytes);
        System.IO.File.Delete(tempFilePath);

        return new JsonResult(new
        {
          base64Word = fileBase64
        });
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Error al generar el documento: {ex.Message}");
      }
    }


  }
}
