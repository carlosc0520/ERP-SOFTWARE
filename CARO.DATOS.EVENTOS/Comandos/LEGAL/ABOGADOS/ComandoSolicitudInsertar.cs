using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS
{
    public class ComandoSolicitudInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? GDSUCRSLS { get; set; } = null;
        public string? GDATNCN { get; set; } = null;
        public string? NAME_TATENCION { get; set; } = null;
        public string? GDESPCLDD { get; set; } = null;
        public int? ABOGADO { get; set; } = null;
        public DateTime? FCHASERVICIO { get; set; } = null;
        public string? DATA_HORA { get; set; } = null;
        public string? NMBRES { get; set; } = null;
        public string? APLLDS { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? CELULAR { get; set; } = null;
        public string? COMENTARIOS { get; set; } = null;
        public List<IFormFile>? FILES { get; set; } = new List<IFormFile>();
        public string? RUTAS { get; set; } = null;

        public string? NAME_SUCURSAL { get; set; } = null;
        public string? NAME_DRCCN { get; set; } = null;
        public string? NAME_ABGDO { get; set; } = null;
        public string? NAME_ESPCDD { get; set; } = null;
        public string? NAME_HORA { get; set; } = null;

    }
}
