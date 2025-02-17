using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.LEGAL.ABOGADOS
{
    public class AbogadosModel : EntidadAuditoria
    {
        public int? IDPRSNA { get; set; } = null;
        public string? NMBRS { get; set; } = null;
        public string? DCUMNTO { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public string? NCLGTRA { get; set; } = null;
        public string? GDESPCLDD { get; set; } = null;
        public string? DGDESPCLDD { get; set; } = null;
        public string? NLICNCIA { get; set; } = null;
        public string? HORARIOS { get; set; } = null;
    }

    public class HorariosModel : EntidadAuditoria
    {
        public int? IDABGDO { get; set; } = null;
        public string? FCHA { get; set; } = null;
        public TimeSpan? HRAINIT { get; set; } = null;
        public TimeSpan? HRAFN { get; set; } = null;

    }
}
