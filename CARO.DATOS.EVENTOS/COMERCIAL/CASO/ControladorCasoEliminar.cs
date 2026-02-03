using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CASO;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CASO
{
    public class ControladorCasoEliminar : IRequestHandler<ComandoCasoEliminar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorCasoEliminar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoCasoEliminar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 2);
            parametros.Add("@p_nId", entidad.ID, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery(conexionSql, Procedimientos.COMERCIAL.CasoMasivosCrud, parametros);
        }
    }
}
