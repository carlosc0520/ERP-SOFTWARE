using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.MODULOS
{
    public class ComandoSubModulosInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDMDLO { get; set; } = null;
        public string? DSCRPCN { get; set; } = null;
        public string? ICONO { get; set; } = null;
        public string? URL { get; set; } = null;
        public bool? ISPARENT { get; set; } = null;
    }
}
