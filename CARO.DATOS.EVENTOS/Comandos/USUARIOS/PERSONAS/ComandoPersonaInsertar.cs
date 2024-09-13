using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.USUARIOS.PERSONAS
{
    public class ComandoPersonaInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDROL { get; set; } = null;
        public string? NOMBRS { get; set; } = null;
        public string? SNOMBRS { get; set; } = null;
        public string? APLLDS { get; set; } = null;
        public string? SAPLLDS { get; set; } = null;
        public string? DCUMNTO { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? PASSWORD { get; set; } = null;
        public string? ANEXO { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public string? PRMSO { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;

    }
}