using CARO.ENTIDAD.Modelo.Auditoria;

namespace CARO.DATOS.MODELO.COM.PLANTILLA
{
    public class PlantillaModel : EntidadAuditoria
    {
        public string? DSCRPCN { get; set; } = null;
        public string? DTLLE { get; set; } = null;
        public string? GDTPODCMNTO { get; set; } = null;
        public string? DGDTPODCMNTO { get; set; } = null;
        public string? RTA { get; set; } = null;
        public string? RTAPLNTLLA { get; set; } = null;
    }

    public class ProveedorPlantillaModel : EntidadAuditoria
    {
     
        public string? DAY { get; set; } = null;
        public string? UBICATION { get; set; } = null;
        public string? ONTH { get; set; } = null;
        public string? YEAR { get; set; } = null;
        public string? AFF { get; set; } = null;
        public string? USERNAME { get; set; } = null;
        public string? RZNSCL { get; set; } = null;
        public string? NAF { get; set; } = null;
        public string? NIF { get; set; } = null;
        public string? AFAF { get; set; } = null;
        public string? DALE { get; set; } = null;
        public string? DALA { get; set; } = null;
        public string? NUMI { get; set; } = null;
        public string? NOMBRES { get; set; } = null;
        public string? CORREO { get; set; } = null;
        public string? MOVIL { get; set; } = null;
        public string? STAPLICABLE { get; set; } = null;
        public string? STINTERESADO { get; set; } = null;
        public string? STTRATAMIENTO { get; set; } = null;
        public string? STTRANSFERENCIA { get; set; } = null;
        public TableAplicable? TAPLICABLE { get; set; } =  new TableAplicable();
        public TableInteresado? TINTERESADO { get; set; } = new TableInteresado();
        public TableTratamiento? TTRATAMIENTO { get; set; } = new TableTratamiento();
        public TableTraferencia? TTRANSFERENCIA { get; set; } = new TableTraferencia();

    }

    public class TableAplicable
    {
        public string? A1 { get; set; } = null;
        public string? A2 { get; set; } = null;
        public string? A3 { get; set; } = null;
        public string? A4 { get; set; } = null;
        public string? A5 { get; set; } = null;
        public string? A6 { get; set; } = null;
        public string? A7 { get; set; } = null;
        public string? A8 { get; set; } = null;
        public string? A9 { get; set; } = null;
        public string? A10 { get; set; } = null;

        public string? B1 { get; set; } = null;
        public string? B2 { get; set; } = null;
        public string? B3 { get; set; } = null;
        public string? B4 { get; set; } = null;
        public string? B5 { get; set; } = null;
        public string? B6 { get; set; } = null;
        public string? B7 { get; set; } = null;
        public string? B8 { get; set; } = null;
        public string? B9 { get; set; } = null;
        public string? B10 { get; set; } = null;

        public string? C1 { get; set; } = null;
        public string? C2 { get; set; } = null;
        public string? C3 { get; set; } = null;
        public string? C4 { get; set; } = null;
        public string? C5 { get; set; } = null;
        public string? C6 { get; set; } = null;
        public string? C7 { get; set; } = null;
        public string? C8 { get; set; } = null;
        public string? C9 { get; set; } = null;
        public string? C10 { get; set; } = null;

        public string? D1 { get; set; } = null;
        public string? D2 { get; set; } = null;
        public string? D3 { get; set; } = null;
        public string? D4 { get; set; } = null;
        public string? D5 { get; set; } = null;
        public string? D6 { get; set; } = null;
        public string? D7 { get; set; } = null;
        public string? D8 { get; set; } = null;
        public string? D9 { get; set; } = null;
        public string? D10 { get; set; } = null;

        public string? E1 { get; set; } = null;
        public string? E2 { get; set; } = null;
        public string? E3 { get; set; } = null;
        public string? E4 { get; set; } = null;
        public string? E5 { get; set; } = null;
        public string? E6 { get; set; } = null;
        public string? E7 { get; set; } = null;
        public string? E8 { get; set; } = null;
        public string? E9 { get; set; } = null;
        public string? E10 { get; set; } = null;

        public string? F1 { get; set; } = null;
        public string? F2 { get; set; } = null;
        public string? F3 { get; set; } = null;
        public string? F4 { get; set; } = null;
        public string? F5 { get; set; } = null;
        public string? F6 { get; set; } = null;
        public string? F7 { get; set; } = null;
        public string? F8 { get; set; } = null;
        public string? F9 { get; set; } = null;
        public string? F10 { get; set; } = null;

