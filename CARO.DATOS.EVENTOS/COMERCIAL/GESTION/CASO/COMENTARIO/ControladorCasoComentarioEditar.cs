using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CASOS.COMENTARIO;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.GESTION.CASO.COMENTARIO
{
    public class ControladorCasoComentarioEditar : IRequestHandler<ComandoCasoComentarioEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorCasoComentarioEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoCasoComentarioEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDCASO = entidad.IDCASO,
                NMBRE = entidad.NMBRE,
                URLHNRRIO = entidad.URLHNRRIO,
                TIPO = entidad.TIPO,
                COMNTRS = entidad.COMNTRS,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 6);
            parametros.Add("@p_nId", entidad.ID, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery(conexionSql, Procedimientos.COMERCIAL.CasosCrud, parametros);
        }
    }
}
