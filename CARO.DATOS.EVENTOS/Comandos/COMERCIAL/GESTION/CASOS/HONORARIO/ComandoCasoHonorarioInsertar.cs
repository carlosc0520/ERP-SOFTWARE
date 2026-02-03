using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS.HONORARIO
{
    public class ComandoCasoHonorarioInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDCASO { get; set; } = null;
        public string? NMBRE { get; set; } = null;
        public string? URLHNRRIO { get; set; } = null;
        public int? TIPO { get; set; } = null;
        public IFormFile? FILE{ get; set; } = null;
        public string? COMNTRS { get; set; } = null;

    }
}