using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.USUARIOS.ROLES;

namespace CARO.DATOS.CONSULTAS.USUARIOS
{
    public interface IConsultasRoles
    {
        Task<List<RolesModel>> Listar(RolesModel custom);
        Task<List<PermisosModel>> ListarPermisos(PermisosModel custom);
        Task<List<PermisosItemsModel>> ListarPermisosItems(PermisosItemsModel custom);

    }

    public class ConsultasRoles : IConsultasRoles
    {
        private readonly IConfiguration _configuration;

        public ConsultasRoles(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<RolesModel>> Listar(RolesModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<RolesModel>(conexionSql, Procedimientos.USUARIO.RolesCrud, parametros);
        }
        public async Task<List<PermisosModel>> ListarPermisos(PermisosModel custom)
        {
            var parametros = new DynamicParameters();
            var options = new JsonSerializerOptions
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDRLE = custom.IDRLE
            }, options).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<PermisosModel>(conexionSql, Procedimientos.USUARIO.ActualizarRoles, parametros);
        }

        public async Task<List<PermisosItemsModel>> ListarPermisosItems(PermisosItemsModel custom)
        {
            var parametros = new DynamicParameters();
            var options = new JsonSerializerOptions
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDRGSTR = custom.IDRGSTR
            }, options).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<PermisosItemsModel>(conexionSql, Procedimientos.USUARIO.ActualizarPermisosItems, parametros);
        }
    }
}