using CARO.AUTENTICACION.WEB.Pages.Comercial.Contactos;
using CARO.CONFIG;
using CARO.DATOS.CONSULTAS.CANALDENUNCIAS;
using CARO.DATOS.CONSULTAS.CCFIRMA;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.CONSULTAS.LEGAL;
using CARO.DATOS.CONSULTAS.MANTENIMIENTOS;
using CARO.DATOS.CONSULTAS.MARCAS.AIC;
using CARO.DATOS.CONSULTAS.MARKETING;
using CARO.DATOS.CONSULTAS.SEG;
using CARO.DATOS.CONSULTAS.USUARIOS;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.IdentityModel.Tokens;
using Quartz;
using Syncfusion.Licensing;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;
SyncfusionLicenseProvider.RegisterLicense("Ngo9BigBOggjHTQxAR8/V1JEaF5cXmRCdkx3Rnxbf1x1ZFdMZVVbRnJPIiBoS35Rc0VkWHtfdXRTRGZVV0J2VEFd");


builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
//builder.Services.AddCors(o => o.AddPolicy("MyPolicy", builder =>
//{
//  builder.WithOrigins(
//      "http://localhost:3000",
//      "http://resourcesasociados.caroasociados.pe",
//      "http://127.0.0.1:5500",
//      "https://ccfirma.com"
//      )
//         .AllowAnyMethod()
//         .AllowAnyHeader();
//}));

builder.Services.AddCors(o => o.AddPolicy("MyPolicy", builder =>
{
  builder.AllowAnyOrigin()  // Permite cualquier origen
         .AllowAnyMethod()  // Permite cualquier método HTTP (GET, POST, etc.)
         .AllowAnyHeader(); // Permite cualquier encabezado
}));

// Add services to the container.
builder.Services.AddRazorPages();
//builder.Services.AddScoped<CustomPageFilter>();
builder.Services.AddQuartz(q =>
{
  q.UseMicrosoftDependencyInjectionJobFactory();

  // Configurar JobStore persistente (SQL Server)
  q.UsePersistentStore(s =>
  {
    s.UseProperties = true;
    s.RetryInterval = TimeSpan.FromSeconds(15);
    s.UseSqlServer(sqlServerOptions =>
    {
      sqlServerOptions.ConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
      sqlServerOptions.TablePrefix = "QRTZ_"; // prefijo por defecto del script
                                              // sqlServerOptions.SchemaName = "dbo"; // si lo pusiste en otro schema
    });

    s.UseJsonSerializer(); // facilita pasar objetos en JobDataMap
  });
});

// Quartz hosted service
builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

builder.Services.AddHostedService<PendingMailingsScheduler>();


// Registramos el job que ejecutará Quartz
builder.Services.AddTransient<EventosHandler>();
builder.Services.AddTransient<JobEnviarMailing>();
// Registramos tu servicio SchedulerService
builder.Services.AddSingleton<SchedulerService>();

builder.Services.AddMediatR(Assembly.Load("CARO.DATOS.EVENTOS"));
builder.Services.AddAntiforgery(o => o.HeaderName = "XSRF-TOKEN");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = false,
      ValidateAudience = false,
      ValidateLifetime = true,
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ConfiguracionProyecto.CAPTCHA.SecretKey))
    };
  });


builder.Services.Configure<FormOptions>(options =>
{
  options.ValueCountLimit = int.MaxValue;        // número de keys
  options.ValueLengthLimit = int.MaxValue;       // tamaño por valor
  options.MultipartBodyLengthLimit = long.MaxValue; // tamaño del formulario
  options.MultipartHeadersLengthLimit = int.MaxValue;
});


// Configurar Kestrel para permitir archivos más grandes
builder.WebHost.ConfigureKestrel(serverOptions =>
{
  serverOptions.Limits.MaxRequestBodySize = 10L * 1024 * 1024 * 1024; // 1GB en bytes
});

builder.Services.AddTransient<ITokenValidationService, TokenValidationService>();

// CONSULTAS
#region SEGURIDAD
builder.Services.AddTransient<IConsultasModulo, ConsultasModulo>();
builder.Services.AddTransient<IConsultasMenu, ConsultasMenu>();
builder.Services.AddTransient<IConsultasGrupoDato, ConsultasGrupoDato>();
builder.Services.AddTransient<IConsultasMarca, ConsultasMarca>();
#endregion SEGURIDAD

#region COMERCIAL
builder.Services.AddTransient<IConsultasPlantilla, ConsultasPlantilla>();
builder.Services.AddTransient<IConsultasCurso, ConsultasCurso>();
builder.Services.AddTransient<IConsultasContacto, ConsultasContacto>();
builder.Services.AddTransient<IConsultasClientes, ConsultasClientes>();
builder.Services.AddTransient<IConsultasSolicitudes, ConsultasSolicitudes>();

#endregion COMERCIAL

#region USUARIOS
builder.Services.AddTransient<IConsultasRoles, ConsultasRoles>();
builder.Services.AddTransient<IConsultasPermisos, ConsultasPermisos>();
builder.Services.AddTransient<IConsultasPersonas, ConsultasPersonas>();
#endregion

#region MANTENIMIENTOS
builder.Services.AddTransient<IConsultasGrupoDatoGD, ConsultasGrupoDatoGD>();
builder.Services.AddTransient<IConsultasModulosGD, ConsultasModulosGD>();
builder.Services.AddTransient<IConsultasEmpresas, ConsultasEmpresas>();
#endregion

#region MARCAS
builder.Services.AddTransient<IConsultasAIC, ConsultasAIC>();
#endregion

#region MARKETING
builder.Services.AddTransient<IConsultasAsistencia, ConsultasAsistencia>();
#endregion

#region LEGAL
builder.Services.AddTransient<IConsultasDocumentos, ConsultasDocumentos>();
builder.Services.AddTransient<IConsultasAbogados, ConsultasAbogados>();
#endregion

#region CANAL_DENUNCIAS
builder.Services.AddTransient<IConsultasConfiguracion, ConsultasConfiguracion>();
builder.Services.AddTransient<IConsultasDenuncias, ConsultasDenuncias>();
#endregion

#region CCFIRMA
builder.Services.AddTransient<IConsultasLibroReclamaciones, ConsultasLibroReclamaciones>();
#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
  // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
  app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();


app.UseRouting();
app.UseCors("MyPolicy");  // Asegúrate de que esta línea esté antes de UseAuthentication y UseAuthorization
app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.Run();

