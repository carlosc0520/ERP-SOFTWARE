using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CURSO;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CURSO
{
    public class ControladorCursoEditar : IRequestHandler<ComandoCursoEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorCursoEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoCursoEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDMRCA = entidad.IDMRCA,
                DSCRPCN = entidad.DSCRPCN,
                DTLLE = entidad.DTLLE,
                FINI = entidad.FINI,
                FFIN = entidad.FFIN,
                GDCTGCRSO = entidad.GDCTGCRSO,
                RTAIMG = entidad.RTAIMG,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.CursoCrud, parametros);
        }
    }
}
