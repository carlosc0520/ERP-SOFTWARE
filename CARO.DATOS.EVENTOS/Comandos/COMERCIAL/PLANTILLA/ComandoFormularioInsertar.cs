using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA
{
    public class ComandoFormularioInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDEMPRSA { get; set; } = null;
        public string? NOMBRE { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public DateTime? FINICIO { get; set; } = null;
        public DateTime? FFIN { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;
        public string? LOGO { get; set; } = null;
        public string? BGCOLOR { get; set; } = null;
        public string? BGCOLOR2 { get; set; } = null;
        public string? GDFORMT { get; set; } = null;
        public string? GDTPOGR { get; set; } = null;

    }
}
