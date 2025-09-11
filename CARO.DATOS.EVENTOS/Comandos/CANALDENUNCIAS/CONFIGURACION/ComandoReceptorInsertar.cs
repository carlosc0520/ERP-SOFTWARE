using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.CONFIGURACION
{
    public class ComandoReceptorInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDUSER { get; set; } = null;
        public int? IDROL { get; set; } = null;
        public bool? PRINCIPAL { get; set; } = null;
    }
}
