using CARO.CORE.Structs;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.EMPRESAS
{
    public class ComandoEmpresaEliminar : IRequest<RespuestaConsulta>
    {
        public int? ID { get; set; } = null;
        public string? UEDCN { get; set; } = null;
    }
}
