using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.GESTION.CASO
{
    public class ControladorCasoInsertar : IRequestHandler<ComandoCasoInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorCasoInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoCasoInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRSA = entidad.IDEMPRSA,
                CASO = entidad.CASO,
                IDCLIENTE = entidad.IDCLIENTE,
                IDEQPO = entidad.IDEQPO,
                ABOGDOS = entidad.ABOGDOS,
                GDAREACSO = entidad.GDAREACSO,
                GDESTDOPRCSL = entidad.GDESTDOPRCSL,
                HONORARIOS = entidad.HONORARIOS,
                COMENTARIOS = entidad.COMENTARIOS,
                GDRSLTDOCSO = entidad.GDRSLTDOCSO,
                GDACCNSCMRCLS = entidad.GDACCNSCMRCLS,
                CMNTRS = entidad.CMNTRS,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery(conexionSql, Procedimientos.COMERCIAL.CasosCrud, parametros);
        }
    }
}
