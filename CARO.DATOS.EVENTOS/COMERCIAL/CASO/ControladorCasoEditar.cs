using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CASO;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CASO
{
    public class ControladorCasoEditar : IRequestHandler<ComandoCasoEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorCasoEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoCasoEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRSA = entidad.IDEMPRSA,
                CASO = entidad.CASO,
                IDCLNTE = entidad.IDCLNTE,
                GDAREACSO = entidad.GDAREACSO,
                ABOGDOS = entidad.ABOGDOS,
                HNRRIO = entidad.HNRRIO,
                HINICIAL = entidad.HINICIAL,
                HEXITO = entidad.HEXITO,
                HUNICO = entidad.HUNICO,
                HAUDIENCIA = entidad.HAUDIENCIA,
                HDIA = entidad.HDIA,
                HHORA = entidad.HHORA,
                HMENSUAL = entidad.HMENSUAL,
                HCERTIFICADOS = entidad.HCERTIFICADOS,
                COMNTRIO = entidad.COMNTRIO,
                FENVIO = entidad.FENVIO,
                FULTIMOSEG = entidad.FULTIMOSEG,
                GDESTDOCSO = entidad.GDESTDOCSO,
                GDSMFROCSO = entidad.GDSMFROCSO,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery(conexionSql, Procedimientos.COMERCIAL.CasoMasivosCrud, parametros);
        }
    }
}

