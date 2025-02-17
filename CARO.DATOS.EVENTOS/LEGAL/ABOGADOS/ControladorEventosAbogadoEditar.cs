using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS;

namespace CARO.DATOS.EVENTOS.LEGAL.ABOGADOS
{
    public class ControladorEventosAbogadoEditar : IRequestHandler<ComandoAbogadoEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosAbogadoEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoAbogadoEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDPRSNA = entidad.IDPRSNA,
                NCLGTRA = entidad.NCLGTRA,
                GDESPCLDD = entidad.GDESPCLDD,
                NLICNCIA = entidad.NLICNCIA,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.LEGAL.CrudAbogados, parametros);
        }
    }
}
