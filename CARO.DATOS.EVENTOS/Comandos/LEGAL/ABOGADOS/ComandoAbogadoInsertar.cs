using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CARO.DATOS.EVENTOS.Comandos.LEGAL.ABOGADOS
{
    public class ComandoAbogadoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public int? IDPRSNA { get; set; } = null;
        public string? NCLGTRA { get; set; } = null;
        public string? GDESPCLDD { get; set; } = null;
        public string? NLICNCIA { get; set; } = null;
 
    }
}
