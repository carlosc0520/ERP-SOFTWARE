using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.USUARIOS.ROLES
{
    public class RolesModel : EntidadAuditoria
    {
        public string? DSCRPCN { get; set; } = null;
    }

    public class PermisosModel : EntidadAuditoria
    {
        public string? DSCRPCN { get; set; } = null;
        public int? IDITM { get; set; } = null;
        public int? IDRLE { get; set; } = null;
        public bool? PRMSO { get; set; } = null;

    }

    public class PermisosItemsModel : EntidadAuditoria
    {
        public string? DSCRPCN { get; set; } = null;
        public string? GDPRMSO { get; set; } = null;
        public int? IDRGSTR { get; set; } = null;
        public int? IDPRMSO { get; set; } = null;
        public bool? PRMSO { get; set; } = null;

    }
}