using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CLIENTE;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CLIENTE
{
    public class ControladorEventoSeguimientoClienteInsertar : IRequestHandler<ComandoSeguimientoClienteInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoSeguimientoClienteInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoSeguimientoClienteInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDCLIENTE = entidad.IDCLIENTE,
                IDPRSNA = entidad.IDPRSNA,
                FCHA = entidad.FCHA,
                MOTIVO = entidad.MOTIVO,
                APUNTES = entidad.APUNTES,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.SeguimientoCrud, parametros);
        }
    }
}
