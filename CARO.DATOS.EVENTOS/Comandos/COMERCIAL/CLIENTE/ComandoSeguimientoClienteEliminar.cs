using CARO.CORE.Structs;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CLIENTE
{
    public class ComandoSeguimientoClienteEliminar : IRequest<RespuestaConsulta>
    {
        public int? ID { get; set; } = null;
        public string? UEDCN { get; set; } = null;
    }
}
