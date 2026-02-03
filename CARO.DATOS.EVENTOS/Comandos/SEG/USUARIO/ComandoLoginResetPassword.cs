using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.SEG.USUARIO
{
    public class ComandoLoginResetPassword : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? PASSWORD_OLD { get; set; } = null; 
        public string? PASSWORD_NEW { get; set; } = null;
        public string? CORREO { get; set; } = null;

    }
}

