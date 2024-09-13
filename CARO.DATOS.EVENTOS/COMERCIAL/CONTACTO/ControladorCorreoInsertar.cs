using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;
using System.Data;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CONTACTO
{
    public class ControladorCorreoInsertar : IRequestHandler<ComandoCorreoInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorCorreoInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoCorreoInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                ASNTO = entidad.ASNTO,
                CNTCTS = entidad.CNTCTS,
                MSJE = entidad.MSJE,
                DATA = entidad.DATA,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.EmailCrud, parametros);
        }
    }
}
