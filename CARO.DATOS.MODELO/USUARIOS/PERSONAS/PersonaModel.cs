using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.USUARIOS.PERSONAS
{
    public class PersonaModel : EntidadAuditoria
    {
        public int? IDROL { get; set; } = null;
        public string? NOMBRS { get; set; } = null;
        public string? SNOMBRS { get; set; } = null;
        public string? APLLDS { get; set; } = null;
        public string? SAPLLDS { get; set; } = null;
        public string? DCUMNTO { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? PASSWORD { get; set; } = null;
        public string? ANEXO { get; set; } = null;
        public string? RTAFTO { get; set; } = null;
        public string? FTO { get; set; } = null;
        public string? NAMEFTO { get; set; } = null;
        public string? TPOFTO { get; set; } = null;
        public bool? PRMSO { get; set; } = null;
        public string? NCMPTO { get; set; } = null;
        public string? MARCA { get; set; } = null;
        public string? ROL { get; set; } = null;

    }
}
