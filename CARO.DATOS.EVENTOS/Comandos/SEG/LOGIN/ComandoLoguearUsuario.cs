using MediatR;
using System.ComponentModel.DataAnnotations;

namespace CARO.DATOS.EVENTOS.Comandos.SEG.LOGIN
{
    public class ComandoLoguearUsuario : IRequest<IdentityAccess>
    {
        [Required]
        public string CORREO { get; set; }
        [Required]
        public string PASSWORD { get; set; }
    }

    public class IdentityAccess
    {
        public bool Succeeded { get; set; }
        public string AccessToken { get; set; }
        public string? AccessRecovery { get; set; } = null;
        public string ErrorMessage { get; set; }
        public bool CambiarContrasena { get; set; }
    }
}
