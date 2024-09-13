using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.MODULOS
{
    public class ComandoDetSubModulosInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDSUBMDLO { get; set; } = null;
        public string? DSCRPCN { get; set; } = null;
        public string? ICONO { get; set; } = null;
        public string? URL { get; set; } = null;
    }
}