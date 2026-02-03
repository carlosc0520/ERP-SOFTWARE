using CARO.DATOS.MODELO.SEG.TAREA;
using Dapper;
using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace CARO.DATOS.CONSULTAS.SEG
{
    public interface IConsultasLogTareas
    {
        Task<bool> YaSeEjecutoTarea(string tipoTarea, DateTime fecha);
        Task<int> RegistrarEjecucion(LogTareaEjecutadaModel log);
        Task<List<LogTareaEjecutadaModel>> ObtenerHistorial(string tipoTarea, DateTime fechaInicio, DateTime fechaFin);
    }
    public class ConsultasLogTareas : IConsultasLogTareas
    {
        private readonly string _connectionString;

        public ConsultasLogTareas(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<bool> YaSeEjecutoTarea(string tipoTarea, DateTime fecha)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var sql = @"
          SELECT COUNT(1) 
          FROM [dbo].[LogTareasEjecutadas] 
          WHERE TipoTarea = @TipoTarea 
            AND CAST(FechaEjecucion AS DATE) = CAST(@Fecha AS DATE)
            AND Estado = 'EXITOSA'";

                var count = await connection.ExecuteScalarAsync<int>(sql, new { TipoTarea = tipoTarea, Fecha = fecha });
                return count > 0;
            }
        }

        public async Task<int> RegistrarEjecucion(LogTareaEjecutadaModel log)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var sql = @"
          INSERT INTO [dbo].[LogTareasEjecutadas]
            (TipoTarea, FechaEjecucion, DiaEjecucion, HoraEjecucion, 
             CasosEncontrados, CorreosEnviados, Estado, MensajeError, FechaCreacion)
          VALUES
            (@TipoTarea, @FechaEjecucion, @DiaEjecucion, @HoraEjecucion,
             @CasosEncontrados, @CorreosEnviados, @Estado, @MensajeError, GETDATE());
          SELECT CAST(SCOPE_IDENTITY() as int)";

                return await connection.ExecuteScalarAsync<int>(sql, log);
            }
        }

        public async Task<List<LogTareaEjecutadaModel>> ObtenerHistorial(string tipoTarea, DateTime fechaInicio, DateTime fechaFin)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var sql = @"
          SELECT * 
          FROM [dbo].[LogTareasEjecutadas]
          WHERE TipoTarea = @TipoTarea
            AND FechaEjecucion >= @FechaInicio
            AND FechaEjecucion <= @FechaFin
          ORDER BY FechaEjecucion DESC";

                var result = await connection.QueryAsync<LogTareaEjecutadaModel>(sql,
                  new { TipoTarea = tipoTarea, FechaInicio = fechaInicio, FechaFin = fechaFin });

                return result.ToList();
            }
        }
    }
}