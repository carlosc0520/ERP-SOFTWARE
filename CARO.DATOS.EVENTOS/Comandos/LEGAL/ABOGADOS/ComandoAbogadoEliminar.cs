using CARO.CORE.Structs;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS
{
    public class ComandoAbogadoEliminar : IRequest<RespuestaConsulta>
    {
        public int? ID { get; set; } = null;
        public string? UEDCN { get; set; } = null;
    }
}