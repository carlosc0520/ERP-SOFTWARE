using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.USUARIOS.ROLES;

namespace CARO.DATOS.EVENTOS.USUARIOS.ROLES
{
    public class ControladorEventosPermisoActualizar : IRequestHandler<ComandoPermisoActualizar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosPermisoActualizar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoPermisoActualizar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(entidad.DATOS);

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.USUARIO.ActualizarPermisosItems, parametros);
        }
    }
}
