using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.CANALDENUNCIAS.CONFIGURACION;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.CANALDENUNCIAS.CONFIGURACION
{
    public class ControladorEventoParametroDenunciaInsertar : IRequestHandler<ComandoParametroDenunciaInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoParametroDenunciaInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoParametroDenunciaInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRESA = entidad.IDEMPRESA,
                DESCP = entidad.DESCP,
                ABREV = entidad.ABREV,
                VLR1 = entidad.VLR1,
                VLR2 = entidad.VLR2,
                VLR3 = entidad.VLR3,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.CANALDENUNCIAS.CrudParametroDenuncia, parametros);
        }
    }
}
