using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.CCFIRMA
{
    public class LibroReclamacionModel : EntidadAuditoria
    {
        public int? IDEMPRSA { get; set; } = null;
        public string? DIDEMPRSA { get; set; } = null;
        public string? SEDE { get; set; } = null;
        public string? DIRECCION { get; set; } = null;
        public string? CORREC { get; set; } = null;

        public string? MENOREDAD { get; set; } = null;
        public string? TDOCRECL { get; set; } = null;
        public string? NRODOCRECL { get; set; } = null;
        public string? NOMBREAPELLIDO1 { get; set; } = null;

        public string? TDOCRECL2 { get; set; } = null;
        public string? NRODOCRECL2 { get; set; } = null;
        public string? NOMBREAPELLIDO12 { get; set; } = null;

        public string? EMPRESA { get; set; } = null;
        public string? EMPRESARSOCIAL { get; set; } = null;
        public string? EMPRESATPODOC { get; set; } = null;
        public string? EMPRESANUMERO { get; set; } = null;
        public string? EMAILRECL { get; set; } = null;
        public string? TELEFONORECL { get; set; } = null;
        public string? DEPARTAMENTO { get; set; } = null;
        public string? PROVINCIA { get; set; } = null;
        public string? DISTRITO { get; set; } = null;
        public string? DIRECCIONRECL { get; set; } = null;
        public string? TIPOSERVICIO { get; set; } = null;
        public double? MONTORECLAMADO { get; set; } = null;
        public string? DETALLE { get; set; } = null;
        public string? TIPORECLAMO { get; set; } = null;
        public string? DETALLERECLAMO { get; set; } = null;
        public string? PEDIDO { get; set; } = null;
        public string? ARCHIVOS { get; set; } = null;
        public DateTime? FECHARECL { get; set; } = null;
        public string? USUARIO { get; set; } = null;
        public string? YEAR { get; set; } = null;
        public string? MESES { get; set; } = null;

    }

    public class AdobePdfConfig
    {
        public string CredentialsFilePath { get; set; }
    }

}
