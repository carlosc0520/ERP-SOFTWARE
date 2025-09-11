using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.PLANTILLA
{
    public class ControladorFormularioRespuestasInsertar : IRequestHandler<ComandoFormularioRespuestasInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorFormularioRespuestasInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoFormularioRespuestasInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            List<RespuestaUserModel> respuestas = new List<RespuestaUserModel>();

            if (!string.IsNullOrWhiteSpace(entidad.RESPUESTAS))
            {
                respuestas = JsonSerializer.Deserialize<List<RespuestaUserModel>>(entidad.RESPUESTAS);
            }

            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDFORMU = entidad.IDFORMU,
                EMAIL = entidad.EMAIL,
                NOMBRES = entidad.NOMBRES,
                RESPUESTAS = respuestas,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.FormularioCrudRespuesta, parametros);
        }
    }
}

