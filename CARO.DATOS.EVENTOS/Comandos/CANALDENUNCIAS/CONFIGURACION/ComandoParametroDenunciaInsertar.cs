using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.CONFIGURACION
{
    public class ComandoParametroDenunciaInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDEMPRESA { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public string? ABREV { get; set; } = null;
        public string? VLR1 { get; set; } = null;
        public string? VLR2 { get; set; } = null;
        public string? VLR3 { get; set; } = null;

    }
}
