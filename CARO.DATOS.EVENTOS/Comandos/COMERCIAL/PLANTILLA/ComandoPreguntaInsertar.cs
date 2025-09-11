using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA
{
    public class ComandoPreguntaInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDFORM { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public bool? REQUIREDP { get; set; } = null;
        public string? GDTYPEP { get; set; } = null;
        public string? ALTERNATIVAS { get; set; } = null;
    }

    public class AlternativaModel : EntidadAuditoria
    {
        public int? IDPRGNTA { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public bool? REQUIREDP { get; set; } = null;
        public string? GDTYPEP { get; set; } = null;
        public bool? DEL { get; set; } = null;

    }

}
