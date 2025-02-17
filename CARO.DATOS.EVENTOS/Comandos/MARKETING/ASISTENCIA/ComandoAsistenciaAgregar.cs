using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA
{
    public class ComandoAsistenciaAgregar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDCRSO { get; set; } = null;
        public string? CODIGO { get; set; } = null;
        public DateTime? FCHA { get; set; } = null;
        public int? IDPRTCPNTE { get; set; } = null;
    }
}
