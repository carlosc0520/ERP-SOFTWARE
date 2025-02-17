using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS
{
    public class ComandoHorariosInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDABGDO { get; set; } = null;
        public DateTime? FCHA { get; set; } = null;
        public string? HRAINIT { get; set; } = null;
        public string? HRAFN { get; set; } = null;

    }
}
