using CARO.CORE.Structs;
using CARO.ENTIDAD.Modelo.Auditoria;
using MediatR;

namespace CARO.DATOS.EVENTOS.Comandos.COMERCIAL.GESTION.CLIENTE
{
    public class ComandoClienteXCasoInsertar : EntidadAuditoria, IRequest<RespuestaConsulta>
    {
        public string? RUC { get; set; } = null;
        public string? RZNSCL { get; set; } = null;
        public string? NMBRECMRCL { get; set; } = null;
        public string? RPRSNTNTE { get; set; } = null;
        public string? DRCCN { get; set; } = null;
        public string? TLFNO { get; set; } = null;
        public string? GDTMPOEMPRESA { get; set; } = null;
        public string? GDTIPOPRSNA { get; set; } = null;
        public string? GDSCTRINDSTRIA { get; set; } = null; 
        public string? CRREO { get; set; } = null;
        public string? GDEMPRSA { get; set; } = null;
        public DateTime? CDSDE { get; set; } = null;
    }
}
