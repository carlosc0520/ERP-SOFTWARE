using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.SEG.LOGIN
{
    public class UsuarioModel : EntidadAuditoria
    {
        public string? USRIO { get; set; } = null;
        public string? PASSWORD { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? EML { get; set; } = null;
        public string? NYAPLLDS { get; set; } = null;
        public string? TDCMNTO { get; set; } = null;
        public string? DROL { get; set; } = null;
        public int? IDSCRSL { get; set; } = null;
        public string? NDCMNTO { get; set; } = null;
        public string? NTLFNO { get; set; } = null;
        public string? FVCLVE { get; set; } = null;
        public bool? FBLQUO { get; set; } = null;
        public bool? FRZRCMBOCLVE { get; set; } = null;
        public int? INTNTS { get; set; } = null;
        public int? IDROL { get; set; } = null;
    }
    public class SucursalUsuario
    {
        public string? IDUSRO { get; set; } = null;
        public string? IDSCRSL { get; set; } = null;
        public string? NSCRSL { get; set; } = null;
        public string? ID { get; set; } = null;
        public string? UCRCN { get; set; } = null;
        public DateTime? FCRCN { get; set; } = null;
        public string? UEDCN { get; set; } = null;
        public DateTime? FEDCN { get; set; } = null;
        public string? CESTDO { get; set; } = "V";
        public DateTime? FESTDO { get; set; } = null;
    }
}
