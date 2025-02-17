using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.MANTENIMIENTOS.EMPRESAS;

namespace CARO.DATOS.EVENTOS.MANTENIMIENTOS.EMPRESAS
{
    public class ControladorEventosEmpresaInsertar : IRequestHandler<ComandoEmpresaInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosEmpresaInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoEmpresaInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                RTAFTO = entidad.RTAFTO,
                MRCA = entidad.MRCA,
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
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.MANTENIMIENTOS.EmpreasCrud, parametros);
        }
    }
}

