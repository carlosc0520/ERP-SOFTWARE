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
        public string? TELFNO { get; set; } = null;
        public string? DEPARTAMENTO { get; set; } = null;
        public string? PROVINCIA { get; set; } = null;
        public string? DISTRITO { get; set; } = null;
        public string? DIRECCION { get; set; } = null;
        public string? CARGO { get; set; } = null;
        public string? RESENA { get; set; } = null;
        public string? PASSWORD { get; set; } = null;
        public string? PRMSO { get; set; } = null;
        public IFormFile? FTO { get; set; } = null;
        public string? ANEXO { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public string? REDESVAR { get; set; } = null;
        public List<RedSocialModel>? REDES { get; set; } = new List<RedSocialModel>();

    }

    public class RedSocialModel
    {
        public int? ID { get; set; } = null;
        public string? ENLACE { get; set; } = null;
        public string? IDRED { get; set; } = null;

    }
}