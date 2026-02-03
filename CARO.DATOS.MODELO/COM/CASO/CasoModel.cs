using CARO.ENTIDAD.Modelo.Auditoria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CARO.DATOS.MODELO.COM.CASO
{
    public class CasoModel : EntidadAuditoria
    {
        public string? CASO { get; set; } = null;
        public int? IDCLNTE { get; set; } = null;
        public string? DIDCLNTE { get; set; } = null;
        public string? GDAREACSO { get; set; } = null;
        public string? DGDAREACSO { get; set; } = null;
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
        public string? DGDESTDOCSO { get; set; } = null;
        public string? GDSMFROCSO { get; set; } = null;
        public string? DGDSMFROCSO { get; set; } = null; 
        public DateTime? FINI { get; set; } = null;
        public DateTime? FFIN { get; set; } = null;
        public string? NAMEABGDS { get; set; } = null;

    }
}
