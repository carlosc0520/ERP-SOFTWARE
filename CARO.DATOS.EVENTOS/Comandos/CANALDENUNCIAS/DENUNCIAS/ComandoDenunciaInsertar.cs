using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS
{
    public class ComandoDenunciaInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDEMPRESA { get; set; } = null;
        public int? IDTPODENUNCIA { get; set; } = null;
        public int? IDRECEPTOR { get; set; } = null;
        public int? IDREMPRESA { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? APELLIDOS { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? TELEFONO { get; set; } = null;
        public DateTime? FECHAINC { get; set; } = null;
        public string? DETALLE { get; set; } = null;
        public string? COMENTARIOADI { get; set; } = null;
        public string? CONTRASENA { get; set; } = null;
        public string? CORREOREC { get; set; } = null;
        public string? GDDENUNCIA { get; set; } = null;
        public string? JSON_TESTIGOS { get; set; } = null;
        public string? JSON_DOCUMENTOS { get; set; } = null;
        public List<ComandoTestigoModel>? TESTIGOS { get; set; } = new List<ComandoTestigoModel>();
        public List<ComandoDocumentoModel>? DOCUMENTOS { get; set; } = new List<ComandoDocumentoModel>();
        public List<IFormFile>? FILES { get; set; } = new List<IFormFile>();

    }

    public class ComandoTestigoModel : EntidadAuditoria
    {
        public string? NOMBRE { get; set; } = null;
        public string? APELLIDO { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? TELEFONO { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;
    }

    public class ComandoDocumentoModel : EntidadAuditoria
    {
        public string? IDENTITY { get; set; } = null;
        public string? NARCHIVO { get; set; } = null;
        public decimal? SIZE { get; set; } = null;
        public string? RUTA { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;
    }
}
