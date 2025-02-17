using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.MARKETING.ASISTENCIA;


namespace CARO.DATOS.EVENTOS.MARKETING.ASISTENCIA
{
    public class ControladorEventoParticipanteEditar : IRequestHandler<ComandoParticipanteEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoParticipanteEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoParticipanteEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEVENTO = entidad.IDEVENTO,
                NOMBRES = entidad.NOMBRES,
                APELLIDOS = entidad.APELLIDOS,
                DNI = entidad.DNI,
                CORREO = entidad.CORREO,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MARKETING.CrudParticipantes, parametros);
        }
    }
}
