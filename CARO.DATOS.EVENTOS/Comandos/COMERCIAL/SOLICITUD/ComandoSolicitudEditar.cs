using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.SOLICITUD
{
    public class ComandoSolicitudEditar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? RCMNTRS { get; set; } = null;
        public string? PATHS { get; set; } = null;
        public string? ACMNTRS { get; set; } = null;
        public string? ACORREO { get; set; } = null;
        public string? CORREO { get; set; } = null;

    }
}
