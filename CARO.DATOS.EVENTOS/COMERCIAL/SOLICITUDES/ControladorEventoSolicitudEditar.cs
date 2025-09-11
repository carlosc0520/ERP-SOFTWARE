using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.SOLICITUD;

namespace CARO.DATOS.EVENTOS.COMERCIAL.SOLICITUDES
{
    internal class ControladorEventoSolicitudEditar : IRequestHandler<ComandoSolicitudEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoSolicitudEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoSolicitudEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                RCMNTRS = entidad.RCMNTRS,
                ACMNTRS = entidad.ACMNTRS,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.LEGAL.CrudSolicitudes, parametros);
        }
    }
}
