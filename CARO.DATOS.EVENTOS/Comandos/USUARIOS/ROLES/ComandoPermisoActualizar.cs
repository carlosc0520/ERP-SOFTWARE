using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;


namespace CARO.DATOS.EVENTOS.Comandos.USUARIOS.ROLES
{
    public class ComandoPermisoActualizar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? DATA { get; set; } = null;
        public List<ComandoPermisosActualizarItems>? DATOS = null;
    }

    public class ComandoPermisosActualizarItems
    {
        public int? ID { get; set; } = null;
        public int? IDRGSTR { get; set; } = null;
        public int? IDPRMSO { get; set; } = null;
        public bool? PRMSO { get; set; } = null;
        public string? CESTDO { get; set; } = null;

    }
}
