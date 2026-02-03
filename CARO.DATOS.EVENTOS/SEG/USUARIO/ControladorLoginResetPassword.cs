using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.SEG.USUARIO;
using CARO.DATOS.MODELO.SEG.LOGIN;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace CARO.DATOS.EVENTOS.SEG.USUARIO
{
    public class ControladorLoginResetPassword : IRequestHandler<ComandoLoginResetPassword, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorLoginResetPassword(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoLoginResetPassword comando, CancellationToken cancellationToken)
        {
            var param = new DynamicParameters();
            param.Add("@USRIO", comando.CORREO);
            param.Add("@EML", comando.CORREO);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            var usuario = await FuncionesSql.ObtenerPrimerRegistro<UsuarioModel>(conexionSql, Procedimientos.SEGURIDAD.LoginCrud, param);

            if (LeerEncriptada(comando.PASSWORD_OLD, usuario.Entidad!.PASSWORD))
            {
                comando.PASSWORD_NEW = await HashPassword(comando.PASSWORD_NEW?.Trim());

                var paramUpdate = new DynamicParameters();
                paramUpdate.Add("@p_nId", comando.ID);
                paramUpdate.Add("@PASSWORD", comando.PASSWORD_NEW);

                return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.SEGURIDAD.ResetLogin, paramUpdate);
            }
            else
            {
                return new RespuestaConsulta
                {
                    CodEstado = -1,
                    message = "La contraseña actual es incorrecta."
                };
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

        public async Task<string> HashPassword(string password)
        {
            byte[] salt = new byte[16];

            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(32);

                byte[] hashBytes = new byte[48];
                Array.Copy(salt, 0, hashBytes, 0, 16);
                Array.Copy(hash, 0, hashBytes, 16, 32);
                return Convert.ToBase64String(hashBytes);
            }
        }
    }
}
