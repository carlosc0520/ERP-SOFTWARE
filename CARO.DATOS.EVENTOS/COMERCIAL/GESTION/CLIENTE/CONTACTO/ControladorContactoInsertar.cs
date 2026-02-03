using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CLIENTE.CONTACTO;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.GESTION.CLIENTE.CONTACTO
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
            var listaContactos = JsonSerializer.Deserialize<List<ComandoListContactoInsertar>>(entidad.LISTCONTACTOS ?? "[]");
            var json = JsonSerializer.Serialize(listaContactos);

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0, dbType: DbType.Int32, direction: ParameterDirection.InputOutput);
            parametros.Add("@p_message", dbType: DbType.String, direction: ParameterDirection.Output, size: 5000);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoQuery(conexionSql, Procedimientos.COMERCIAL.ContactoXClienteXCasoCrud, parametros);
        }
    }
}
