using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CURSO
{
    public class ComandoDetalleCursoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? IDCRSO { get; set; } = null;
        public string? RTAIMG { get; set; } = null;
        public IFormFile? IMGCOURSE { get; set; } = null;
        public string? DSCRPCN { get; set; } = null;
        public string? OBJETVS { get; set; } = null;
        public string? PRTCPNTS { get; set; } = null;
        public string? DRCCN { get; set; } = null;
        public string? INVRSN { get; set; } = null;
        public string? MDLDD { get; set; } = null;
        public string? LGAR { get; set; } = null;
        public string? MODULOS { get; set; } = null;

    }
}
