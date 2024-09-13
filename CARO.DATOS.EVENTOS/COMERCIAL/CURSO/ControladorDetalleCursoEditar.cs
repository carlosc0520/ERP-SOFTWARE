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
    public class ControladorDetalleCursoEditar : IRequestHandler<ComandoDetalleCursoEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorDetalleCursoEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoDetalleCursoEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDCRSO = entidad.IDCRSO,
                RTAIMG = entidad.RTAIMG,
                DSCRPCN = entidad.DSCRPCN,
                OBJETVS = entidad.OBJETVS,
                PRTCPNTS = entidad.PRTCPNTS,
                DRCCN = entidad.DRCCN,
                INVRSN = entidad.INVRSN,
                MDLDD = entidad.MDLDD,
                LGAR = entidad.LGAR,
                MODULOS = entidad.MODULOS,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.DetalleCursoCrud, parametros);
        }
    }
}
