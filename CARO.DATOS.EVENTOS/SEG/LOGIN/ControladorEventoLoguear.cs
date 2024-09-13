using CARO.CONFIG;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.SEG.LOGIN;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CARO.DATOS.MODELO.SEG.LOGIN;

namespace CARO.DATOS.EVENTOS.SEG.LOGIN
{
    public class ControladorEventoLoguear : IRequestHandler<ComandoLoguearUsuario, IdentityAccess>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoLoguear(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<IdentityAccess> Handle(ComandoLoguearUsuario notification, CancellationToken cancellationToken)
        {
            var param = new DynamicParameters();
            param.Add("@USRIO", notification.CORREO);
            param.Add("@EML", notification.CORREO);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");

            var usuario = await FuncionesSql.ObtenerPrimerRegistro<UsuarioModel>(conexionSql, Procedimientos.SEGURIDAD.LoginCrud, param);
            var result = new IdentityAccess();

            if (usuario.Entidad != null && usuario.EsSatisfactoria)
            {
                var response = LeerEncriptada(notification.PASSWORD, usuario.Entidad.PASSWORD);

                if (response && usuario.Entidad.CESTDO == "A")
                {
                    await GenerateToken(usuario.Entidad, result);
                    result.Succeeded = true;
                }
                else
                {
                    result.Succeeded = false;
                    result.ErrorMessage = "Contraseña incorrecta.";
                }

                return result;
    
            }
            else
            {
                result.Succeeded = false;
                result.ErrorMessage = "ACCESO DENEGADO: Usuario no existe";

                return result;
            }

 
        }
        public bool LeerEncriptada(string enteredPassword, string storedHash)
        {
            byte[] hashBytes = Convert.FromBase64String(storedHash);
            byte[] salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);

            using (var pbkdf2 = new Rfc2898DeriveBytes(enteredPassword, salt, 10000, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(32);
                for (int i = 0; i < 32; i++)
                {
                    if (hashBytes[i + 16] != hash[i])
                    {
                        return false; 
                    }
                }
            }

            return true; 
        }


        private async Task GenerateToken(UsuarioModel user, IdentityAccess identity)
        {
            var secretKey = ConfiguracionProyecto.CAPTCHA.SecretKey;
            var key = Encoding.ASCII.GetBytes(secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
                new Claim(ClaimTypes.Name, user.CORREO),
                new Claim(ClaimTypes.Surname, user.NYAPLLDS),
                new Claim("IDMRCA", user.IDMRCA.ToString()),
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var createdToken = tokenHandler.CreateToken(tokenDescriptor);
            identity.AccessToken = tokenHandler.WriteToken(createdToken);
        }
    }
}
