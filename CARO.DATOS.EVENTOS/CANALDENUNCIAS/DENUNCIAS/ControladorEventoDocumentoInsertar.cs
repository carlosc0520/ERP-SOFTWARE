using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.CANALDENUNCIAS.DENUNCIAS
{
    public class ControladorEventoDocumentoInsertar : IRequestHandler<ComandoDocumentoInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoDocumentoInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoDocumentoInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDDENUNCIA = entidad.IDDENUNCIA,
                NARCHIVO = entidad.NARCHIVO,
                SIZE = entidad.SIZE,
                RUTA = entidad.RUTA,
                COMENTARIOS = entidad.COMENTARIOS,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.CANALDENUNCIAS.CrudDocumentos, "p_nId", parametros);
        }
    }
}
