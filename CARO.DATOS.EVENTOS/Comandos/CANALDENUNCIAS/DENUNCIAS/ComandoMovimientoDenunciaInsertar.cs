using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS
{
    public class ComandoMovimientoDenunciaInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDUSER { get; set; } = null;
        public int? IDDENUNCIA { get; set; } = null;
        public int? IDREP { get; set; } = null;
        public int? INDIC { get; set; } = null;
        public int? IDTPODENUNCIA { get; set; } = null;
        public string? ACCION { get; set; } = null;
        public string? COMENTARIO { get; set; } = null;
        public bool? ACTUAL { get; set; } = null;
        public string? GDDENUNCIA { get; set; } = null;
        public int? DSFSINVSTGDR { get; set; } = null;
        public int? DSFSDCSR { get; set; } = null;
        public int? DSFSCRRE { get; set; } = null;
        public List<IFormFile>? FILES { get; set; } = new List<IFormFile>();
        public string? RUTA { get; set; } = null;
        public string? DIDTPODENUNCIA { get; set; } = null;
        public string? CORREOREP { get; set; } = null;
        public string? NOMBREREP { get; set; } = null;
    }
}
