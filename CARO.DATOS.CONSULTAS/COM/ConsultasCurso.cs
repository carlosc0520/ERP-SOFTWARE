using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.COM.CURSO;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasCurso
    {
        Task<List<CursoModel>> Listar(CursoModel custom);
        Task<List<CursoModel>> ListarDetalleCurso(CursoModel custom);

    }
    public class ConsultasCurso : IConsultasCurso
    {
        private readonly IConfiguration _configuration;

        public ConsultasCurso(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<CursoModel>> Listar(CursoModel custom)
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
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<CursoModel>(conexionSql, Procedimientos.COMERCIAL.CursoCrud, parametros);
        }
        public async Task<List<CursoModel>> ListarDetalleCurso(CursoModel custom)
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
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<CursoModel>(conexionSql, Procedimientos.COMERCIAL.DetalleCursoCrud, parametros);
        }

    }
}