using CARO.CONFIG;
using CARO.CORE;
using CARO.CORE.Helpers;
using CARO.DATOS.CONSULTAS.LEGAL;
using CARO.DATOS.CONSULTAS.MANTENIMIENTOS;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.DOCUMENTOS;
using CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.EMPRESAS;
using CARO.DATOS.MODELO.LEGAL.DOCUMENTOS;
using CARO.DATOS.MODELO.MANTENIMIENTOS.EMPRESAS;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.IdentityModel.Tokens;
using ScottPlot.Drawing.Colorsets;
using System.Security.Cryptography;
using System.Text;

namespace CARO.AUTENTICACION.WEB.Pages.Legal.Documentos
{
  [IgnoreAntiforgeryToken(Order = 1001)]
  public class IndexModel : PageModel
  {
    private readonly IMediator _mediator;
    private readonly IConsultasDocumentos _consultasDocumentos;
    private readonly FileUploads _fileUploads;
    private readonly FileEncryptor _fileEncryptor;

    public IndexModel(
      IConsultasDocumentos consultasDocumentos,
      IMediator mediator
    )
    {
      _consultasDocumentos = consultasDocumentos;
      _mediator = mediator;
      _fileUploads = new FileUploads();
      _fileEncryptor = new FileEncryptor();
    }


    #region DOCUMENTOS
    [HttpGet]
    public async Task<IActionResult> OnGetBuscarAsync([FromQuery] DocumentosModel custom)
    {
      try
      {
        custom.IDUSR = int.Parse(HttpContextDraw.User(HttpContext, 2));
        var repositorio = await _consultasDocumentos.Listar(custom);
        return new JsonResult(new { recordsTotal = 1, recordsFiltered = 1, data = repositorio, draw = custom.DRAW });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, message = "Ocurrió un error al obtener el repositorio.", error = ex.Message });
      }
    }

    [HttpGet]
    public async Task<IActionResult> OnGetObtenerAsync([FromQuery] DocumentosModel custom)
    {
      try
      {
        var repositorio = await _consultasDocumentos.Obtener(custom);

        if (repositorio != null && !string.IsNullOrEmpty(repositorio.RUTA))
        {
          var fileBytes = await _fileUploads.DownloadFileAsync(repositorio.RUTA);
          var decryptedData = FileEncryptor.DecryptData(fileBytes, repositorio.PASSWORD);

          var base64 = Convert.ToBase64String(decryptedData);
          var base64Data = $"data:{repositorio.EXTENSION};base64,{base64}";

          return new JsonResult(new { success = true, base64Data, extension = repositorio.EXTENSION, nombre = repositorio.NOMBRE });
        }

        return new JsonResult(new { success = false, message = "Ruta no válida o repositorio vacío." });
      }
      catch (Exception ex)
      {
        return new JsonResult(new { success = false, message = ex.Message });
      }
    }


    [HttpPost]
    public async Task<IActionResult> OnPostAddAsync([FromForm] ComandoDocumentoInsertar comando)
    {
      try
      {
        comando.IDUSR = int.Parse(HttpContextDraw.User(HttpContext, 2));


        if (comando.GDTPOFILE == "2" && comando.FILE == null)
        {
          return BadRequest("Error en la solicitud: El campo FILE no puede esta vacio, validar!.");
        }

        if (comando.FILE != null && comando.FILE.Length > 0 && comando.GDTPOFILE == "2")
        {
          comando.PASSWORD =  _fileEncryptor.GenerateRandomString(16);
          comando.RUTA = await _fileUploads.UploadEncryptedFileAsync("CCFIRMA/REPOSITORIO/" + comando.IDUSR + "/", comando.FILE, comando.PASSWORD);
        }
        
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);
        return new JsonResult(result);
      }
      catch (IOException ioEx)
      {
        return StatusCode(500, "Error al guardar el archivo: " + ioEx.Message);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostUpdateAsync([FromForm] ComandoDocumentoEditar comando)
    {
      try
      {
        comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
        var result = await _mediator.Send(comando);

        return new JsonResult(result);
      }
      catch (IOException ioEx)
      {
        return StatusCode(500, "Error al manejar los archivos: " + ioEx.Message);
      }
      catch (Exception ex)
      {
        return StatusCode(500, "Error interno del servidor: " + ex.Message);
      }
    }

    [HttpPost]
    public async Task<IActionResult> OnPostDeleteAsync([FromForm] ComandoDocumentoEliminar comando)
    {
      comando.UEDCN = HttpContextDraw.User(HttpContext, 1);
      DocumentosModel custom = new DocumentosModel();
      custom.ID = comando.ID;
      var repositorio = await _consultasDocumentos.Obtener(custom);

      if(repositorio != null && !repositorio.RUTA.IsNullOrEmpty())
      {
        await _fileUploads.DeleteDirectoryAsync(repositorio.RUTA);
      }

      var result = await _mediator.Send(comando);
      return new JsonResult(result);
    }

    #endregion

    }
}
