using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.SEG.MARCA;

namespace CARO.DATOS.CONSULTAS.SEG
{
    public interface IConsultasMarca
    {
        Task<List<MarcaModel>> Obtener(MarcaModel custom);

    }

    public class ConsultasMarca : IConsultasMarca
    {
        private readonly IConfiguration _configuration;

        public ConsultasMarca(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<MarcaModel>> Obtener(MarcaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                //IDMRCA = custom.IDMRCA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<MarcaModel>(conexionSql, Procedimientos.SEGURIDAD.MarcasCrud, parametros);
        }

    }
}
