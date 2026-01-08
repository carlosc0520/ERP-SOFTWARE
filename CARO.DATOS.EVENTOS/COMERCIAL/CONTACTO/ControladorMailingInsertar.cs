using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.COMERCIAL.CONTACTO;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.COMERCIAL.CONTACTO
{
    public class ControladorMailingInsertar : IRequestHandler<ComandoMailingInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorMailingInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoMailingInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            DateTime? fechaUtc = null;
            if (entidad.FPROGRAMADA.HasValue)
            {
                // 1. Si viene sin "Kind", se asume hora local de Perú
                DateTime fecha = entidad.FPROGRAMADA.Value;

                if (fecha.Kind == DateTimeKind.Unspecified)
                {
                    fecha = DateTime.SpecifyKind(fecha, DateTimeKind.Local);
                }

                // 2. Convertir SIEMPRE a UTC
                fechaUtc = fecha.ToUniversalTime();
            }

            parametros.Add("@MAILING_ID", entidad.MAILING_ID, dbType: DbType.Int32, direction: entidad.INDICADOR == 1 ? ParameterDirection.Output : ParameterDirection.Input);
            parametros.Add("@INDICADOR", entidad.INDICADOR, DbType.Int32);
            parametros.Add("@ASUNTO", entidad.ASUNTO, DbType.String);
            parametros.Add("@CUERPO_HTML", entidad.CUERPO_HTML, DbType.String);
            parametros.Add("@IMAGENES_JSON", entidad.IMAGENES_JSON, DbType.String);
            parametros.Add("@UCRCN", entidad.UCRCN, DbType.String);
            parametros.Add("@DESTINATARIOS", entidad.DESTINATARIOS, DbType.String);
            parametros.Add("@DESTINATARIO", entidad.DESTINATARIO, DbType.String);
            parametros.Add("@EVENTO", entidad.EVENTO, DbType.String);
            parametros.Add("@IDMRCA", entidad.IDMRCA, DbType.Int32);
            parametros.Add("@MENSAJE", entidad.MENSAJE, DbType.String); 
            parametros.Add("@FPROGRAMADA", fechaUtc, DbType.DateTime);
            parametros.Add("@ESTADO", entidad.ESTADO, DbType.String); 
            parametros.Add("@CORREOSEND", entidad.CORREOSEND, DbType.String);
            parametros.Add("@PLACEHOLDER", entidad.PLACEHOLDER, DbType.String);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.COMERCIAL.MailingsCrud, "MAILING_ID", parametros);
        }

    }
}
