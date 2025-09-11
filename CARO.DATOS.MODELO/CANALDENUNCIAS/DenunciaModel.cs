using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.CANALDENUNCIAS
{
    public class DenunciaModel : EntidadAuditoria
    {
        public int? IDACT { get; set; } = null;
        public int? IDEMPRESA { get; set; } = null;
        public string? DIDEMPRESA { get; set; } = null;
        public int? IDTPODENUNCIA { get; set; } = null;
        public string? DIDTPODENUNCIA { get; set; } = null;
        public int? IDRECEPTOR { get; set; } = null;
        public string? DIDRECEPTOR { get; set; } = null;
        public int? IDREMPRESA { get; set; } = null;
        public string? DIDREMPRESA { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? APELLIDOS { get; set; } = null;
        public string? CORREOGEST { get; set; } = null;
        public string? NAMEGEST { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? TELEFONO { get; set; } = null;
        public DateTime? FECHAINC { get; set; } = null;
        public string? DETALLE { get; set; } = null;
        public string? COMENTARIOADI { get; set; } = null;
        public string? CONTRASENA { get; set; } = null;
        public string? CORREOREC { get; set; } = null;
        public string? USUARIO { get; set; } = null;
        public string? GDDENUNCIA { get; set; } = null;
        public string? DGDDENUNCIA { get; set; } = null;
        public string? MRCA { get; set; } = null;
        public string? NCMPTO { get; set; } = null;
        public string? JSON_TESTIGOS { get; set; } = null;
        public string? JSON_DOCUMENTOS { get; set; } = null;
        public string? JSON_CHAT { get; set; } = null;
        public string? JSON_ACCIONES { get; set; } = null;
        public string? JSON_USUARIOS { get; set; } = null;
        public string? IFORMEDEC { get; set; } = null;
        public string? IFORMEINV { get; set; } = null;
        public string? IFORMECOM { get; set; } = null; 
        public string? IFORMEDEN { get; set; } = null;
        public string? PERMISOS { get; set; } = null;

        public List<TestigoModel>? TESTIGOS { get; set; } = new List<TestigoModel>();
        public List<DocumentoModel>? DOCUMENTOS { get; set; } = new List<DocumentoModel>();
        public List<ChatDenunciaModel>? CHAT { get; set; } = new List<ChatDenunciaModel>();

    }
    public class ValidateDenunciaModel : EntidadAuditoria
    {
        public string? CONTRASENA { get; set; } = null;
        public int? ID { get; set; } = null;
        public string? CODIGO { get; set; } = null;
    }
    public class TestigoModel : EntidadAuditoria
    {
        public string? NOMBRE { get; set; } = null;
        public string? APELLIDO { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? TELEFONO { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;
    }
    public class DocumentoModel : EntidadAuditoria
    {
        public string? NARCHIVO { get; set; } = null;
        public decimal? SIZE { get; set; } = null;
        public string? RUTA { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;
    }
    public class ChatDenunciaModel : EntidadAuditoria
    {
        public int? IDDENUNCIA { get; set; } = null;
        public int? IDRECEPTOR { get; set; } = null;
        public string? MENSAJE { get; set; } = null;
        public bool? TPO { get; set; } = null;
        public string? USUARIO { get; set; } = null;
        public string? CARGO { get; set; } = null;

    }
    public class ParametroDenunciaModel : EntidadAuditoria
    {
        public int? IDEMPRESA { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public string? ABREV { get; set; } = null;
        public string? VLR1 { get; set; } = null;
        public string? VLR2 { get; set; } = null;
        public string? VLR3 { get; set; } = null;
    }

    public class SolicitudDenunciaModel : EntidadAuditoria
    {
        public int? IDEMPRESA { get; set; } = null;
        public string? NOMBRE { get; set; } = null;
        public string? APELLIDO { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? ASUNTO { get; set; } = null;
        public string? MENSAJE { get; set; } = null;
    }
    public class MovimientoDenunciaModel : EntidadAuditoria
    {
        public int? IDUSER { get; set; } = null;
        public int? IDDENUNCIA { get; set; } = null;
        public int? IDREP { get; set; } = null;
        public string? COMENTARIO { get; set; } = null;
        public bool? ACTUAL { get; set; } = null;
        public string? GDDENUNCIA { get; set; } = null;
        public string? DIDUSER { get; set; } = null;
        public string? DIDDENUNCIA { get; set; } = null;
        public string? DIDREP { get; set; } = null;
        public string? DGDDENUNCIA { get; set; } = null;

    }


}
