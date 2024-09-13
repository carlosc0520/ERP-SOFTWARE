using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.USUARIOS.PERMISOS;

namespace CARO.DATOS.CONSULTAS.USUARIOS
{
    public interface IConsultasPermisos
    {
        Task<List<PermisosModel>> ListarPermisos(PermisosModel custom);
        Task<List<VistaModel>> ListarVistas(VistaModel custom);

    }
    public class ConsultasPermisos : IConsultasPermisos
    {
        private readonly IConfiguration _configuration;

        public ConsultasPermisos(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<PermisosModel>> ListarPermisos(PermisosModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                IDITM = custom.IDITM,
                ROWS = custom.ROWS
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<PermisosModel>(conexionSql, Procedimientos.USUARIO.PermisosCrud, parametros);
        }

        public async Task<List<VistaModel>> ListarVistas(VistaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new { }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<VistaModel>(conexionSql, Procedimientos.USUARIO.PermisosCrud, parametros);
        }
    }
}
