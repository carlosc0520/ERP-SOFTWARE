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
    public class ControladorEventoSolicitudDenunciaEditar : IRequestHandler<ComandoSolicitudDenunciaEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoSolicitudDenunciaEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoSolicitudDenunciaEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRESA = entidad.IDEMPRESA,
                NOMBRE = entidad.NOMBRE,
                APELLIDO = entidad.APELLIDO,
                CORREO = entidad.CORREO,
                ASUNTO = entidad.ASUNTO,
                MENSAJE = entidad.MENSAJE,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.CANALDENUNCIAS.CrudSolicitudes, parametros);
        }
    }
}
