using CARO.CORE.Structs;
using CARO.DATOS.MODELO.COM.CONTACTO;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO
{
    public class ComandoCorreoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? ASNTO { get; set; } = null;
        public List<string> CNTCTS { get; set; }
        public string? MSJE { get; set; } = null;
        public IFormFile? FILE { get; set; } = null;
        public string? ADJUNTOS { get; set; } = null;
        public string? MENSAJE { get; set; } = null;
        public List<ContactosDataModel>? CONTACTOS_DATA { get; set; } = null;
        public DateTime? FPROGRAMADA { get; set; } = null;
        public List<AdjuntosCorreoModel>? DATA { get; set; } = null;
        public string? CORREOSEND { get; set; } = null;
        public string? PLACEHOLDER { get; set; } = null;

    }

    public class AdjuntosCorreoModel
    {
        public string? INDEX { get; set; } = null;
        public string? TYPE { get; set; } = null;
        public string? URL { get; set; } = null;
        public string? TEXT { get; set; } = null;
        public string? URLIMG { get; set; } = null;
        public string? URIIMG { get; set; } = null; // 👈 URL pública completa (para HTML)
        public IFormFile? FILE { get; set; } = null;
    }

    public class ContactosDataModel
    {
        public string? V_EMAIL { get; set; } = null;
        public string? V_NOMBRES { get; set; } = null;
        public string? V_NOMBRE { get; set; } = null;
        public string? V_APELLIDO { get; set; } = null;
        public string? V_CLIENTE { get; set; } = null;
        public string? V_GDSEXO { get; set; } = null;

    }

}
