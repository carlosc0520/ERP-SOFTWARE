using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Data;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.EQUIPO;

namespace CARO.DATOS.EVENTOS.COMERCIAL.GESTION.EQUIPO
{
    public class ControladorEquipoXCasoInsertar : IRequestHandler<ComandoEquipoXCasoInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEquipoXCasoInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoEquipoXCasoInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRSA = entidad.IDEMPRSA,
                NMBREEQUPO = entidad.NMBREEQUPO,
                ABOGDOS = entidad.ABOGDOS,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery(conexionSql, Procedimientos.COMERCIAL.EquiposXCasoCrud, parametros);
        }
    }
}
