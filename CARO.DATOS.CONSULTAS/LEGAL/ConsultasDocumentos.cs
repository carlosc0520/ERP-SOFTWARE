using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.LEGAL.DOCUMENTOS;

namespace CARO.DATOS.CONSULTAS.LEGAL
{
    public interface IConsultasDocumentos
    {
        Task<List<DocumentosModel>> Listar(DocumentosModel custom);
        Task<DocumentosModel> Obtener(DocumentosModel custom);

    }
    public class ConsultasDocumentos : IConsultasDocumentos
    {
        private readonly IConfiguration _configuration;

        public ConsultasDocumentos(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<DocumentosModel>> Listar(DocumentosModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDUSR = custom.IDUSR,
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<DocumentosModel>(conexionSql, Procedimientos.LEGAL.CrudDocumentos, parametros);
        }
        public async Task<DocumentosModel> Obtener(DocumentosModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID  = custom.ID,
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            var result = await FuncionesSql.EjecutarProcedimiento<DocumentosModel>(conexionSql, Procedimientos.LEGAL.CrudDocumentos, parametros);
            return result.FirstOrDefault();
        }

    }
}
