using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS
{
    public class ComandoCasoEditar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? CASO { get; set; } = null;
        public int? IDCLIENTE { get; set; } = null;
        public int? IDEQPO { get; set; } = null;
        public string? ABOGDOS { get; set; } = null;
        public string? GDAREACSO { get; set; } = null;
        public string? GDESTDOPRCSL { get; set; } = null;
        public string? GDRSLTDOCSO { get; set; } = null;
        public string? GDACCNSCMRCLS { get; set; } = null;
        public string? GDACCNSCMRCLSANT { get; set; } = null;
        public string? NAMECLIENTE { get; set; } = null;
        public string? CMNTRS { get; set; } = null;

    }
}
