using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.MANTENIMIENTOS.GRUPODATO
{
    public class GrupoDatoGDModel : EntidadAuditoria
    {
        public string? DGDTLLE { get; set; } = null;
        public string? GDTPO{ get; set; } = null;
        public string? DTLLE{ get; set; } = null;
        public string? VLR1 { get; set; } = null;
        public string? VLR2 { get; set; } = null;
    }

    public class GrupoDatoDetalleGDModel : EntidadAuditoria
    {
        public string? GDPDRE { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public string? VLR1 { get; set; } = null;
        public string? VLR2 { get; set; } = null;
        public string? VLR3 { get; set; } = null;
        public string? VLR4 { get; set; } = null;
    }
}