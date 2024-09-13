using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.MODULOS;

namespace CARO.DATOS.EVENTOS.MANTENIMIENTOS.MODULOS
{
    public class ControladorEventosDetSubModuloEditar : IRequestHandler<ComandoDetSubModulosEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosDetSubModuloEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoDetSubModulosEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDSUBMDLO = entidad.IDSUBMDLO,
                DSCRPCN = entidad.DSCRPCN,
                ICONO = entidad.ICONO,
                URL = entidad.URL,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MANTENIMIENTOS.DetSubModulosCrud, parametros);
        }
    }
}

