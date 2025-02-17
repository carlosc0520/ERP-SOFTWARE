using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA;

namespace CARO.DATOS.EVENTOS.MARKETING.ASISTENCIA
{
    public class ControladorEventoCalendarioEliminar : IRequestHandler<ComandoCalendarioEliminar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoCalendarioEliminar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoCalendarioEliminar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 2);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MARKETING.CrudCalendario, parametros);
        }
    }
}
