using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.LEGAL.ABOGADOS
{
    public class ControladorEventosSolicitudInsertar : IRequestHandler<ComandoSolicitudInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosSolicitudInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoSolicitudInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                GDSUCRSLS = entidad.GDSUCRSLS,
                GDESPCLDD = entidad.GDESPCLDD,
                ABOGADO = entidad.ABOGADO,
                FCHASERVICIO = entidad.FCHASERVICIO,
                DATA_HORA = entidad.DATA_HORA,
                NMBRES = entidad.NMBRES,
                APLLDS = entidad.APLLDS,
                CORREO = entidad.CORREO,
                CELULAR = entidad.CELULAR,
                COMENTARIOS = entidad.COMENTARIOS,
                RUTAS = entidad.RUTAS,
                GDATNCN = entidad.GDATNCN
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", "CCFIRMA");
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.LEGAL.CrudSolicitudes, "@p_nId", parametros);
        }
    }
}

