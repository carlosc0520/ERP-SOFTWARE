using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.SEG.MODULOS;

namespace CARO.DATOS.CONSULTAS.SEG
{
    public interface IConsultasModulo
    {
        Task<List<ModuloModel>> Listar(ModuloModel custom);

    }
    public class ConsultasModulo : IConsultasModulo
    {
        private readonly IConfiguration _configuration;

        public ConsultasModulo(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<ModuloModel>> Listar(ModuloModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDMRCA = custom.IDMRCA,
                ID = custom.ID
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<ModuloModel>(conexionSql, Procedimientos.SEGURIDAD.ModulosCrud, parametros);
        }

    }
}
