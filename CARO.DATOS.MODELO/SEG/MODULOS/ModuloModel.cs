using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.SEG.MODULOS
{
    public class ModuloModel : EntidadAuditoria
    {
        public string? MDLO { get; set; } = null;	
        public string? IMG { get; set; } = null;
        public string? URL { get; set; } = null;
        public string? URL2 { get; set; } = null;
        public string? NAMEFTO { get; set; } = null;
        public string? FTO { get; set; } = null;
        public string? TPOFTO { get; set; } = null;
    }
}
