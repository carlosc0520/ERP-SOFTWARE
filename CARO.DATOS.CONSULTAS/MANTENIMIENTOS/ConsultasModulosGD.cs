using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.MANTENIMIENTOS.MODULOS;
using CARO.DATOS.MODELO.MANTENIMIENTOS.GRUPODATO;

namespace CARO.DATOS.CONSULTAS.MANTENIMIENTOS
{
    public interface IConsultasModulosGD
    {
        Task<List<ModulosModel>> Listar(ModulosModel custom);
        Task<List<SubModulosModel>> ListarSubModulos(SubModulosModel custom);
        Task<List<SubModulosDetModel>> ListarDetSubModulos(SubModulosDetModel custom);

    }
    public class ConsultasModulosGD : IConsultasModulosGD
    {
        private readonly IConfiguration _configuration;

        public ConsultasModulosGD(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<ModulosModel>> Listar(ModulosModel custom)
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
            return await FuncionesSql.EjecutarProcedimiento<ModulosModel>(conexionSql, Procedimientos.MANTENIMIENTOS.ModulosCrud, parametros);
        }
        public async Task<List<SubModulosModel>> ListarSubModulos(SubModulosModel custom)
        {
            var parametros = new DynamicParameters();

            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDMDLO = custom.IDMDLO
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<SubModulosModel>(conexionSql, Procedimientos.MANTENIMIENTOS.SubModulosCrud, parametros);
        }
        public async Task<List<SubModulosDetModel>> ListarDetSubModulos(SubModulosDetModel custom)
        {
            var parametros = new DynamicParameters();

            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDSUBMDLO = custom.IDSUBMDLO
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<SubModulosDetModel>(conexionSql, Procedimientos.MANTENIMIENTOS.DetSubModulosCrud, parametros);
        }

    }
}

