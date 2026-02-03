using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CLIENTE;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.GESTION
{
    public class ControladorClienteXCasoInsertar : IRequestHandler<ComandoClienteXCasoInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorClienteXCasoInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoClienteXCasoInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRSA = entidad.IDEMPRSA,
                RUC = entidad.RUC,
                RZNSCL = entidad.RZNSCL,
                RPRSNTNTE = entidad.RPRSNTNTE,
                DRCCN = entidad.DRCCN,
                TLFNO = entidad.TLFNO,
                GDTIPOPRSNA = entidad.GDTIPOPRSNA,
                GDTMPOEMPRESA = entidad.GDTMPOEMPRESA,
                GDSCTRINDSTRIA = entidad.GDSCTRINDSTRIA,
                CDSDE = entidad.CDSDE,
                CRREO = entidad.CRREO,
                GDEMPRSA = entidad.GDEMPRSA,
                NMBRECMRCL = entidad.NMBRECMRCL,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery(conexionSql, Procedimientos.COMERCIAL.ClienteXCasoCrud, parametros);
        }
    }
}
