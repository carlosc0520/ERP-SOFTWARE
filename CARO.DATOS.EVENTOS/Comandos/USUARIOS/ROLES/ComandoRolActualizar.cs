using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.USUARIOS.ROLES
{
    public class ComandoRolActualizar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? DATA { get; set; } = null;
        public List<ComandoPermisosActualizar>? DATOS = null;
    }

    public class ComandoPermisosActualizar
    {
        public int? ID { get; set; } = null;
        public int? IDRLE { get; set; } = null;
        public int? IDITM { get; set; } = null;
        public bool? PRMSO { get; set; } = null;
        public string? CESTDO { get; set; } = null;

    }
}
