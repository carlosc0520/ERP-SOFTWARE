using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.MODELO.COM.CASO;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasCasosMasivos
    {
        Task<List<CasoModel>> ListarCasos(CasoModel custom);
    }
    public class ConsultasCasosMasivos : IConsultasCasosMasivos
    {
        private readonly IConfiguration _configuration;

        public ConsultasCasosMasivos(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<List<CasoModel>> ListarCasos(CasoModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRSA = custom.IDEMPRSA,
                CASO = custom.CASO,
                IDCLNTE = custom.IDCLNTE,
                ABOGDOS = custom.ABOGDOS,
                GDSMFROCSO = custom.GDSMFROCSO,
                GDESTDOCSO = custom.GDESTDOCSO,
                FINI = custom.FINI,
                FFIN = custom.FFIN
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery<CasoModel>(conexionSql, Procedimientos.COMERCIAL.CasoMasivosCrud, parametros);
        }

    }
}
