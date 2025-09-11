using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.MODELO.CCFIRMA;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace CARO.DATOS.CONSULTAS.CCFIRMA
{
    public interface IConsultasLibroReclamaciones
    {
        Task<List<LibroReclamacionModel>> ListarReclamos(LibroReclamacionModel custom);
        Task<LibroReclamacionModel> ObtenerCorreclativo(LibroReclamacionModel custom);
    }
    public class ConsultasLibroReclamaciones : IConsultasLibroReclamaciones
    {
        private readonly IConfiguration _configuration;

        public ConsultasLibroReclamaciones(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<LibroReclamacionModel>> ListarReclamos(LibroReclamacionModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                USUARIO = custom.USUARIO,
                YEAR = custom.YEAR,
                MESES = custom.MESES,
                TIPORECLAMO = custom.TIPORECLAMO,
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRESA = custom.IDEMPRSA,
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<LibroReclamacionModel>(conexionSql, Procedimientos.CCFIRMA.LibroReclamacionesCrud, parametros);
        }

        public async Task<LibroReclamacionModel> ObtenerCorreclativo(LibroReclamacionModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                IDEMPRESA = custom.IDEMPRSA,
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 5);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimientoFirst<LibroReclamacionModel>(conexionSql, Procedimientos.CCFIRMA.LibroReclamacionesCrud, parametros);
        }
    }
}
