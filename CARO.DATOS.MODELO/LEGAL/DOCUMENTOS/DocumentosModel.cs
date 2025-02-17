using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.LEGAL.DOCUMENTOS
{
    public class DocumentosModel : EntidadAuditoria
    {
        public int? IDUSR { get; set; } = null;
        public string? NOMBRE { get; set; } = null;
        public string? GDTPOFILE { get; set; } = null;
        public string? DGDTPOFILE { get; set; } = null;
        public string? EXTENSION { get; set; } = null;
        public int? IDPADRE { get; set; } = null;
        public string? RUTA { get; set; } = null;
        public string? PASSWORD { get; set; } = null;

    }
}
