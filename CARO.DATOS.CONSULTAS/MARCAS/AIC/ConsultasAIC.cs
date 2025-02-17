using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.MARCAS.AIC;

namespace CARO.DATOS.CONSULTAS.MARCAS.AIC
{
    public interface IConsultasAIC
    {
        Task<CursosModelAIC> CourseFistTop(CursosModelAIC custom);
        Task<List<TeachesModelAIC>> Teachers(TeachesModelAIC custom);
        Task<List<SponsorsModelAIC>> Auspiciadores(SponsorsModelAIC custom);
        Task<List<CursosModelAIC>> CoursesAll(CursosModelAIC custom);
    }
    public class ConsultasAIC : IConsultasAIC
    {
        private readonly IConfiguration _configuration;

        public ConsultasAIC(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<CursosModelAIC> CourseFistTop(CursosModelAIC custom)
        {
            var parametros = new DynamicParameters();

            var json = JsonSerializer.Serialize(new {}).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoFirst<CursosModelAIC>(conexionSql, Procedimientos.MARCAS.CrudMarcasAIC, parametros);
        }
        public async Task<List<TeachesModelAIC>> Teachers(TeachesModelAIC custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new {
                IDCRSO = custom.IDCRSO
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 2);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<TeachesModelAIC>(conexionSql, Procedimientos.MARCAS.CrudMarcasAIC, parametros);
        }
        public async Task<List<SponsorsModelAIC>> Auspiciadores(SponsorsModelAIC custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new {
                IDCRSO = custom.IDCRSO
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 3);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<SponsorsModelAIC>(conexionSql, Procedimientos.MARCAS.CrudMarcasAIC, parametros);
        }
        public async Task<List<CursosModelAIC>> CoursesAll(CursosModelAIC custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = custom.ID,
                DSCRPCN = custom.DSCRPCN
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<CursosModelAIC>(conexionSql, Procedimientos.MARCAS.CrudMarcasAIC, parametros);
        }



    }
}
