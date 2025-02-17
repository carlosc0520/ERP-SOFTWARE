using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.COM.CLIENTE
{
    public class ClienteModel : EntidadAuditoria
    {
        public string? NMBRS { get; set; } = null;
        public string? APLLDS { get; set; } = null;
        public string? RUC { get; set; } = null;
        public string? RZNSCL { get; set; } = null;
        public string? MRCA { get; set; } = null;
        public string? DRCCN { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? CNTCTO { get; set; } = null;
        public string? MOTIVO { get; set; } = null;
        public string? APUNTES { get; set; } = null;
        public string? GDESTDOCLI { get; set; } = null;
        public string? DGDESTDOCLI { get; set; } = null;
        public string? RTAIMG { get; set; } = null;
    }
    public class SeguimientoClienteModel : EntidadAuditoria
    {
        public int? IDCLIENTE { get; set; } = null;
        public int? IDPRSNA { get; set; } = null;
        public string? NPRSNA { get; set; } = null;
        public DateTime? FCHA { get; set; } = null;
        public string? MOTIVO { get; set; } = null;
        public string? APUNTES { get; set; } = null;
    }
    public class ReporteSeguimientoModel
    {
        public int? IDMRCA { get; set; } = null;
        public string? VLR1 { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public int? CANT { get; set; } = null;
    }
}
