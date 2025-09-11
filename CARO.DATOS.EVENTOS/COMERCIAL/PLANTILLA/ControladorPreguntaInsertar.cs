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
    public class ControladorPreguntaInsertar : IRequestHandler<ComandoPreguntaInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorPreguntaInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoPreguntaInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            List<AlternativaModel> alternativas = new List<AlternativaModel>();

            if (!string.IsNullOrWhiteSpace(entidad.ALTERNATIVAS))
            {
                alternativas = JsonSerializer.Deserialize<List<AlternativaModel>>(entidad.ALTERNATIVAS);
            }

            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDFORM = entidad.IDFORM,
                DESCP = entidad.DESCP,
                REQUIREDP = entidad.REQUIREDP,
                GDTYPEP = entidad.GDTYPEP,
                ALTERNATIVAS = alternativas,     
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.FormularioCrud, parametros);
        }
    }
}
