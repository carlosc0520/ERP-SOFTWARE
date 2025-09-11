using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS
{
    public class ComandoTestigoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDDENUNCIA { get; set; } = null;
        public string? NOMBRE { get; set; } = null;
        public string? APELLIDO { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? TELEFONO { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;

    }
}
