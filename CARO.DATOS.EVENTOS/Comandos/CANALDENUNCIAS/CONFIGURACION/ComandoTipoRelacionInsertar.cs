using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.CONFIGURACION
{
    public class ComandoTipoRelacionInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDEMPRESA { get; set; } = null;
        public string? TIPO { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public string? DETALLE { get; set; } = null;
    }
}
