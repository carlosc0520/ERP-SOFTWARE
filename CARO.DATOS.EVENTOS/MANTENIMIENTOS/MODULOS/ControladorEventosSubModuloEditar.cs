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
    public class ControladorEventosSubModuloEditar : IRequestHandler<ComandoSubModulosEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosSubModuloEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoSubModulosEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDMDLO = entidad.IDMDLO,
                DSCRPCN = entidad.DSCRPCN,
                ICONO = entidad.ICONO,
                URL = entidad.URL,
                ISPARENT = entidad.ISPARENT,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MANTENIMIENTOS.SubModulosCrud, parametros);
        }
    }
}

