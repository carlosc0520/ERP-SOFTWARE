using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.DOCUMENTOS;

namespace CARO.DATOS.EVENTOS.LEGAL.DOCUMENTOS
{
    public class ControladorEventosDocumentoEditar : IRequestHandler<ComandoDocumentoEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosDocumentoEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoDocumentoEditar entidad, CancellationToken cancellationToken)
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
            parametros.Add("@p_nTipo", entidad.TIPO);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.LEGAL.CrudDocumentos, parametros);
        }
    }
}
