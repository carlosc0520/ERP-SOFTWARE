using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Data;

namespace CARO.DATOS.EVENTOS.MARKETING.ASISTENCIA
{
    public class ControladorEventoAsistenciaInsertar : IRequestHandler<ComandoAsistenciaAgregar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoAsistenciaInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoAsistenciaAgregar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDCRSO = entidad.IDCRSO,
                CODIGO = entidad.CODIGO,
                IDPRTCPNTE = entidad.IDPRTCPNTE,
                FCHA = entidad.FCHA,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MARKETING.CrudAsistencia, "p_nId", parametros);
        }
    }
}