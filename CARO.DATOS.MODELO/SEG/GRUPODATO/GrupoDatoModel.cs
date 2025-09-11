using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.SEG.GRUPODATO
{
    public class GrupoDatoModel : EntidadAuditoria
    { 
        public string? GDPDRE { get; set; } = null;
        public string? GDTOS { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public string? VLR1 { get; set; } = null;
        public string? VLR2 { get; set; } = null;
        public string? VLR3 { get; set; } = null;
        public string? VLR4 { get; set; } = null;
    }

    public class FUbigeos
    {
        public int? IND { get; set; } = null;
        public string? DDPRTMNTO { get; set; } = null;
        public string? DPRVNCA { get; set; } = null;
        public string? VALUE { get; set; } = null;
        public string? LABEL { get; set; } = null;

    }
}
