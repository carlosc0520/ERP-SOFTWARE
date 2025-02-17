using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA
{
    public class ComandoCalendarioInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDCRSO { get; set; } = null;
        public string? DSCRPCN { get; set; } = null;
        public DateTime? FINI { get; set; } = null;
        public DateTime? FFIN { get; set; } = null;
        public string? PRFESRS { get; set; } = null;
    }
}
