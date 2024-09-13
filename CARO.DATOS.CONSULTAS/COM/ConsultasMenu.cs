using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.COM.MENU;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasMenu
    {
        Task<List<MenuModel>> Listar(MenuModel custom);

    }
    public class ConsultasMenu : IConsultasMenu
    {
        private readonly IConfiguration _configuration;

        public ConsultasMenu(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<MenuModel>> Listar(MenuModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT ?? 0,
                ROWS = custom.ROWS ?? 10000,
                IDMDLO = custom.IDMDLO
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<MenuModel>(conexionSql, Procedimientos.MENU.MenuCrud, parametros);
        }

    }
}
