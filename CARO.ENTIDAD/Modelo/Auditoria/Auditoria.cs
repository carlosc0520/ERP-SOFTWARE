namespace CARO.ENTIDAD.Modelo.Auditoria
{
    public class EntidadAuditoria : IAuditoria
    {
        public int? ID { get; set; } = null;
        public string? UCRCN { get; set; } = "";
        public DateTime? FCRCN { get; set; }
        public string? UEDCN { get; set; } = "";
        public DateTime? FEDCN { get; set; }
        public string GDESTDO { get; set; } = "A";
        public string CESTDO { get; set; } = "A";
        public DateTime? FESTDO { get; set; }
        public int? RN { get; set; } = null;
        public int? TOTALROWS { get; set; } = null;
        public string? DESC { get; set; } = null;
        public int? INIT { get; set; } = null;
        public int? ROWS { get; set; } = null;
        public string? DRAW { get; set; } = null;
        public int? IDMRCA { get; set; } = null;
    }
    public interface IAuditoria
    {
        public int? ID { get; set; }
        public string UCRCN { get; set; }
        public DateTime? FCRCN { get; set; }
        public string UEDCN { get; set; }
        public DateTime? FEDCN { get; set; }
        public string GDESTDO { get; set; }
        public string CESTDO { get; set; }
        public DateTime? FESTDO { get; set; }
        public int? RN { get; set; }
        public int? TOTALROWS { get; set; }
        public string? DESC { get; set; }
        public int? INIT { get; set; } 
        public int? ROWS { get; set; } 
        public string? DRAW { get; set; }
        public int? IDMRCA { get; set; }
    }
}
