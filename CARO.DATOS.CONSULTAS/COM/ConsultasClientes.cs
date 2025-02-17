using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.MODELO.COM.CLIENTE;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasClientes
    {
        Task<List<ClienteModel>> Listar(ClienteModel custom);
        Task<List<SeguimientoClienteModel>> ListarDetalle(SeguimientoClienteModel custom);
        Task<List<ReporteSeguimientoModel>> ListarReporte(ReporteSeguimientoModel custom);
    }
    public class ConsultasClientes : IConsultasClientes
    {
        private readonly IConfiguration _configuration;

        public ConsultasClientes(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<ClienteModel>> Listar(ClienteModel custom)
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
            return await FuncionesSql.EjecutarProcedimiento<ClienteModel>(conexionSql, Procedimientos.COMERCIAL.ClienteCrud, parametros);
        }
        public async Task<List<SeguimientoClienteModel>> ListarDetalle(SeguimientoClienteModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                IDCLIENTE = custom.IDCLIENTE,
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
            return await FuncionesSql.EjecutarProcedimiento<SeguimientoClienteModel>(conexionSql, Procedimientos.COMERCIAL.SeguimientoCrud, parametros);
        }

        public async Task<List<ReporteSeguimientoModel>> ListarReporte(ReporteSeguimientoModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                IDMRCA = custom.IDMRCA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<ReporteSeguimientoModel>(conexionSql, Procedimientos.COMERCIAL.ClienteCrud, parametros);
        }
    }
}
