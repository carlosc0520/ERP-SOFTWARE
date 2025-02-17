using CARO.ENTIDAD.Modelo.Auditoria;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.MODELO.MANTENIMIENTOS.EMPRESAS
{
    public class EmpresasModel : EntidadAuditoria
    {
        public string? MRCA { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public string? RUC { get; set; } = null;
        public string? RZNSCIL { get; set; } = null;
        public int? IDPRSNA { get; set; } = null;
        public string? DIDPRSNA { get; set; } = null;
        public string? DNIPRSNA { get; set; } = null;

        public string? DRCNN { get; set; } = null;
        public string? PRVNCA { get; set; } = null;
        public int? IDPAIS { get; set; } = null;
        public string? DIDPAIS { get; set; } = null;
        public string? DGDENTDD { get; set; } = null;
        public string? GDENTDD { get; set; } = null;
        public string? CCNTA { get; set; } = null;
        public string? CCNTACCI { get; set; } = null;
    }
}
