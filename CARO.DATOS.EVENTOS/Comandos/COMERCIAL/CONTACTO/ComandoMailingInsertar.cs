using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO
{
    public class ComandoMailingInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? MAILING_ID { get; set; } = null;
        public int? INDICADOR { get; set; } = null;
        public string? ASUNTO { get; set; } = null;
        public string? CUERPO_HTML { get; set; } = null;
        public string? IMAGENES_JSON { get; set; } = null;
        public string? DESTINATARIOS { get; set; } = null;
        public string? DESTINATARIO { get; set; } = null;
        public string? EVENTO { get; set; } = null;
        public DateTime? FPROGRAMADA { get; set; } = null;
        public string? ESTADO { get; set; } = null;
        public string? MENSAJE { get; set; } = null;
        public string? CORREOSEND { get; set; } = null;
        public string? PLACEHOLDER { get; set; } = null;
    }
}
