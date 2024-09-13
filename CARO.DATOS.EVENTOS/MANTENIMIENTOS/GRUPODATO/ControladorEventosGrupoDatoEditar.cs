using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.GRUPODATO;

namespace CARO.DATOS.EVENTOS.MANTENIMIENTOS.GRUPODATO
{
    public class ControladorEventosGrupoDatoEditar : IRequestHandler<ComandoGrupoDatoEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosGrupoDatoEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoGrupoDatoEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                DGDTLLE = entidad.DGDTLLE,
                GDTPO = entidad.GDTPO,
                DTLLE = entidad.DTLLE,
                VLR1 = entidad.VLR1,
                VLR2 = entidad.VLR2,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MANTENIMIENTOS.GrupoDatoCrud, parametros);
        }
    }
}
