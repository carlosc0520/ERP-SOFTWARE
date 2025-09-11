using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.CANALDENUNCIAS
{
    public class TipoDenunciaModel : EntidadAuditoria
    {
        public string? IDEMPRESA { get; set; } = null;
        public string? TIPO { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public string? DETALLE { get; set; } = null;
    }

    public class DashboardaModel : EntidadAuditoria
    {
        public int? IDUSR { get; set; } = null;
        public string? IDEMPRESA { get; set; } = null;
        public string? DENUNCIAS_TIPO { get; set; } = null;
        public string? DENUNCIAS_FASE { get; set; } = null;
    }

    public class RelacionEmpresaModel : EntidadAuditoria
    {
        public string? IDEMPRESA { get; set; } = null;
        public string? TIPO { get; set; } = null;
        public string? DESCP { get; set; } = null;
        public string? DETALLE { get; set; } = null;
    }

    public class AccionesModel : EntidadAuditoria
    {
        public int? IDDENUNCIA { get; set; } = null;
        public string? NOMBRE { get; set; } = null;
        public string? CONTACTO { get; set; } = null;
        public string? EMAIL { get; set; } = null;
        public string? DESCRIPCION { get; set; } = null;
        public bool? RESUELTO { get; set; } = null;
    }

    public class ReceptorModel : EntidadAuditoria
    {
        public int? IDUSER { get; set; } = null;
        public int? IDROL { get; set; } = null;
        public string? DIDROL { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public string? NCMPTO { get; set; } = null;
        public string? IDEMPRESA { get; set; } = null;
        public string? ARCHVO { get; set; } = null;
        public string? NOMBRS { get; set; } = null;
        public string? SNOMBRS { get; set; } = null;
        public string? APLLDS { get; set; } = null;
        public string? SAPLLDS { get; set; } = null;
        public string? DCUMNTO { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public bool? PRINCIPAL { get; set; } = null;

    }
}
