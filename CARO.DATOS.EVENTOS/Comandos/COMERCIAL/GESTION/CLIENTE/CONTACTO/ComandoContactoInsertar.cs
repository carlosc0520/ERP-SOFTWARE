using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CLIENTE.CONTACTO
{
    public class ComandoContactoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? LISTCONTACTOS { get; set; } = null;
    }
    public class ComandoListContactoInsertar : EntidadAuditoria
    {
        public int? IDCLNTE { get; set; } = null;
        public string? NMBRS { get; set; } = null;
        public string? APLLIDS { get; set; } = null;
        public string? GDEMPRSA { get; set; } = null;
        public string? CCRPRTVO { get; set; } = null;
        public string? CRRSCNDRIO { get; set; } = null;

    }


}
