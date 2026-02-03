using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.EQUIPO
{
    public class ComandoEquipoXCasoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? NMBREEQUPO { get; set; } = null;
        public string? ABOGDOS { get; set; } = null;
    }
}

