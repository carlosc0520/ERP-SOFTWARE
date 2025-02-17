using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.DOCUMENTOS;
using System.Data;

namespace CARO.DATOS.EVENTOS.LEGAL.DOCUMENTOS
{
    public class ControladorEventosDocumentoInsertar : IRequestHandler<ComandoDocumentoInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosDocumentoInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoDocumentoInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDUSR = entidad.IDUSR,
                NOMBRE = entidad.NOMBRE,
                GDTPOFILE = entidad.GDTPOFILE,
                EXTENSION = entidad.EXTENSION,
                IDPADRE = entidad.IDPADRE,
                RUTA = entidad.RUTA,
                PASSWORD = entidad.PASSWORD,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.LEGAL.CrudDocumentos, "@p_nId", parametros);
        }
    }
}

