using CARO.CORE.Structs;
using CARO.DATOS.MODELO.COM.CONTACTO;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO
{
    public class ComandoCorreoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? ASNTO { get; set; } = null;
        public string? CNTCTS { get; set; } = null;
        public string? MSJE { get; set; } = null;
        public IFormFile? FILE { get; set; } = null;
        public string? ADJUNTOS { get; set; } = null;
        public List<AdjuntoModel>? DATA { get; set; } = null;

    }
}
