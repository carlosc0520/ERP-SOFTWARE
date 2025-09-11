using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS;
using System.Data;

namespace CARO.DATOS.EVENTOS.CANALDENUNCIAS.DENUNCIAS
{
    public class ControladorEventoDenunciaInsertar : IRequestHandler<ComandoDenunciaInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoDenunciaInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoDenunciaInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRESA = entidad.IDEMPRESA,
                IDTPODENUNCIA = entidad.IDTPODENUNCIA,
                IDRECEPTOR = entidad.IDRECEPTOR,
                IDREMPRESA = entidad.IDREMPRESA,
                NOMBRES = entidad.NOMBRES,
                APELLIDOS = entidad.APELLIDOS,
                CORREO = entidad.CORREO,
                TELEFONO = entidad.TELEFONO,
                FECHAINC = entidad.FECHAINC,
                DETALLE = entidad.DETALLE,
                COMENTARIOADI = entidad.COMENTARIOADI,
                CONTRASENA = entidad.CONTRASENA,
                CORREOREC = entidad.CORREOREC,
                GDDENUNCIA = entidad.GDDENUNCIA,
                JSON_DOCUMENTOS = entidad.DOCUMENTOS,
                JSON_TESTIGOS = entidad.TESTIGOS,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.CANALDENUNCIAS.CrudDenuncias, "p_nId", parametros);
        }
    }
}
