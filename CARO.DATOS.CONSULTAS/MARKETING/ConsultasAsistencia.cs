using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.MARKETING.ASISTENCIA;

namespace CARO.DATOS.CONSULTAS.MARKETING
{
    public interface IConsultasAsistencia
    {
        Task<List<AsistenciaModel>> Listar(AsistenciaModel custom);
        Task<List<ParticipantesModel>> ListarParticipantes(ParticipantesModel custom);
        Task<List<AsistenciaFechaModel>> ListarAsistencias(AsistenciaFechaModel custom);
        Task<List<AsistenciaFechaModel>> ListarAsistenciasParticipante(AsistenciaFechaModel custom);
    }
    public class ConsultasAsistencia : IConsultasAsistencia
    {
        private readonly IConfiguration _configuration;

        public ConsultasAsistencia(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<AsistenciaModel>> Listar(AsistenciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDCRSO = custom.IDCRSO
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<AsistenciaModel>(conexionSql, Procedimientos.MARKETING.CrudCalendario, parametros);
        }
        public async Task<List<ParticipantesModel>> ListarParticipantes(ParticipantesModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEVENTO = custom.IDEVENTO
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<ParticipantesModel>(conexionSql, Procedimientos.MARKETING.CrudParticipantes, parametros);
        }
        public async Task<List<AsistenciaFechaModel>> ListarAsistencias(AsistenciaFechaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDCRSO = custom.IDCRSO,
                FCHA = custom.FCHA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<AsistenciaFechaModel>(conexionSql, Procedimientos.MARKETING.CrudAsistencia, parametros);
        }

        public async Task<List<AsistenciaFechaModel>> ListarAsistenciasParticipante(AsistenciaFechaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDCRSO = custom.IDCRSO,
                IDPRTCPNTE = custom.IDPRTCPNTE
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<AsistenciaFechaModel>(conexionSql, Procedimientos.MARKETING.CrudAsistencia, parametros);
        }
    }
}

