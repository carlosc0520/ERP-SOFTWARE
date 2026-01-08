using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.MODELO.LEGAL.ABOGADOS;
using CARO.DATOS.MODELO.LEGAL.DOCUMENTOS;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.CONSULTAS.LEGAL
{
    public interface IConsultasAbogados
    {
        Task<List<AbogadosModel>> Listar(AbogadosModel custom);
        Task<List<HorariosModel>> ListarHorarios(HorariosModel custom);

    }
    public class ConsultasAbogados : IConsultasAbogados
    {
        private readonly IConfiguration _configuration;

        public ConsultasAbogados(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<AbogadosModel>> Listar(AbogadosModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                ID = custom.ID,
                GDESPCLDD = custom.GDESPCLDD,
                GDSCRSLS  = custom.GDSCRSLS
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<AbogadosModel>(conexionSql, Procedimientos.LEGAL.CrudAbogados, parametros);
        }

        public async Task<List<HorariosModel>> ListarHorarios(HorariosModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDABGDO = custom.IDABGDO,
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<HorariosModel>(conexionSql, Procedimientos.LEGAL.CrudHorarios, parametros);
        }
    }
}
