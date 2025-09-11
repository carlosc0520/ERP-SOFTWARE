using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.DENUNCIAS;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;
using System;

namespace CARO.DATOS.EVENTOS.CANALDENUNCIAS.DENUNCIAS
{
    public class ControladorEventoMovimientoDenunciaInsertar : IRequestHandler<ComandoMovimientoDenunciaInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoMovimientoDenunciaInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoMovimientoDenunciaInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDUSER = entidad.IDUSER,
                IDDENUNCIA = entidad.IDDENUNCIA,
                IDREP = entidad.IDREP,
                INDIC = entidad.INDIC,
                IDTPODENUNCIA = entidad.IDTPODENUNCIA,
                ACCION = entidad.ACCION,
                COMENTARIO = entidad.COMENTARIO,
                ACTUAL = entidad.ACTUAL,
                GDDENUNCIA = entidad.GDDENUNCIA,
                CESTDO = entidad.CESTDO,
                DSFSINVSTGDR = entidad.DSFSINVSTGDR,
                DSFSDCSR = entidad.DSFSDCSR,
                DSFSCRRE = entidad. DSFSCRRE,
                RUTA = entidad.RUTA
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.CANALDENUNCIAS.CrudMovimientosDenuncia, "p_nId", parametros);
        }
    }
}
