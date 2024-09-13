using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CURSO
{
    public class ComandoCursoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? DSCRPCN { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public DateTime? FINI { get; set; } = null;
        public DateTime? FFIN { get; set; } = null;
        public string? GDCTGCRSO { get; set; } = null;
        public IFormFile? IMG { get; set; } = null;
        public string? RTAIMG { get; set; } = null;
    }
}
