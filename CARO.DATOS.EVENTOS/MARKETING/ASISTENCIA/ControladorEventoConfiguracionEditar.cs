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
    public class ControladorEventoConfiguracionEditar : IRequestHandler<ComandoEditarConfiguracion, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoConfiguracionEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoEditarConfiguracion entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDCRSO = entidad.IDCRSO,
                EJEX = entidad.EJEX,
                EJEY = entidad.EJEY,
                EJEX2 = entidad.EJEX2,
                EJEY2 = entidad.EJEY2,
                RTAFTO = entidad.RTAFTO,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.CursoCrud, parametros);
        }
    }
}
