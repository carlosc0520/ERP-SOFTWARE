using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.SEG.MODULOS
{
    public class ComandoModuloInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? MDLO { get; set; } = null;
        public string? IMG { get; set; } = null;
        public string? URL { get; set; } = null;
        public string? URL2 { get; set; } = null;
    }
}
