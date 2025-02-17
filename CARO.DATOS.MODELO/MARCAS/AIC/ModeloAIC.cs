using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.MARCAS.AIC
{
    public class ModeloAIC
    {
    }

    public class CursosModelAIC : EntidadAuditoria
    {
        public string? DSCRPCN { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public DateTime? FINI { get; set; } = null;
        public DateTime? FFIN { get; set; } = null;
        public string? GDCTGCRSO { get; set; } = null;
        public string? RTAIMG { get; set; } = null;
        public string? DETALLE { get; set;  } = null;
        public string? SPONSORS { get; set; } = null;

    }

    public class TeachesModelAIC : EntidadAuditoria
    {
        public int? IDCRSO { get; set; } = null;
        public string? NMBRS { get; set; } = null;
        public string? CARGO { get; set; } = null;
        public string? UNVRSDD { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public string? RISIG { get; set; } = null;
        public string? RISFB { get; set; } = null;
        public string? RISLK { get; set; } = null;
        public string? RTIK { get; set; } = null;
    }

    public class SponsorsModelAIC : EntidadAuditoria
    {
        public int? IDCRSO { get; set; } = null;
        public string? NMBRS { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
    }
}
