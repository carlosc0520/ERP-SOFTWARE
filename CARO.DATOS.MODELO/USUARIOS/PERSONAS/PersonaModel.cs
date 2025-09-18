using CARO.ENTIDAD.Modelo.Auditoria;
using Microsoft.AspNetCore.Http;

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
        public int? IDEMPRESA { get; set; } = null;
        public string? TELFNO { get; set; } = null;
        public string? DEPARTAMENTO { get; set; } = null;
        public string? PROVINCIA { get; set; } = null;
        public string? DISTRITO { get; set; } = null;
        public string? DIRECCION { get; set; } = null;
        public string? CARGO { get; set; } = null;
        public string? RESENA { get; set; } = null;
        public string? REDES { get; set; } = null;
        public string? WEBPAGE { get; set; } = null;
        public string? RTAFTO2 { get; set; } = null;
        public string? RTAFTOEMP { get; set; } = null;

    }
}
