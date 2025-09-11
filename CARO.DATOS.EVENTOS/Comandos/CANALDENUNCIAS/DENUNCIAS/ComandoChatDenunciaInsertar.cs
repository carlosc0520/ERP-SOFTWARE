using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS
{
    public class ComandoChatDenunciaInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDDENUNCIA { get; set; } = null;
        public int? IDRECEPTOR { get; set; } = null;
        public string? MENSAJE { get; set; } = null;
        public bool? TPO { get; set; } = null;

    }
}
