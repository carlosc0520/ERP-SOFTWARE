using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.CCFIRMA.LIBRORECLAMACIONES;
using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Office2013.Excel;
using DocumentFormat.OpenXml.Drawing.Charts;
using DocumentFormat.OpenXml.Vml.Office;
using System.Data;

namespace CARO.DATOS.EVENTOS.CCFIRMA.LIBRORECLAMACIONES
{
    public class ControladorLibroReclamacionesInsertar : IRequestHandler<ComandoLibroReclamacionesInsertar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorLibroReclamacionesInsertar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoLibroReclamacionesInsertar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                IDEMPRSA = entidad.IDEMPRSA,
                DIDEMPRSA = entidad.DIDEMPRSA,
                SEDE = entidad.SEDE,
                DIRECCION = entidad.DIRECCION,
                MENOREDAD = entidad.MENOREDAD,
                TDOCRECL = entidad.TDOCRECL,
                NRODOCRECL = entidad.NRODOCRECL,
                NOMBREAPELLIDO1 = entidad.NOMBREAPELLIDO1,
                TDOCRECL2 = entidad.TDOCRECL2,
                NRODOCRECL2 = entidad.NRODOCRECL2,
                NOMBREAPELLIDO12 = entidad.NOMBREAPELLIDO12,
                EMPRESA = entidad.EMPRESA,
                EMPRESARSOCIAL= entidad.EMPRESARSOCIAL,
                EMPRESATPODOC = entidad.EMPRESATPODOC,
                EMPRESANUMERO = entidad.EMPRESANUMERO,
                EMAILRECL = entidad.EMAILRECL,
                TELEFONORECL = entidad.TELEFONORECL,
                DEPARTAMENTO = entidad.DEPARTAMENTO,
                PROVINCIA = entidad.PROVINCIA,
                DISTRITO = entidad.DISTRITO,
                DIRECCIONRECL =  entidad.DIRECCIONRECL,
                TIPOSERVICIO = entidad.TIPOSERVICIO,
                MONTORECLAMADO = entidad.MONTORECLAMADO,
                DETALLE = entidad.DETALLE,
                TIPORECLAMO = entidad.TIPORECLAMO,
                DETALLERECLAMO = entidad.DETALLERECLAMO,
                PEDIDO = entidad.PEDIDO,
                RUTAS = entidad.RUTAS,
                ARCHIVOS = entidad.ARCHIVOS,
                CESTDO = 'A'
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.CCFIRMA.LibroReclamacionesCrud, "p_nId", parametros);
        }
    }
}
