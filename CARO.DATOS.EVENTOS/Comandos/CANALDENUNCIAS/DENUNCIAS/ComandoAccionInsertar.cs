using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS
{
    public class ComandoAccionInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDDENUNCIA { get; set; } = null;
        public string? NOMBRE { get; set; } = null;
        public string? CONTACTO { get; set; } = null;
        public string? EMAIL { get; set; } = null;
        public string? DESCRIPCION { get; set; } = null;
        public bool? RESUELTO { get; set; } = null;

    }
}
