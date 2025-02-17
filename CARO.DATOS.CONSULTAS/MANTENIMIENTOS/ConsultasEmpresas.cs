using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.MANTENIMIENTOS.EMPRESAS;

namespace CARO.DATOS.CONSULTAS.MANTENIMIENTOS
{
    public interface IConsultasEmpresas
    {
        Task<List<EmpresasModel>> Listar(EmpresasModel custom);

    }
    public class ConsultasEmpresas : IConsultasEmpresas
    {
        private readonly IConfiguration _configuration;

        public ConsultasEmpresas(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<EmpresasModel>> Listar(EmpresasModel custom)
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
            return await FuncionesSql.EjecutarProcedimiento<EmpresasModel>(conexionSql, Procedimientos.MANTENIMIENTOS.EmpreasCrud, parametros);
        }


    }
}
