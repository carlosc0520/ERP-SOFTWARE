using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.COM.PLANTILLA;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasPlantilla
    {
        Task<List<PlantillaModel>> Listar(PlantillaModel custom);

    }
    public class ConsultasPlantilla : IConsultasPlantilla
    {
        private readonly IConfiguration _configuration;

        public ConsultasPlantilla(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<PlantillaModel>> Listar(PlantillaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDMRCA = custom.IDMRCA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<PlantillaModel>(conexionSql, Procedimientos.COMERCIAL.PlantillaCrud, parametros);
        }

    }
}
