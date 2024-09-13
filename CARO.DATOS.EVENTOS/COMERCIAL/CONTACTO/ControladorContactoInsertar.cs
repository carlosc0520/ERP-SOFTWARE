using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CONTACTO
{
    public class ControladorContactoInsertar : IRequestHandler<ComandoContactoInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorContactoInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoContactoInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                NMBRS    = entidad.NMBRS,
                APLLDS   = entidad.APLLDS,
                EML      = entidad.EML,
                DRCCN    = entidad.DRCCN,
                TLFNO    = entidad.TLFNO,
                CLENTE   = entidad.CLENTE,
                GDRBROC  = entidad.GDRBROC,
                GDCRGOC  = entidad.GDCRGOC,
                IDMRCA   = entidad.IDMRCA,
                CESTDO = entidad.CESTDO 
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.ContactosCrud, parametros);
        }
    }
}
