using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.SEG.MODULOS;

namespace CARO.DATOS.EVENTOS.SEG.MODULOS
{
    public class ControladorEventoEditar : IRequestHandler<ComandoModuloEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoModuloEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                MDLO = entidad.MDLO,
                IMG = entidad.IMG,
                URL = entidad.URL,
                URL2 = entidad.URL2,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.SEGURIDAD.ModulosCrud, parametros);
        }
    }
}
