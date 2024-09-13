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
    public class ControladorEventosGrupoDatoDetEditar : IRequestHandler<ComandoGrupoDatoDetEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosGrupoDatoDetEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoGrupoDatoDetEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                GDPDRE = entidad.GDPDRE,
                DTLLE = entidad.DTLLE,
                VLR1 = entidad.VLR1,
                VLR2 = entidad.VLR2,
                VLR3 = entidad.VLR3,
                VLR4 = entidad.VLR4,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MANTENIMIENTOS.GrupoDatoDetCrud, parametros);
        }
    }
}
