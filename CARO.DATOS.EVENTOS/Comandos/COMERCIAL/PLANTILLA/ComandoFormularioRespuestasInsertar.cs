using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA
{
    public class ComandoFormularioRespuestasInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDFORMU { get; set; } = null;
        public string? EMAIL { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? RESPUESTAS { get; set; } = null;
        public string? NAMEFORM { get; set; } = null;

    }

    public class RespuestaUserModel
    {
        public int? IDPRGNTA { get; set; } = null;
        public string? IDRSPSTA { get; set; } = null;
        public int? IDFORMU { get; set; } = null;
    }

    public class FormularioResModel
    {
        public string? ENLACE { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? FORMULARIO { get; set; } = null;
        public string? NAMEFORM { get; set; } = null;

    }
}
