using CARO.ENTIDAD.Modelo.Auditoria;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.MODELO.COM.CURSO
{
    public class CursoModel : DetalleCursoModel
    {
        public string? DSCRPCN { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public DateTime? FINI { get; set; } = null;
        public DateTime? FFIN { get; set; } = null;
        public string? GDCTGCRSO { get; set; } = null;
        public string? DGDCTGCRSO { get; set; } = null;
        public string? RTAIMG { get; set; } = null;
        public string? TYPE { get; set; } = null;
        public string? NAME { get; set; } = null;
        public IFormFile? IMG { get; set; } = null;
        public string? IMAGEN { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public decimal? EJEX { get; set; } = null;
        public decimal? EJEY { get; set; } = null;
        public decimal? EJEX2 { get; set; } = null;
        public decimal? EJEY2 { get; set; } = null;

    }

    public class DetalleCursoModel : EntidadAuditoria
    {
        public int? IDCRSO { get; set; } = null;
        public string? OBJETVS { get; set; } = null;
        public string? PRTCPNTS { get; set; } = null;
        public string? DRCCN { get; set; } = null;
        public string? INVRSN { get; set; } = null;
        public string? MDLDD { get; set; } = null;
        public string? LGAR { get; set; } = null;
        public string? IMGFILE { get; set; } = null;
        public string? MODULOS { get; set; } = null;
        public string? COURSE { get; set; } = null;

    }

    public class ProfesoresModel : EntidadAuditoria
    {
        public int? IDCRSO { get; set; } = null;
        public string? NMBRS { get; set; } = null;
        public string? CARGO { get; set; } = null;
        public string? UNVRSDD { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;
        public string? RISIG { get; set; } = null;
        public string? RISFB { get; set; } = null;
        public string? RISLK { get; set; } = null;
        public string? RTIK { get; set; } = null;
    }

    public class SponsorsModel : EntidadAuditoria
    {
        public int? IDCRSO { get; set; } = null;
        public string? NMBRS { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
    }
}
