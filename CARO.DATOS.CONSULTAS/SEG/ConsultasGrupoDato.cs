using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.SEG.GRUPODATO;

namespace CARO.DATOS.CONSULTAS.SEG
{
    public interface IConsultasGrupoDato
    {
        Task<List<GrupoDatoModel>> ObtenerAll(GrupoDatoModel custom);

    }
    public class ConsultasGrupoDato : IConsultasGrupoDato
    {
        private readonly IConfiguration _configuration;

        public ConsultasGrupoDato(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<GrupoDatoModel>> ObtenerAll(GrupoDatoModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                GDTOS = custom.GDTOS
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<GrupoDatoModel>(conexionSql, Procedimientos.SEGURIDAD.GrupoDatoCrud, parametros);
        }

    }
}
