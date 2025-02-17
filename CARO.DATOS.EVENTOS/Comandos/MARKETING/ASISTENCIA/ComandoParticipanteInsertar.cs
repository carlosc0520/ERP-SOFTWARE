using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA
{
    public class ComandoParticipanteInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDEVENTO { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? APELLIDOS { get; set; } = null;
        public string? DNI { get; set; } = null;
        public string? CORREO { get; set; } = null;
    }
}
