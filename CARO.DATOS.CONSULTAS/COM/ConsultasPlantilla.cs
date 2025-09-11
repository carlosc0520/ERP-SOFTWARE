using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.COM.PLANTILLA;
using Org.BouncyCastle.Asn1.X509;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasPlantilla
    {
        Task<List<PlantillaModel>> Listar(PlantillaModel custom);
        Task<List<FormularioModel>> ListarFormularios(FormularioModel custom);
        Task<List<PreguntaModel>> ListarPreguntas(PreguntaModel custom);
        Task<FormularioModel> ListarForm(FormularioModel custom);
        Task<FormularioRespuestaModel> ListarRespuestas(FormularioRespuestaModel custom);

    }
    public class ConsultasPlantilla : IConsultasPlantilla
    {
        private readonly IConfiguration _configuration;

        public ConsultasPlantilla(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<PlantillaModel>> Listar(PlantillaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDMRCA = custom.IDMRCA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<PlantillaModel>(conexionSql, Procedimientos.COMERCIAL.PlantillaCrud, parametros);
        }

        public async Task<List<FormularioModel>> ListarFormularios(FormularioModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRSA = custom.IDEMPRSA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 7);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<FormularioModel>(conexionSql, Procedimientos.COMERCIAL.FormularioCrud, parametros);
        }

        public async Task<List<PreguntaModel>> ListarPreguntas(PreguntaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDFORM = custom.IDFORM
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 8);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<PreguntaModel>(conexionSql, Procedimientos.COMERCIAL.FormularioCrud, parametros);
        }

        public async Task<FormularioModel> ListarForm(FormularioModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 9);
            parametros.Add("@p_nId", custom.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoFirst<FormularioModel>(conexionSql, Procedimientos.COMERCIAL.FormularioCrud, parametros);
        }

        public async Task<FormularioRespuestaModel> ListarRespuestas(FormularioRespuestaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                EMAIL = custom.EMAIL,
                IDFORM = custom.IDFORM,
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoFirst<FormularioRespuestaModel>(conexionSql, Procedimientos.COMERCIAL.FormularioCrudRespuesta, parametros);
        }
    }
}
