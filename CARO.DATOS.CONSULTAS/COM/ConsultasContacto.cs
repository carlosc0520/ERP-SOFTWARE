using Dapper;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.DATOS.MODELO.COM.CONTACTO;

namespace CARO.DATOS.CONSULTAS.COM
{
    public interface IConsultasContacto
    {
        Task<List<ContactoModel>> Listar(ContactoModel custom);
        Task<List<EmailModel>> ListarAdjuntos(EmailModel custom);
        Task<List<DetEmailModel>> ListarEmails(DetEmailModel custom);

    }
    public class ConsultasContacto : IConsultasContacto
    {
        private readonly IConfiguration _configuration;

        public ConsultasContacto(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<ContactoModel>> Listar(ContactoModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.DESC,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS
            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<ContactoModel>(conexionSql, Procedimientos.COMERCIAL.ContactosCrud, parametros);
        }
        public async Task<List<DetEmailModel>> ListarEmails(DetEmailModel custom)
        {
            var parametros = new DynamicParameters();
            var options = new JsonSerializerOptions
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            var json = JsonSerializer.Serialize(new
            {
                DESC = custom.ASNTO,
                CESTDO = custom.CESTDO,
                INIT = custom.INIT,
                ROWS = custom.ROWS
            }, options).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 4);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<DetEmailModel>(conexionSql, Procedimientos.COMERCIAL.EmailCrud, parametros);
        }


        public async Task<List<EmailModel>> ListarAdjuntos(EmailModel custom)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                IDNTCA = custom.IDNTCA,
                REDURL = custom.REDURL

            }).ToUpper();

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", null);
            parametros.Add("@p_nTipo", 6);
            parametros.Add("@p_nId", custom.ID ?? 0);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento<EmailModel>(conexionSql, Procedimientos.COMERCIAL.EmailCrud, parametros);
        }
    }
}