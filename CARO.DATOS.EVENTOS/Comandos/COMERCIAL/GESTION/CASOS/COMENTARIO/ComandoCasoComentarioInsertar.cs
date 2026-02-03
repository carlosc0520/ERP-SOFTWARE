using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS.COMENTARIO
{
    public class ComandoCasoComentarioInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDCASO { get; set; } = null;
        public string? NMBRE { get; set; } = null;
        public string? URLHNRRIO { get; set; } = null;
        public int? TIPO { get; set; } = null;
        public string? COMNTRS { get; set; } = null;

    }
}