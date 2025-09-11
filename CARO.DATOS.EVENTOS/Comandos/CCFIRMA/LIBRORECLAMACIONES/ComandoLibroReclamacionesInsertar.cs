using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.CCFIRMA.LIBRORECLAMACIONES
{
    public class ComandoLibroReclamacionesInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDEMPRSA { get; set; } = null; 
        public string? DIDEMPRSA { get; set; } = null;
        public string? SEDE { get; set; } = null;
        public string? DIRECCION { get; set; } = null;

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
        public string? RUTAS { get; set; } = null;

        public DateTime? FECHARECL { get; set; } = null;
        public List<ArchivoConComentario> ARCHIVOS { get; set; }
        public IFormFile ARCHIVO { get; set; }

    }
    public class ArchivoConComentario
    {
        public IFormFile FILE { get; set; }
        public string? FILENAME { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;
    }

    public class LibroReclamoModel
    {
        public string? FECHA { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? ISQUEJA { get; set; } = null;
        public string? FECHAHOY { get; set; } = null;
        public string? CODIGO { get; set; } = null;
        public string? RESPONSABLE { get; set; } = null;
        public string? AREA { get; set; } = null;
        public string? CORREOCONTACTO { get; set; } = null;
        public string? CORREOCONTACTO2 { get; set; } = null;
        public string? CONTACTO { get; set; } = null;

    }
}
