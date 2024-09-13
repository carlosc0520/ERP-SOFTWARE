using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.USUARIOS.PERSONAS;

namespace CARO.DATOS.EVENTOS.USUARIOS.PERSONAS
{
    public class ControladorEventoPersonaInsertar : IRequestHandler<ComandoPersonaInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventoPersonaInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoPersonaInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID          = entidad.ID,
                IDMRCA      = entidad.IDMRCA,
                IDROL       = entidad.IDROL,
                NOMBRS      = entidad.NOMBRS,
                SNOMBRS     = entidad.SNOMBRS,
                APLLDS      = entidad.APLLDS,
                SAPLLDS     = entidad.SAPLLDS,
                DCUMNTO     = entidad.DCUMNTO,
                CORREO      = entidad.CORREO,
                PASSWORD    = entidad.PASSWORD,
                ANEXO       = entidad.ANEXO,
                RTAFTO      = entidad.RTAFTO,
                PRMSO       = entidad.PRMSO,
                CESTDO      = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.USUARIO.PersonasCrud, parametros);
        }
    }
}