        public string? G1 { get; set; } = null;
        public string? G2 { get; set; } = null;
        public string? G3 { get; set; } = null;
        public string? G4 { get; set; } = null;
        public string? G5 { get; set; } = null;
        public string? G6 { get; set; } = null;
        public string? G7 { get; set; } = null;
        public string? G8 { get; set; } = null;
        public string? G9 { get; set; } = null;
        public string? G10 { get; set; } = null;

        public string? H1 { get; set; } = null;
        public string? H2 { get; set; } = null;
        public string? H3 { get; set; } = null;
        public string? H4 { get; set; } = null;
        public string? H5 { get; set; } = null;
        public string? H6 { get; set; } = null;
        public string? H7 { get; set; } = null;
        public string? H8 { get; set; } = null;
        public string? H9 { get; set; } = null;
        public string? H10 { get; set; } = null;

        public string? I1 { get; set; } = null;
        public string? I2 { get; set; } = null;
        public string? I3 { get; set; } = null;
        public string? I4 { get; set; } = null;
        public string? I5 { get; set; } = null;
        public string? I6 { get; set; } = null;
        public string? I7 { get; set; } = null;
        public string? I8 { get; set; } = null;
        public string? I9 { get; set; } = null;
        public string? I10 { get; set; } = null;

        public string? J1 { get; set; } = null;
        public string? J2 { get; set; } = null;
        public string? J3 { get; set; } = null;
        public string? J4 { get; set; } = null;
        public string? J5 { get; set; } = null;
        public string? J6 { get; set; } = null;
        public string? J7 { get; set; } = null;
        public string? J8 { get; set; } = null;
        public string? J9 { get; set; } = null;
        public string? J10 { get; set; } = null;

        public string? K1 { get; set; } = null;
        public string? K2 { get; set; } = null;
        public string? K3 { get; set; } = null;
        public string? K4 { get; set; } = null;
        public string? K5 { get; set; } = null;
        public string? K6 { get; set; } = null;
        public string? K7 { get; set; } = null;
        public string? K8 { get; set; } = null;
        public string? K9 { get; set; } = null;
        public string? K10 { get; set; } = null;

        public string? L1 { get; set; } = null;
        public string? L2 { get; set; } = null;
        public string? L3 { get; set; } = null;
        public string? L4 { get; set; } = null;
        public string? L5 { get; set; } = null;
        public string? L6 { get; set; } = null;
        public string? L7 { get; set; } = null;
        public string? L8 { get; set; } = null;
        public string? L9 { get; set; } = null;
        public string? L10 { get; set; } = null;

        public string? M1 { get; set; } = null;
        public string? M2 { get; set; } = null;
        public string? M3 { get; set; } = null;
        public string? M4 { get; set; } = null;
        public string? M5 { get; set; } = null;
        public string? M6 { get; set; } = null;
        public string? M7 { get; set; } = null;
        public string? M8 { get; set; } = null;
        public string? M9 { get; set; } = null;
        public string? M10 { get; set; } = null;
    }
    public class TableInteresado
    {
        public string? TA1 {get; set; } = null;
        public string? TA2 {get; set; } = null;
        public string? TA3 {get; set; } = null;
        public string? TA4 {get; set; } = null;
        public string? TA5 {get; set; } = null;
        public string? TA6 {get; set; } = null;
        public string? TA7 {get; set; } = null;
        public string? TA8 { get; set; } = null;
    }
    public class TableTratamiento
    {
        public string? TRA1 { get; set; } = null;
        public string? TRA2 { get; set; } = null;
        public string? TRA3 { get; set; } = null;
        public string? TRA4  { get; set; } = null;
        public string? TRA5  { get; set; } = null;
        public string? TRA6  { get; set; } = null;
        public string? TRA7  { get; set; } = null;
        public string? TRA8  { get; set; } = null;
        public string? TRA9 { get; set; } = null;
        public string? TRA10 { get; set; } = null;
        public string? TRA11 { get; set; } = null;
        public string? TRA12 { get; set; } = null;

    }
    public class TableTraferencia
    {
        public string? TIA1 { get; set; } = null;
        public string? TIA2 { get; set; } = null;
        public string? TIA3 { get; set; } = null;
        public string? TIA4 { get; set; } = null;
        public string? TIA5 { get; set; } = null;
        public string? TIA6 { get; set; } = null;
        public string? TIA7 { get; set; } = null;
        public string? TIA8  { get; set; } = null;
        public string? TIA9 { get; set; } = null;
        public string? TIA10  { get; set; } = null;
        public string? TIA11  { get; set; } = null;
        public string? TIA12  { get; set; } = null;
        public string? TIA13 { get; set; } = null;
        public string? TIA14 { get; set; } = null;
        public string? TIA15 { get; set; } = null;
        public string? TIA16 { get; set; } = null;
        public string? TIA17 { get; set; } = null;
        public string? TIA18 { get; set; } = null;
    }
}
