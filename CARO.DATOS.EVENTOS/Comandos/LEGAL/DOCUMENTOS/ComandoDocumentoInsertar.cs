using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.LEGAL.DOCUMENTOS
{
    public class ComandoDocumentoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDUSR { get; set; } = null;
        public string? NOMBRE { get; set; } = null;
        public string? GDTPOFILE { get; set; } = null;
        public string? EXTENSION { get; set; } = null;
        public int? IDPADRE { get; set; } = null;
        public int? TIPO { get; set; } = 1;
        public string? RUTA { get; set; } = null;
        public IFormFile? FILE { get; set; } = null;
        public string? PASSWORD { get; set; } = null;
    }
}
