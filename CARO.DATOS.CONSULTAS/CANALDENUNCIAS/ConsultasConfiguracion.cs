using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.CANALDENUNCIAS;

namespace CARO.DATOS.CONSULTAS.CANALDENUNCIAS
{
    public interface IConsultasConfiguracion
    {
        Task<List<TipoDenunciaModel>> ListarTipoDenuncia(TipoDenunciaModel custom);
        Task<DashboardaModel> Dashboard(DashboardaModel custom);
        Task<List<RelacionEmpresaModel>> ListarRelacionEmpresa(RelacionEmpresaModel custom);
        Task<List<ReceptorModel>> ListarReceptor(ReceptorModel custom);
        Task<List<AccionesModel>> ListarAcciones(AccionesModel custom);
        Task<List<ParametroDenunciaModel>> ParametroDenuncia(ParametroDenunciaModel custom);
        Task<List<SolicitudDenunciaModel>> ListarSolicitudes(SolicitudDenunciaModel custom);

    }
    public class ConsultasConfiguracion : IConsultasConfiguracion
    {
        private readonly IConfiguration _configuration;

        public ConsultasConfiguracion(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<TipoDenunciaModel>> ListarTipoDenuncia(TipoDenunciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                TIPO = custom.TIPO,
                IDEMPRESA = custom.IDEMPRESA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<TipoDenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudConfiguracion, parametros);
        }
        public async Task<DashboardaModel> Dashboard(DashboardaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                IDEMPRESA = custom.IDEMPRESA,
                IDUSR = custom.IDUSR
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 6);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            var data = await FuncionesSql.EjecutarProcedimiento<DashboardaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudConfiguracion, parametros);
            return data.FirstOrDefault();
        }

        public async Task<List<RelacionEmpresaModel>> ListarRelacionEmpresa(RelacionEmpresaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                TIPO = custom.TIPO,
                IDEMPRESA = custom.IDEMPRESA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<RelacionEmpresaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudConfiguracion, parametros);
        }
        public async Task<List<SolicitudDenunciaModel>> ListarSolicitudes(SolicitudDenunciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRESA = custom.IDEMPRESA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<SolicitudDenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudSolicitudes, parametros);
        }
        public async Task<List<ReceptorModel>> ListarReceptor(ReceptorModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRESA = custom.IDEMPRESA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<ReceptorModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudReceptores, parametros);
        }

        public async Task<List<ParametroDenunciaModel>> ParametroDenuncia(ParametroDenunciaModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDEMPRESA = custom.IDEMPRESA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<ParametroDenunciaModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudParametroDenuncia, parametros);
        }
        public async Task<List<AccionesModel>> ListarAcciones(AccionesModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS,
                IDDENUNCIA = custom.IDDENUNCIA
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<AccionesModel>(conexionSql, Procedimientos.CANALDENUNCIAS.CrudAcciones, parametros);
        }

    }
}
