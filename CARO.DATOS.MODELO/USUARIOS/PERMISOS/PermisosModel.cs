using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.USUARIOS.PERMISOS
{
    public class PermisosModel : EntidadAuditoria
    {
        public string? DSCRPCN { get; set; } = null;
        public int? IDITM { get; set; } = null;
        public string? DIDITM { get; set; } = null;
        public string? GDPRMSO { get; set; } = null;
        public string? VSTA { get; set; } = null;

    }

    public class VistaModel : EntidadAuditoria
    {
        public string? DSCRPCN { get; set; } = null;
        public int? IDITM { get; set; } = null;
        public string? DIDITM { get; set; } = null;

    }
    
}
