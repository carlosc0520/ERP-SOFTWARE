using CARO.CORE.Structs;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS.HONORARIO
{
    public class ComandoCasoHonorarioEliminar : IRequest<RespuestaConsulta>
    {
        public int? ID { get; set; } = null; 
        public string? UEDCN { get; set; } = null;
        public string? URLHNRRIO { get; set; } = null;
    }
}
