using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.MODELO.COM.GESTION;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasCasos
    {
        Task<List<CasosModel>> ListarCasos(CasosModel custom);
        Task<List<HistoryModel>> ListarCasosHistory(HistoryModel custom);
        Task<List<ComentarioModel>> ListarComentariosXCasos(ComentarioModel custom);
        Task<List<HonorarioModel>> ListarHonorariosXCasos(HonorarioModel custom);
        Task<List<ClienteModel>> ListarClientesXCasos(ClienteModel custom);
        Task<List<ContactoModel>> ListarContactoXClientesXCasos(ContactoModel custom);
        Task<List<EquipoModel>> ListarEquiposXCasos(EquipoModel custom);

    }
    public class ConsultasCasos : IConsultasCasos
    {
        private readonly IConfiguration _configuration;

        public ConsultasCasos(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<List<CasosModel>> ListarCasos(CasosModel custom)
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
                IDCLENTE = custom.IDCLENTE,
                IDEQPO = custom.IDEQPO,
                GDAREACSO = custom.GDAREACSO,
                GDESTDOPRCSL = custom.GDESTDOPRCSL,
                GDRSLTDOCSO = custom.GDRSLTDOCSO,
                GDACCNSCMRCLS = custom.GDACCNSCMRCLS,
                ABOGDOS = custom.ABOGDOS
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery<CasosModel>(conexionSql, Procedimientos.COMERCIAL.CasosCrud, parametros);
        }

        public async Task<List<HistoryModel>> ListarCasosHistory(HistoryModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDCASO = custom.IDCASO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery<HistoryModel>(conexionSql, Procedimientos.COMERCIAL.CasosHistoryCrud, parametros);
        }
        public async Task<List<ComentarioModel>> ListarComentariosXCasos(ComentarioModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDCASO = custom.IDCASO,
                TIPO = 2
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", custom.ID ?? 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery<ComentarioModel>(conexionSql, Procedimientos.COMERCIAL.CasosCrud, parametros);
        }
        public async Task<List<HonorarioModel>> ListarHonorariosXCasos(HonorarioModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDCASO = custom.IDCASO,
                TIPO = 1
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", custom.ID ?? 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery<HonorarioModel>(conexionSql, Procedimientos.COMERCIAL.CasosCrud, parametros);
        }
        public async Task<List<ClienteModel>> ListarClientesXCasos(ClienteModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRSA = custom.IDEMPRSA,
                RUC = custom.RUC,
                RZNSCL = custom.RZNSCL,
                RPRSNTNTE = custom.RPRSNTNTE,
                GDTMPOEMPRESA = custom.GDTMPOEMPRESA,
                GDTIPOPRSNA = custom.GDTIPOPRSNA,
                GDSCTRINDSTRIA = custom.GDSCTRINDSTRIA
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery<ClienteModel>(conexionSql, Procedimientos.COMERCIAL.ClienteXCasoCrud, parametros);
        }
        public async Task<List<ContactoModel>> ListarContactoXClientesXCasos(ContactoModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRSA = custom.IDEMPRSA,
                IDCLNTE = custom.IDCLNTE
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery<ContactoModel>(conexionSql, Procedimientos.COMERCIAL.ContactoXClienteXCasoCrud, parametros);
        }
        public async Task<List<EquipoModel>> ListarEquiposXCasos(EquipoModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRSA = custom.IDEMPRSA,
                NMBREEQUPO = custom.NMBREEQUPO,
                ABOGDOS = custom.ABOGDOS
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery<EquipoModel>(conexionSql, Procedimientos.COMERCIAL.EquiposXCasoCrud, parametros);
        }
    }
}
