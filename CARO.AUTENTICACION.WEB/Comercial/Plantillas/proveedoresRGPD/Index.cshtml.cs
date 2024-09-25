using CARO.CONFIG;
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

namespace CARO.AUTENTICACION.WEB.Pages.Comercial.Plantillas.proveedoresRGPD
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasPlantilla _consultasPlantilla;
    private readonly FileUploads _fileUploads;

    public IndexModel(
      IConsultasPlantilla consultasPlantilla,
      IMediator mediator
    )
    {
      _consultasPlantilla = consultasPlantilla;
      _mediator = mediator;
      _fileUploads = new FileUploads();
    }

    [HttpPost]
    public async Task<IActionResult> OnPostGenerateDocumentAsync([FromForm] ProveedorPlantillaModel entidad)
    {
      string rutaRemota = "CCFIRMA/PLANTILLAS/PROVEEDORESRGPD.docx"; // Ruta en el servidor FTP
      string tempFileName = $"PROVEEDORESRGPD_Temp_{Guid.NewGuid()}.docx"; // Nombre temporal
      string tempFilePath = Path.Combine(Path.GetTempPath(), tempFileName); // Ruta temporal en el servidor

      try
      {
        // Deserializar los modelos desde los JSON enviados
        entidad.TAPLICABLE = JsonConvert.DeserializeObject<TableAplicable>(entidad.STAPLICABLE);
        entidad.TINTERESADO = JsonConvert.DeserializeObject<TableInteresado>(entidad.STINTERESADO);
        entidad.TTRANSFERENCIA = JsonConvert.DeserializeObject<TableTraferencia>(entidad.STTRANSFERENCIA);
        entidad.TTRATAMIENTO = JsonConvert.DeserializeObject<TableTratamiento>(entidad.STTRATAMIENTO);

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

          // Función para reemplazar texto en un párrafo
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

          foreach (var property in entidad.TAPLICABLE.GetType().GetProperties())
          {
            string placeholder = $"##{property.Name}##";
            string propertyValue = property.GetValue(entidad.TAPLICABLE)?.ToString() ?? string.Empty;
            replacements[placeholder] = propertyValue;
          }

          foreach (var property in entidad.TINTERESADO.GetType().GetProperties())
          {
            string placeholder = $"##{property.Name}##";
            string propertyValue = property.GetValue(entidad.TINTERESADO)?.ToString() ?? string.Empty;
            replacements[placeholder] = propertyValue;
          }

          foreach (var property in entidad.TTRANSFERENCIA.GetType().GetProperties())
          {
            string placeholder = $"##{property.Name}##";
            string propertyValue = property.GetValue(entidad.TTRANSFERENCIA)?.ToString() ?? string.Empty;
            replacements[placeholder] = propertyValue;
          }

          foreach (var property in entidad.TTRATAMIENTO.GetType().GetProperties())
          {
            string placeholder = $"##{property.Name}##";
            string propertyValue = property.GetValue(entidad.TTRATAMIENTO)?.ToString() ?? string.Empty;
            replacements[placeholder] = propertyValue;
          }

          foreach (var para in body.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>())
          {
            ReplaceTextInParagraph(para, replacements);
          }

          foreach (var table in body.Elements<DocumentFormat.OpenXml.Wordprocessing.Table>())
          {
            foreach (var row in table.Elements<DocumentFormat.OpenXml.Wordprocessing.TableRow>())
            {
              foreach (var cell in row.Elements<DocumentFormat.OpenXml.Wordprocessing.TableCell>())
              {
                foreach (var para in cell.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>())
                {
                  ReplaceTextInParagraph(para, replacements);
                }
              }
            }
          }
        }

        // Leer el archivo modificado y convertirlo a Base64
        byte[] modifiedFileBytes = System.IO.File.ReadAllBytes(tempFilePath);
        string fileBase64 = Convert.ToBase64String(modifiedFileBytes);

        // Opcional: Eliminar el archivo temporal
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


    //[HttpPost]
    //public async Task<IActionResult> OnPostGenerateDocumentAsync([FromForm] ProveedorPlantillaModel entidad)
    //{
    //  string filePath = $@"{ConfiguracionProyecto.DISK}CCFIRMA\PLANTILLAS\PROVEEDORESRGPD.docx";
    //  string tempFilePath = $@"{ConfiguracionProyecto.DISK}CCFIRMA\PLANTILLAS\PROVEEDORESRGPD_Temp.docx";

    //  try
    //  {
    //    // Deserializar los modelos desde los JSON enviados
    //    entidad.TAPLICABLE = JsonConvert.DeserializeObject<TableAplicable>(entidad.STAPLICABLE);
    //    entidad.TINTERESADO = JsonConvert.DeserializeObject<TableInteresado>(entidad.STINTERESADO);
    //    entidad.TTRANSFERENCIA = JsonConvert.DeserializeObject<TableTraferencia>(entidad.STTRANSFERENCIA);
    //    entidad.TTRATAMIENTO = JsonConvert.DeserializeObject<TableTratamiento>(entidad.STTRATAMIENTO);

    //    if (!System.IO.File.Exists(filePath))
    //    {
    //      return NotFound("El archivo no se encuentra.");
    //    }

    //    // Crear una copia del archivo original
    //    System.IO.File.Copy(filePath, tempFilePath, true);

    //    using (WordprocessingDocument doc = WordprocessingDocument.Open(tempFilePath, true))
    //    {
    //      SimplifyMarkupSettings settings = new SimplifyMarkupSettings
    //      {
    //        RemoveComments = true,
    //        RemoveProof = true,
    //        RemoveRsidInfo = true
    //      };

    //      MarkupSimplifier.SimplifyMarkup(doc, settings);

    //      var body = doc.MainDocumentPart.Document.Body;

    //      // Función para reemplazar texto en un párrafo
    //      void ReplaceTextInParagraph(DocumentFormat.OpenXml.Wordprocessing.Paragraph para, Dictionary<string, string> replacements)
    //      {
    //        string combinedText = string.Join("", para.Elements<Run>()
    //            .SelectMany(run => run.Elements<Text>())
    //            .Select(textElement => textElement.Text));

    //        foreach (var placeholder in replacements.Keys.ToList())
    //        {
    //          string propertyValue = replacements[placeholder];

    //          if (combinedText.Contains(placeholder))
    //          {
    //            combinedText = combinedText.Replace(placeholder, propertyValue);
    //            para.RemoveAllChildren<Run>();
    //            foreach (var part in combinedText.Split(new[] { '\n', '\r' }, StringSplitOptions.None))
    //            {
    //              var run = new Run(new Text(part));
    //              para.Append(run);
    //            }
    //          }
    //        }
    //      }

    //      var replacements = new Dictionary<string, string>();

    //      foreach (var property in entidad.GetType().GetProperties())
    //      {
    //        string placeholder = $"##{property.Name}##";
    //        string propertyValue = property.GetValue(entidad)?.ToString() ?? string.Empty;
    //        replacements[placeholder] = propertyValue;
    //      }

    //      foreach (var property in entidad.TAPLICABLE.GetType().GetProperties())
    //      {
    //        string placeholder = $"##{property.Name}##";
    //        string propertyValue = property.GetValue(entidad.TAPLICABLE)?.ToString() ?? string.Empty;
    //        replacements[placeholder] = propertyValue;
    //      }

    //      foreach (var property in entidad.TINTERESADO.GetType().GetProperties())
    //      {
    //        string placeholder = $"##{property.Name}##";
    //        string propertyValue = property.GetValue(entidad.TINTERESADO)?.ToString() ?? string.Empty;
    //        replacements[placeholder] = propertyValue;
    //      }

    //      foreach (var property in entidad.TTRANSFERENCIA.GetType().GetProperties())
    //      {
    //        string placeholder = $"##{property.Name}##";
    //        string propertyValue = property.GetValue(entidad.TTRANSFERENCIA)?.ToString() ?? string.Empty;
    //        replacements[placeholder] = propertyValue;
    //      }

    //      foreach (var property in entidad.TTRATAMIENTO.GetType().GetProperties())
    //      {
    //        string placeholder = $"##{property.Name}##";
    //        string propertyValue = property.GetValue(entidad.TTRATAMIENTO)?.ToString() ?? string.Empty;
    //        replacements[placeholder] = propertyValue;
    //      }

    //      foreach (var para in body.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>())
    //      {
    //        ReplaceTextInParagraph(para, replacements);
    //      }

    //      foreach (var table in body.Elements<DocumentFormat.OpenXml.Wordprocessing.Table>())
    //      {
    //        foreach (var row in table.Elements<DocumentFormat.OpenXml.Wordprocessing.TableRow>())
    //        {
    //          foreach (var cell in row.Elements<DocumentFormat.OpenXml.Wordprocessing.TableCell>())
    //          {
    //            foreach (var para in cell.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>())
    //            {
    //              ReplaceTextInParagraph(para, replacements);
    //            }
    //          }
    //        }
    //      }
    //    }


    //    // Leer el archivo modificado y convertirlo a Base64
    //    byte[] fileBytes = System.IO.File.ReadAllBytes(tempFilePath);
    //    string fileBase64 = Convert.ToBase64String(fileBytes);

    //    // Opcional: Eliminar el archivo temporal
    //    System.IO.File.Delete(tempFilePath);
    //    return new JsonResult(new
    //    {
    //      base64Word = fileBase64
    //    });
    //  }
    //  catch (Exception ex)
    //  {
    //    return StatusCode(500, $"Error al generar el documento: {ex.Message}");
    //  }
    //}

    private void ReplaceTextInTable(WordprocessingDocument doc, string placeholder, string replacement)
    {
      var body = doc.MainDocumentPart.Document.Body;

      // Buscar la tabla que contiene el marcador
      var tables = body.Elements<DocumentFormat.OpenXml.Wordprocessing.Table>();
      foreach (var table in tables)
      {
        foreach (var row in table.Elements<DocumentFormat.OpenXml.Wordprocessing.TableRow>())
        {
          foreach (var cell in row.Elements<DocumentFormat.OpenXml.Wordprocessing.TableCell>())
          {
            var paragraphs = cell.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>();
            foreach (var paragraph in paragraphs)
            {
              var runs = paragraph.Elements<DocumentFormat.OpenXml.Wordprocessing.Run>();
              foreach (var run in runs)
              {
                var text = run.GetFirstChild<DocumentFormat.OpenXml.Wordprocessing.Text>();
                if (text != null && text.Text.Contains("|" + placeholder + "|"))
                {
                  text.Text = text.Text.Replace("|" + placeholder + "|", replacement);
                }
              }
            }
          }
        }
      }
    }


  }





  //[HttpPost]
  //public async Task<IActionResult> OnPostGenerateDocumentAsync()
  //{
  //  string filePath = $@"{ConfiguracionProyecto.DISK}CCFIRMA\PLANTILLAS\PROVEEDORESRGPD.docx";

  //  if (!System.IO.File.Exists(filePath))
  //  {
  //    return NotFound("El archivo no se encuentra.");
  //  }

  //  byte[] wordBytes;
  //  List<byte[]> pdfParts = new List<byte[]>();

  //  using (var wordMemoryStream = new MemoryStream())
  //  {
  //    // Cargar el documento Word en un MemoryStream
  //    using (var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
  //    {
  //      await fileStream.CopyToAsync(wordMemoryStream);
  //    }

  //    // Modificar el documento con DocumentFormat.OpenXml
  //    using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(wordMemoryStream, true))
  //    {
  //      var body = wordDoc.MainDocumentPart.Document.Body;

  //      // Reemplazo de texto en el documento
  //      foreach (var text in body.Descendants<DocumentFormat.OpenXml.Wordprocessing.Text>())
  //      {
  //        if (text.Text.Contains("V_UBICATION"))
  //        {
  //          text.Text = text.Text.Replace("V_UBICATION", "Agregado Barcelona");
  //        }
  //      }

  //      // Guardar los cambios en el MemoryStream
  //      wordDoc.MainDocumentPart.Document.Save();
  //    }

  //    // Obtener el arreglo de bytes del documento modificado
  //    wordBytes = wordMemoryStream.ToArray();
  //  }

  //  // Dividir el documento en partes más pequeñas y convertir cada parte en PDF
  //  using (var splitStream = new MemoryStream(wordBytes))
  //  {
  //    Spire.Doc.Document document = new Spire.Doc.Document();
  //    document.LoadFromStream(splitStream, Spire.Doc.FileFormat.Docx);

  //    int totalPageCount = document.PageCount;
  //    int pagesPerPart = 1; // Ajusta según tus necesidades
  //    var tasks = new List<Task>();

  //    for (int i = 0; i < totalPageCount; i += pagesPerPart)
  //    {
  //      var partDocument = new Spire.Doc.Document();
  //      partDocument.LoadFromStream(new MemoryStream(wordBytes), Spire.Doc.FileFormat.Docx);
  //      partDocument.Sections.Clear();

  //      bool hasContent = false;
  //      for (int j = i; j < Math.Min(i + pagesPerPart, totalPageCount); j++)
  //      {
  //        if (j < document.Sections.Count)
  //        {
  //          var section = document.Sections[j];
  //          if (section.Body.ChildObjects.Count > 0)
  //          {
  //            hasContent = true;
  //            partDocument.Sections.Add(section.Clone());
  //          }
  //        }
  //      }

  //      if (hasContent)
  //      {
  //        tasks.Add(Task.Run(() =>
  //        {
  //          using (var partPdfStream = new MemoryStream())
  //          {
  //            partDocument.SaveToStream(partPdfStream, Spire.Doc.FileFormat.PDF);
  //            pdfParts.Add(partPdfStream.ToArray());
  //          }
  //        }));
  //      }
  //    }

  //    await Task.WhenAll(tasks);
  //  }

  //  // Libera memoria
  //  GC.Collect();
  //  GC.WaitForPendingFinalizers();

  //  if (pdfParts.Count == 0)
  //  {
  //    return NotFound("No se encontraron partes PDF para combinar.");
  //  }

  //  using (var finalPdfStream = new MemoryStream())
  //  {
  //    PdfDocument finalDocument = new PdfDocument();

  //    foreach (var pdfPart in pdfParts)
  //    {
  //      PdfDocument partDocument = PdfReader.Open(new MemoryStream(pdfPart), PdfDocumentOpenMode.Import);

  //      foreach (var page in partDocument.Pages.Cast<PdfPage>())
  //      {
  //        // Agregar una nueva página al documento final
  //        var newPage = finalDocument.AddPage(page);

  //        // Agregar logo y footer a cada página
  //        using (var gfx = XGraphics.FromPdfPage(newPage))
  //        {
  //          // Agregar logo en la cabecera
  //          string logoPath = $@"{ConfiguracionProyecto.DISK}CCFIRMA\PLANTILLAS\logoProveedores.jpg";
  //          using (var logoStream = new FileStream(logoPath, FileMode.Open, FileAccess.Read))
  //          {
  //            XImage logo = XImage.FromStream(logoStream);
  //            gfx.DrawImage(logo, 36, 17, 170, 22); // Posiciona y dimensiona el logo
  //          }

  //          // Agregar footer
  //          string footerPath = $@"{ConfiguracionProyecto.DISK}CCFIRMA\PLANTILLAS\firmasProveedores.jpg";
  //          using (var footerStream = new FileStream(footerPath, FileMode.Open, FileAccess.Read))
  //          {
  //            XImage footer = XImage.FromStream(footerStream);
  //            gfx.DrawImage(footer, 38, newPage.Height - 55, 250, 35); // Posiciona y dimensiona el footer
  //          }

  //          // Agregar numeración de página
  //          string pageNumberText = $"{finalDocument.PageCount}";
  //          XFont font = new XFont("Arial", 12);
  //          double pageNumberMarginRight = 40; // Espaciado desde el borde derecho
  //          double pageNumberMarginBottom = 20; // Espaciado desde el borde inferior
  //          gfx.DrawString(pageNumberText, font, XBrushes.Black, new XRect(0, 0, newPage.Width - pageNumberMarginRight, newPage.Height - pageNumberMarginBottom), XStringFormats.BottomRight);
  //        }
  //      }
  //    }

  //    finalDocument.Save(finalPdfStream);

  //    // Convertir el PDF final a Base64
  //    string base64Pdf = Convert.ToBase64String(finalPdfStream.ToArray());

  //    // Devolver el PDF final en Base64
  //    return new JsonResult(new { base64Pdf });
  //  }
  //}


}

