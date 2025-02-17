using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CURSO
{
    public class ComandoProfesorInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDCRSO { get; set; } = null;
        public string? NMBRS { get; set; } = null;
        public string? CARGO { get; set; } = null;
        public string? UNVRSDD { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;
        public string? RISIG { get; set; } = null;
        public string? RISFB { get; set; } = null;
        public string? RISLK { get; set; } = null;
        public string? RTIK { get; set; } = null;
        public bool? DELETE { get; set; } = false;
    }
}
