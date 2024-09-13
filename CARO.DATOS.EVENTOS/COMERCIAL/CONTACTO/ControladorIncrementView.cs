using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CONTACTO
{
    internal class ControladorIncrementView : IRequestHandler<ComandoIncrementView, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorIncrementView(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoIncrementView entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                REDURL = entidad.REDIRECT,
                IDNTCA = entidad.IDNTCA,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", "AUTOMATICO");
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.EmailCrud, parametros);
        }
    }
}
