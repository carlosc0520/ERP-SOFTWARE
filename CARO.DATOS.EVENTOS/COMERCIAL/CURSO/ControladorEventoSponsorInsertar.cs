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
    public class ControladorEventoSponsorInsertar : IRequestHandler<ComandoSponsorInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoSponsorInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoSponsorInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDCRSO = entidad.IDCRSO,
                NMBRS = entidad.NMBRS,
                RTAFTO = entidad.RTAFTO,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.SponsorsCrud, parametros);
        }
    }
}

