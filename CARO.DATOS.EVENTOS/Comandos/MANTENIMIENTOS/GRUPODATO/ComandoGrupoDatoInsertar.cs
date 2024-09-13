using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.GRUPODATO
{
    public class ComandoGrupoDatoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? DGDTLLE { get; set; } = null;
        public string? GDTPO { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public string? VLR1 { get; set; } = null;
        public string? VLR2 { get; set; } = null;
    }
}
