using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.MANTENIMIENTOS.MODULOS
{
    public class ModulosModel : EntidadAuditoria
    {
        public string? MDLO { get; set; } = null;
        public string? IMG { get; set; } = null;
        public string? URL { get; set; } = null;
        public string? URL2 { get; set; } = null;
        public string? FTO { get; set; } = null;
        public string? NAMEFTO { get; set; } = null;
        public string? TPOFTO { get; set; } = null;
    }

    public class SubModulosModel : EntidadAuditoria
    {
        public int? IDMDLO { get; set; } = null;
        public string? DSCRPCN { get; set; } = null;
        public string? ICONO { get; set; } = null;
        public string? URL { get; set; } = null;
        public bool? ISPARENT { get; set; } = null;
    }

    public class SubModulosDetModel : EntidadAuditoria
    {
        public int? IDSUBMDLO { get; set; } = null;
        public string? DSCRPCN { get; set; } = null;
        public string? ICONO { get; set; } = null;
        public string? URL { get; set; } = null;
    }
}
