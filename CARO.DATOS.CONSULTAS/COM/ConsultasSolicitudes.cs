using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.COM.SOLICITUD;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasSolicitudes
    {
        Task<List<SolicitudModel>> Listar(SolicitudModel custom);
    }
    public class ConsultasSolicitudes : IConsultasSolicitudes
    {
        private readonly IConfiguration _configuration;

        public ConsultasSolicitudes(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<SolicitudModel>> Listar(SolicitudModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = custom.ID,
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT ?? 0,
                ROWS = custom.ROWS ?? 10000,
                FCHA = custom.FCHA,
                NMBRES = custom.NMBRES,
                ABOGADO = custom.ABOGADO,
                GDSUCRSLS = custom.GDSUCRSLS,
                GDESPCLDD = custom.GDESPCLDD
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<SolicitudModel>(conexionSql, Procedimientos.LEGAL.CrudSolicitudes, parametros);
        }

    }
}
