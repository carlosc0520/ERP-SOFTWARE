using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.MODELO.CANALDENUNCIAS;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using DocumentFormat.OpenXml.Spreadsheet;

namespace CARO.DATOS.CONSULTAS.CANALDENUNCIAS
{
    public interface IConsultasDenuncias
    {
        Task<List<DenunciaModel>> ListarDenuncias(DenunciaModel custom);
        Task<List<DenunciaModel>> ListarDenunciasFind(DenunciaModel custom);
        Task<ValidateDenunciaModel> FindDenuncia(ValidateDenunciaModel custom);
        Task<DenunciaModel> ObtenerDataEmail(int IDDENUNCIA);
        Task<List<ChatDenunciaModel>> ChatDenuncia(ChatDenunciaModel custom);
        Task<List<MovimientoDenunciaModel>> MovimientosDenuncia(MovimientoDenunciaModel custom);

    }
    public class ConsultasDenuncias : IConsultasDenuncias
    {
        private readonly IConfiguration _configuration;

        public ConsultasDenuncias(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<DenunciaModel>> ListarDenuncias(DenunciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRESA = custom.IDEMPRESA,
                IDRECEPTOR = custom.IDRECEPTOR
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<DenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudDenuncias, parametros);
        }
        public async Task<DenunciaModel> ObtenerDataEmail(int IDDENUNCIA)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = "",
                CESTDO = "",
                INIT = 0,
                ROWS = 1
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 7);
            parametros.Add("@p_nId", IDDENUNCIA);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            var data = await FuncionesSql.EjecutarProcedimiento<DenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudDenuncias, parametros);
            return data.FirstOrDefault();
        }
        public async Task<List<DenunciaModel>> ListarDenunciasFind(DenunciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRESA = custom.IDEMPRESA,
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 6);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<DenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudDenuncias, parametros);
        }
        public async Task<ValidateDenunciaModel> FindDenuncia(ValidateDenunciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = 0,
                ROWS = 1,
                CODIGO = custom.CODIGO,
                ID = custom.ID,
                CONTRASENA = custom.CONTRASENA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            var result = await FuncionesSql.EjecutarProcedimiento<ValidateDenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudDenuncias, parametros);
            return result.FirstOrDefault();
        }
        public async Task<List<ChatDenunciaModel>> ChatDenuncia(ChatDenunciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDDENUNCIA = custom.IDDENUNCIA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<ChatDenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudChatDenuncia, parametros);
        }
        public async Task<List<MovimientoDenunciaModel>> MovimientosDenuncia(MovimientoDenunciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDDENUNCIA = custom.IDDENUNCIA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<MovimientoDenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudMovimientosDenuncia, parametros);
        }


    }
}
