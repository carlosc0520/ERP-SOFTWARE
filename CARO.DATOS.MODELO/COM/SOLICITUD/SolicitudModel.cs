using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.COM.SOLICITUD
{
    public class SolicitudModel : EntidadAuditoria
    {
        public string? GDSUCRSLS {get;set;} = null;
        public string? DGDSUCRSLS { get; set; } = null;
        public string? GDESPCLDD {get;set;} = null;
        public string? DGDESPCLDD { get; set; } = null;
        public string? ABOGADO {get;set;} = null;
        public DateTime? FCHASERVICIO {get;set;} = null;
        public string? FCHA{ get; set; } = null;
        public int? DATA_HORA {get;set;} = null;
        public string? NMBRES {get;set;} = null;
        public string? APLLDS {get;set;} = null;
        public string? CORREO {get;set;} = null;
        public string? ACORREO { get; set; } = null;
        public string? CELULAR {get;set;} = null;
        public string? COMENTARIOS {get;set;} = null;
        public string? FILES { get; set; } = null;
        public string? HORARIOS { get; set; } = null;
        public string? DCESTDO { get; set; } = null;

    }
}
