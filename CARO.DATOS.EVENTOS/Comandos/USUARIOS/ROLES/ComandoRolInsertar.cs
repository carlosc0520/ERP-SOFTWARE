using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.USUARIOS.ROLES
{
    public class ComandoRolInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? DSCRPCN { get; set; } = null;
    }
}
