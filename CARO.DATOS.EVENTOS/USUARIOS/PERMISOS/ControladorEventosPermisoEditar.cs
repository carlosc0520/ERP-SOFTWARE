﻿using Dapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using CARO.CORE.Structs;
using CARO.DATABASE.Helper;
using CARO.DATABASE;
using CARO.DATOS.EVENTOS.Comandos.USUARIOS.PERMISOS;

namespace CARO.DATOS.EVENTOS.USUARIOS.PERMISOS
{
    public class ControladorEventosPermisoEditar : IRequestHandler<ComandoPermisoEditar, RespuestaConsulta>
    {
        private readonly IConfiguration _configuration;

        public ControladorEventosPermisoEditar(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<RespuestaConsulta> Handle(ComandoPermisoEditar entidad, CancellationToken cancellationToken)
        {
            var parametros = new DynamicParameters();
            var json = JsonSerializer.Serialize(new
            {
                ID = entidad.ID,
                DSCRPCN = entidad.DSCRPCN,
                IDITM = entidad.IDITM,
                GDPRMSO = entidad.GDPRMSO,
                CESTDO = entidad.CESTDO
            });

            parametros.Add("@p_cData", json);
            parametros.Add("@p_cUser", entidad.UEDCN);
            parametros.Add("@p_nTipo", 1);
            parametros.Add("@p_nId", entidad.ID);

            var conexionSql = _configuration.GetConnectionString("DefaultConnection");
            return await FuncionesSql.EjecutarProcedimiento(conexionSql, Procedimientos.USUARIO.PermisosCrud, parametros);
        }
    }
}
