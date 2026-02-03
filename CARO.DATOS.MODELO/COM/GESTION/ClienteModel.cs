using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.COM.GESTION
{
    public class ClienteModel : EntidadAuditoria
    {
        public int? IDEMPRSA { get; set; } = null;
        public string? RUC {get;set;} = null;
        public string? RZNSCL {get;set;} = null;
        public string? NMBRECMRCL { get; set; } = null;
        public string? RPRSNTNTE {get;set;} = null;
        public string? DRCCN {get;set;} = null;
        public string? TLFNO {get;set;} = null;
        public string? GDTMPOEMPRESA { get; set; } = null;
        public string? DGDTMPOEMPRESA { get; set; } = null;
        public string? GDTIPOPRSNA { get; set; } = null;
        public string? DGDTIPOPRSNA { get; set; } = null; 
        public string? GDSCTRINDSTRIA { get; set; } = null;
        public string? DGDSCTRINDSTRIA { get; set; } = null; 
        public string? CRREO { get; set; } = null;
        public string? DGDEMPRSA { get; set; } = null;
        public string? GDEMPRSA { get; set; } = null; 
        public DateTime? CDSDE {get;set;} = null;
    }
}
