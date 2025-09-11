using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.PLANTILLA;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.PLANTILLA
{
    public class ControladorFormularioInsertar : IRequestHandler<ComandoFormularioInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorFormularioInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoFormularioInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRSA = entidad.IDEMPRSA,
                NOMBRE = entidad.NOMBRE,
                DESCP = entidad.DESCP,
                FINICIO = entidad.FINICIO,
                FFIN = entidad.FFIN,
                LOGO = entidad.LOGO,
                BGCOLOR = entidad.BGCOLOR,
                BGCOLOR2 = entidad.BGCOLOR2,
                GDFORMT = entidad.GDFORMT,
                GDTPOGR = entidad.GDTPOGR,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.FormularioCrud, parametros);
        }
    }
}
