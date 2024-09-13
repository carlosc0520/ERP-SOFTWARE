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
        public string? GDRBROC { get; set; } = null;
        public string? GDCRGOC { get; set; } = null;
        public string? DGDRBROC { get; set; } = null;
        public string? DGDCRGOC { get; set; } = null;
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
}
