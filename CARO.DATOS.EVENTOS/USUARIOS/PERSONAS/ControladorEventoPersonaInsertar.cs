using CARO.CORE.Structs;
using CARO.DATABASE;
using CARO.DATABASE.Helper;
using CARO.DATOS.EVENTOS.Comandos.USUARIOS.PERSONAS;
using Dapper;
using DocumentFormat.OpenXml.Bibliography;
using MediatR;
using Microsoft.Extensions.Configuration;
using Mysqlx.Session;
using System.Text.Json;

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
            if (!string.IsNullOrWhiteSpace(entidad.REDESVAR))
            {
                try
                {
                    entidad.REDES = JsonSerializer.Deserialize<List<RedSocialModel>>(entidad.REDESVAR);
                }
                catch (JsonException ex)
                {
                    entidad.REDES = new List<RedSocialModel>();
                }
            }

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
                TELFNO      = entidad.TELFNO,
                DEPARTAMENTO    = entidad.DEPARTAMENTO,
                PROVINCIA   = entidad.PROVINCIA,
                DISTRITO    = entidad.DISTRITO,
                DIRECCION   = entidad.DIRECCION,
                CARGO       = entidad.CARGO,
                RESENA      = entidad.RESENA,
                PASSWORD    = entidad.PASSWORD,
                PRMSO       = entidad.PRMSO,
                ANEXO       = entidad.ANEXO,
                RTAFTO      = entidad.RTAFTO,
                REDES       = entidad.REDES,
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