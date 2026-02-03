using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS
{
    public class ComandoCasoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? CASO { get; set; } = null;
        public int? IDCLIENTE { get; set; } = null;
        public int? IDEQPO { get; set; } = null;
        public string? ABOGDOS { get; set; } = null;
        public string? GDAREACSO { get; set; } = null;
        public string? GDESTDOPRCSL { get; set; } = null;
        public string? GDRSLTDOCSO { get; set; } = null; 
        public string? GDACCNSCMRCLS { get; set; } = null;
        public string? NAMECLIENTE { get; set; } = null;
        public string? CMNTRS { get; set; } = null;
        public List<ComandoHonorarioInsertar>? HONORARIOS { get; set; } = new List<ComandoHonorarioInsertar>();
        public List<ComandoComentarioInsertar>? COMENTARIOS { get; set; } = new List<ComandoComentarioInsertar>();

    }

    public class ComandoHonorarioInsertar
    {
        public string? NMBRE { get; set; } = null;
        public int? TIPO { get; set; } = null;
        public string? FILE { get; set; } = null;
        public string? URLHNRRIO { get; set; } = null;
        public string? COMNTRS { get; set; } = null;
        public string? FCHA { get; set; } = null;

    }

    public class ComandoComentarioInsertar
    {
        public string? NMBRE { get; set; } = null;
        public int? TIPO { get; set; } = null;
        public string? URLHNRRIO { get; set; } = null;
        public string? COMNTRS { get; set; } = null;

    }
}
