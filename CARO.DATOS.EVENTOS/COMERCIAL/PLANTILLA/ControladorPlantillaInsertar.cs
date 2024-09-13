using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA;

namespace CARO.DATOS.EVENTOS.COMERCIAL.PLANTILLA
{
    public class ControladorPlantillaInsertar : IRequestHandler<ComandoPlantillaInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorPlantillaInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoPlantillaInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDMRCA = entidad.IDMRCA,
                DSCRPCN = entidad.DSCRPCN,
                DTLLE = entidad.DTLLE,
                GDTPODCMNTO = entidad.GDTPODCMNTO,
                RTAPLNTLLA = entidad.RTAPLNTLLA,
                RTA = entidad.RTA,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.PlantillaCrud, parametros);
        }
    }
}
