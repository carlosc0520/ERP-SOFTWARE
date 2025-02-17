using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS;

namespace CARO.DATOS.EVENTOS.LEGAL.ABOGADOS
{
    public class ControladorEventosAbogadoEliminar : IRequestHandler<ComandoAbogadoEliminar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosAbogadoEliminar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoAbogadoEliminar entidad, CancellationToken cancellationToken)
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
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.LEGAL.CrudAbogados, parametros);
        }
    }
}
