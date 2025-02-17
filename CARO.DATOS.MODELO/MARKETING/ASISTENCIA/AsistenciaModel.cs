using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.MARKETING.ASISTENCIA
{
    public class AsistenciaModel : EntidadAuditoria
    {
        public int? IDCRSO { get; set; } = null;
        public string? DSCRPCN { get; set; } = null;
        public DateTime? FINI { get; set; } = null;
        public DateTime? FFIN { get; set; } = null;
        public string? PRFESRS { get; set; } = null;
    }

    public class ParticipantesModel : EntidadAuditoria
    {
        public int? IDEVENTO { get; set; } = null;
        public string? CODIGO { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? APELLIDOS { get; set; } = null;
        public string? DNI { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public bool? REGISTRADO { get; set; } = null;
        public string? RTAPDF { get; set; } = null;
        public double? EJEX { get; set; } = null;
        public double? EJEY { get; set; } = null;
        public int? IND { get; set; } = null;
        public float? EJEX2 { get; set; } = null;
        public float? EJEY2 { get; set; } = null;
        public string? REGISTROS { get; set; } = null;
    }

    public class AsistenciaFechaModel : EntidadAuditoria
    {
        public int? IDCRSO { get; set; } = null;
        public int? IDPRTCPNTE { get; set; } = null;
        public DateTime? FINGRESO { get; set; } = null;
        public DateTime? FSALIDA { get; set; } = null;
        public DateTime? FCHA { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? APELLIDOS { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? DNI { get; set; } = null;
        public string? REGISTROS { get; set; } = null;

    }
}
