using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CLIENTE
{
    public class ComandoClienteInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? NMBRS { get; set; } = null;
        public string? APLLDS { get; set; } = null;
        public string? RUC { get; set; } = null;
        public string? RZNSCL { get; set; } = null;
        public string? DRCCN { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? CNTCTO { get; set; } = null;
        public string? MOTIVO { get; set; } = null;
        public string? APUNTES { get; set; } = null;
        public string? GDESTDOCLI { get; set; } = null;
        public string? RTAIMG { get; set; } = null;
        public IFormFile? IMG { get; set; } = null;

    }
}
