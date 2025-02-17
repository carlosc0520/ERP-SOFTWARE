using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA
{
    public class ComandoEditarConfiguracion : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public decimal? EJEX { get; set; } = null;
        public decimal? EJEY { get; set; } = null;
        public decimal? EJEX2 { get; set; } = null;
        public decimal? EJEY2 { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public IFormFile? FILE { get; set; } = null;
        public int? IDCRSO { get; set; } = null;
    }
}
