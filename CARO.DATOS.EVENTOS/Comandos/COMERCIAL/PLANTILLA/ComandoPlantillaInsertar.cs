using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA
{
    public class ComandoPlantillaInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? DSCRPCN { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public string? GDTPODCMNTO { get; set; } = null;
        public string? DGDTPODCMNTO { get; set; } = null;
        public string? RTA { get; set; } = null;
        public string? RTAPLNTLLA { get; set; } = null;
        public IFormFile? ARCHVO { get; set; } = null;
    }
}
