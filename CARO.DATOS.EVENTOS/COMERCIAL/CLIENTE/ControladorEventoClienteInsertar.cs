using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CLIENTE;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CLIENTE
{
    public class ControladorEventoClienteInsertar : IRequestHandler<ComandoClienteInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoClienteInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoClienteInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                NMBRS = entidad.NMBRS,
                APLLDS = entidad.APLLDS,
                RUC = entidad.RUC,
                RZNSCL = entidad.RZNSCL,
                DRCCN = entidad.DRCCN,
                CORREO = entidad.CORREO,
                CNTCTO = entidad.CNTCTO,
                IDMRCA = entidad.IDMRCA,
                MOTIVO = entidad.MOTIVO,
                APUNTES = entidad.APUNTES,
                GDESTDOCLI = entidad.GDESTDOCLI,
                RTAIMG = entidad.RTAIMG,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.ClienteCrud, parametros);
        }
    }
}
