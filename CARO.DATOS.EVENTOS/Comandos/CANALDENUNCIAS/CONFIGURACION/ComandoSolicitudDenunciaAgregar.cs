using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.CONFIGURACION
{
    public class ComandoSolicitudDenunciaAgregar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDEMPRESA { get; set; } = null;
        public string? NOMBRE { get; set; } = null;
        public string? APELLIDO { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? ASUNTO { get; set; } = null;
        public string? MENSAJE { get; set; } = null;

    }
}
