using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.USUARIOS.PERSONAS;

namespace CARO.DATOS.CONSULTAS.USUARIOS
{
    public interface IConsultasPersonas
    {
        Task<List<PersonaModel>> Listar(PersonaModel custom);

    }
    public class ConsultasPersonas : IConsultasPersonas
    {
        private readonly IConfiguration _configuration;

        public ConsultasPersonas(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<PersonaModel>> Listar(PersonaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<PersonaModel>(conexionSql, Procedimientos.USUARIO.PersonasCrud, parametros);
        }

       
    }
}
