using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.GRUPODATO
{
    public class ComandoGrupoDatoDetInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? GDPDRE { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public string? VLR1 { get; set; } = null;
        public string? VLR2 { get; set; } = null;
        public string? VLR3 { get; set; } = null;
        public string? VLR4 { get; set; } = null;

    }
}
