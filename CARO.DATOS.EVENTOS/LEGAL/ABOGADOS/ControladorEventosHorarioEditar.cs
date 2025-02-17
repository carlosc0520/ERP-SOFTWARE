using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.EVENTOS.LEGAL.ABOGADOS
{
    public class ControladorEventosHorarioEditar : IRequestHandler<ComandoHorariosEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosHorarioEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoHorariosEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDABGDO = entidad.IDABGDO,
                FCHA = entidad.FCHA,
                HRAINIT = entidad.HRAINIT,
                HRAFN = entidad.HRAFN,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.LEGAL.CrudHorarios, parametros);
        }
    }
}
