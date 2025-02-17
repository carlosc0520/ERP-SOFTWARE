using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CLIENTE
{
    public class ComandoSeguimientoClienteInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDCLIENTE { get; set; } = null;
        public int? IDPRSNA { get; set; } = null;
        public DateTime? FCHA { get; set; } = null;
        public string? MOTIVO { get; set; } = null;
        public string? APUNTES { get; set; } = null;
    }
}
