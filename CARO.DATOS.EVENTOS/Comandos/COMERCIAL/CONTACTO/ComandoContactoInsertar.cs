using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO
{
    public class ComandoContactoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? NMBRS { get; set; } = null;
        public string? APLLDS { get; set; } = null;
        public string? EML { get; set; } = null;
        public string? DRCCN { get; set; } = null;
        public string? TLFNO { get; set; } = null;
        public string? CLENTE { get; set; } = null;
        public string? GDRBROC { get; set; } = null;
        public string? GDCRGOC { get; set; } = null;
    }
}
