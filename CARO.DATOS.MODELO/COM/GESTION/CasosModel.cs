using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.COM.GESTION
{
    public class CasosModel : EntidadAuditoria
    {
        public int? IDEQPO { get; set; } = null;
        public string? DIDEQPO { get; set; } = null;
        public int? IDCLENTE { get; set; } = null;
        public string? DIDCLENTE { get; set; } = null;
        public string? CASO { get; set; } = null;
        public string? GDAREACSO { get; set; } = null;
        public string? DGDAREACSO { get; set; } = null;
        public string? GDESTDOPRCSL { get; set; } = null;
        public string? DGDESTDOPRCSL { get; set; } = null;
        public string? ABOGDOS { get; set; } = null;
        public string? HONORARIOS { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;
        public string? GDRSLTDOCSO { get; set; } = null;
        public string? DGDRSLTDOCSO { get; set; } = null;
        public string? GDACCNSCMRCLS { get; set; } = null;
        public string? DGDACCNSCMRCLS { get; set; } = null;
        public string? CMNTRS { get; set; } = null;
        public string? COMENTARIOS_COTIZA { get; set; } = null;

    }

    public class ComentarioModel : EntidadAuditoria
    {
        public int? IDCASO { get; set; } = null;
        public string? NMBRE { get; set; } = null;
        public string? URLHNRRIO { get; set; } = null;
        public string? TIPO { get; set; } = null;
        public string? COMNTRS { get; set; } = null;
    }

    public class HonorarioModel : EntidadAuditoria
    {
        public int? IDCASO { get; set; } = null;
        public string? NMBRE { get; set; } = null;
        public string? URLHNRRIO { get; set; } = null;
        public string? TIPO { get; set; } = null;
        public string? COMNTRS { get; set; } = null;
    }

    public class ContactoModel : EntidadAuditoria
    {
        public int? IDCLNTE { get; set; } = null;
        public string? NMBRS { get; set; } = null;
        public string? APLLIDS { get; set; } = null;
        public string? GDEMPRSA { get; set; } = null;
        public string? DGDEMPRSA { get; set; } = null;
        public string? CCRPRTVO { get; set; } = null;
        public string? CRRSCNDRIO { get; set; } = null;

    }

    public class HistoryModel : EntidadAuditoria
    {
        public int? IDCASO { get; set; } = null;
        public string? IDREF { get; set; } = null;
        public string? TIPO { get; set; } = null;
        public string? DESCP { get; set; } = null;
    }
}
