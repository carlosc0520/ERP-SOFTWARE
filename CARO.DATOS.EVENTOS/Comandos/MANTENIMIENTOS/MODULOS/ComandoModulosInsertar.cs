using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.MODULOS
{
    public class ComandoModulosInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? MDLO { get; set; } = null;
        public string? IMG { get; set; } = null;
        public string? URL { get; set; } = null;
        public string? URL2 { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;
    }
}
