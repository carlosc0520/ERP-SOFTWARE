using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.COM.MENU
{
    public class MenuModel : EntidadAuditoria
    {
        public string? DSCRPCN { get; set; } = null;
        public string? ICONO { get; set; } = null;
        public string? URL { get; set; } = null;
        public string? SUBMODULO { get; set; } = null;
        public bool? ISPARENT { get; set; } = null;
        public int? IDMDLO { get; set; } = null;
    }
}
