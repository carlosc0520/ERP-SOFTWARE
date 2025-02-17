using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.LEGAL.ABOGADOS
{
    internal class ControladorEventosHorarioEliminar : IRequestHandler<ComandoHorariosEliminar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosHorarioEliminar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoHorariosEliminar entidad, CancellationToken cancellationToken)
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
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.LEGAL.CrudHorarios, parametros);
        }
    }
}
