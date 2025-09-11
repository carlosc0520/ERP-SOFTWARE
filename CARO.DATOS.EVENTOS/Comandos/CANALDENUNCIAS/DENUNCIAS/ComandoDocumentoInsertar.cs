using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS
{
    public class ComandoDocumentoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDDENUNCIA { get; set; } = null;
        public string? NARCHIVO { get; set; } = null;
        public decimal? SIZE { get; set; } = null;
        public string? RUTA { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;
        public List<IFormFile>? FILES { get; set; } = new List<IFormFile>();
        public List<ComandoDocumentoModel>? DOCUMENTOS { get; set; } = new List<ComandoDocumentoModel>();

    }
}
