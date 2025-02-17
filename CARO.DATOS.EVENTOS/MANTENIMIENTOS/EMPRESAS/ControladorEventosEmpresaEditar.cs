using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.EMPRESAS;
using DocumentFormat.OpenXml.Vml.Office;

namespace CARO.DATOS.EVENTOS.MANTENIMIENTOS.EMPRESAS
{
    public class ControladorEventosEmpresaEditar : IRequestHandler<ComandoEmpresaEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosEmpresaEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoEmpresaEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                MRCA = entidad.MRCA,
                RTAFTO = entidad.RTAFTO,
                CESTDO = entidad.CESTDO,
                RUC = entidad.RUC,
                RZNSCIL = entidad.RZNSCIL,
                IDPRSNA = entidad.IDPRSNA,
                DRCNN = entidad.DRCNN,
                PRVNCA = entidad.PRVNCA,
                IDPAIS = entidad.IDPAIS,
                GDENTDD = entidad.GDENTDD,
                CCNTA = entidad.CCNTA,
                CCNTACCI = entidad.CCNTACCI
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MANTENIMIENTOS.EmpreasCrud, parametros);
        }
    }
}
