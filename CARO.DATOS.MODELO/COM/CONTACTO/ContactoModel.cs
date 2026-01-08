using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.COM.CONTACTO
{
    public class ContactoModel : EntidadAuditoria
    {
        public string? NMBRS { get; set; } = null;
        public string? APLLDS { get; set; } = null;
        public string? EML { get; set; } = null;
        public string? DRCCN { get; set; } = null;
        public string? TLFNO { get; set; } = null;
        public string? CLENTE { get; set; } = null;
        public string? IDMRCA_F { get; set; } = null;
        public string? GDRBROC { get; set; } = null;
        public string? GDCRGOC { get; set; } = null;
        public string? DGDRBROC { get; set; } = null;
        public string? DGDCRGOC { get; set; } = null;
        public string? CLIENTE { get; set; } = null;
        public string? GDSEXO { get; set; } = null;

    }

    public class AdjuntoModel : EntidadAuditoria
    {
        public string? REDIRECT { get; set; } = null;
        public string? URL { get; set; } = null;
    }

    public class EmailModel : EntidadAuditoria
    {
        public string? IMGURL { get; set; } = null;
        public int? IDNTCA { get; set; } = null;
        public string? REDURL { get; set; } = null;

    }

    public class DetEmailModel : EntidadAuditoria
    {
        public string? ASNTO { get; set; } = null;
        public string? CNTCTS { get; set; } = null;
        public string? MSJE  { get; set; } = null;
        public string? ITEMS { get; set; } = null;

    }

    public class MailingModel : EntidadAuditoria
    {
        public int? MAILING_ID { get; set; } = null;
        public string? ASUNTO { get; set; } = null;
        public string? CUERPO_HTML { get; set; } = null;
        public string? IMAGENES_JSON { get; set; } = null;
        public DateTime? FECHA_REGISTRO { get; set; } = null;
        public string? METRICAS_DETALLE { get; set; } = null;
        public string? METRICAS_GENERAL { get; set; } = null;
        public string? CONTACTOS { get; set; } = null;
        public string? ESTADO { get; set; } = null;
        public string? MENSAJE { get; set; } = null;
        public DateTime? FPROGRAMADA { get; set; } = null;
        public string? CONTACTOS_DATA { get; set; } = null;
        public string? CORREOSEND { get; set; } = null;
        public string? PLACEHOLDER { get; set; } = null;
        public string? SECRETKEY { get; set; } = null;

    }
}
