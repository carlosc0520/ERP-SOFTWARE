using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.EMPRESAS
{
    public class ComandoEmpresaInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? MRCA { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;
        public string? RUC { get; set; } = null;
        public string? RZNSCIL { get; set; } = null;
        public int? IDPRSNA { get; set; } = null;
        public string? DRCNN { get; set; } = null;
        public string? PRVNCA { get; set; } = null;
        public int? IDPAIS { get; set; } = null;
        public string? DGDENTDD { get; set; } = null;
        public string? GDENTDD { get; set; } = null;
        public string? CCNTA { get; set; } = null;
        public string? CCNTACCI { get; set; } = null;
    }
}
