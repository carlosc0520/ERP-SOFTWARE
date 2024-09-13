using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.MANTENIMIENTOS.GRUPODATO;

namespace CARO.DATOS.CONSULTAS.MANTENIMIENTOS
{
    public interface IConsultasGrupoDatoGD
    {
        Task<List<GrupoDatoGDModel>> Listar(GrupoDatoGDModel custom);
        Task<List<GrupoDatoDetalleGDModel>> ListarDetalle(GrupoDatoDetalleGDModel custom);

    }
    public class ConsultasGrupoDatoGD : IConsultasGrupoDatoGD
    {
        private readonly IConfiguration _configuration;

        public ConsultasGrupoDatoGD(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<GrupoDatoGDModel>> Listar(GrupoDatoGDModel custom)
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
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<GrupoDatoGDModel>(conexionSql, Procedimientos.MANTENIMIENTOS.GrupoDatoCrud, parametros);
        }
        public async Task<List<GrupoDatoDetalleGDModel>> ListarDetalle(GrupoDatoDetalleGDModel custom)
        {
            var parametros = new DynamicParameters();

            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                GDPDRE = custom.GDPDRE
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<GrupoDatoDetalleGDModel>(conexionSql, Procedimientos.MANTENIMIENTOS.GrupoDatoDetCrud, parametros);
        }

    }
}
