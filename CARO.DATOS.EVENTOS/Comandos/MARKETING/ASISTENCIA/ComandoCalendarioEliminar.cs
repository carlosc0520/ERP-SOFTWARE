using CARO.CORE.Structs;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA
{
    public class ComandoCalendarioEliminar : IRequest<RespuestaConsulta>
    {
        public int? ID { get; set; } = null;
        public string? UEDCN { get; set; } = null;
    }
}
