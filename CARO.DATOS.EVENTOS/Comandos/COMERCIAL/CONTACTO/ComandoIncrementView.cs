using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO
{
    public class ComandoIncrementView : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? IDNTCA { get; set; } = null;
        public string? REDURL { get; set; } = null;
        public string? REDIRECT { get; set; } = null;
    }
}
