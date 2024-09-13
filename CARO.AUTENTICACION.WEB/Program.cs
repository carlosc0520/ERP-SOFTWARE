using System.Reflection;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CARO.CONFIG;
using Microsoft.AspNetCore.Http.Features;
using CARO.DATOS.CONSULTAS.SEG;
using CARO.DATOS.CONSULTAS.COM;
using CARO.DATOS.CONSULTAS.USUARIOS;
using CARO.DATOS.CONSULTAS.MANTENIMIENTOS;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

// Add services to the container.
builder.Services.AddRazorPages();
//builder.Services.AddScoped<CustomPageFilter>();

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
  options.ValueLengthLimit = int.MaxValue;
  options.MultipartBodyLengthLimit = 1L * 1024 * 1024 * 1024; // 1GB en bytes
  options.MultipartHeadersLengthLimit = int.MaxValue;
});

// Configurar Kestrel para permitir archivos más grandes
builder.WebHost.ConfigureKestrel(serverOptions =>
{
  serverOptions.Limits.MaxRequestBodySize = 1L * 1024 * 1024 * 1024; // 1GB en bytes
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
#endregion COMERCIAL

#region USUARIOS
builder.Services.AddTransient<IConsultasRoles, ConsultasRoles>();
builder.Services.AddTransient<IConsultasPermisos, ConsultasPermisos>();
builder.Services.AddTransient<IConsultasPersonas, ConsultasPersonas>();
#endregion

#region MANTENIMIENTOS
builder.Services.AddTransient<IConsultasGrupoDatoGD, ConsultasGrupoDatoGD>();
builder.Services.AddTransient<IConsultasModulosGD, ConsultasModulosGD>();
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
app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.Run();

