using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.USUARIOS.PERMISOS
{
    public class ComandoPermisoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? DSCRPCN { get; set; } = null;
        public int? IDITM { get; set; } = null;
        public string? GDPRMSO { get; set; } = null;

    }
}