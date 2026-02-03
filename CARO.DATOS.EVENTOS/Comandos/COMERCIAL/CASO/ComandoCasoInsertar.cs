using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CASO
{
    public class ComandoCasoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? CASO { get; set; } = null;
        public int? IDCLNTE { get; set; } = null;
        public string? GDAREACSO { get; set; } = null;
        public string? ABOGDOS { get; set; } = null;
        public string? HNRRIO { get; set; } = null;
        public decimal? HINICIAL { get; set; } = null;
        public decimal? HEXITO { get; set; } = null;
        public decimal? HUNICO { get; set; } = null;
        public decimal? HAUDIENCIA { get; set; } = null;
        public decimal? HDIA { get; set; } = null;
        public decimal? HHORA { get; set; } = null;
        public decimal? HMENSUAL { get; set; } = null;
        public decimal? HCERTIFICADOS { get; set; } = null;
        public string? COMNTRIO { get; set; } = null;
        public DateTime? FENVIO { get; set; } = null;
        public DateTime? FULTIMOSEG { get; set; } = null;
        public string? GDESTDOCSO { get; set; } = null;
        public string? GDSMFROCSO { get; set; } = null;
    }
}
