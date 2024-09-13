using CARO.CORE.Structs;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.SEG.MODULOS
{
    public class ComandoModuloEliminar : IRequest<RespuestaConsulta>
    {
        public int ID { get; set; }
        public string UEDCN { get; set; }
    }
}
