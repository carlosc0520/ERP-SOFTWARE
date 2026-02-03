namespace CARO.DATOS.MODELO.SEG.TAREA
{
    public class LogTareaEjecutadaModel
    {
        public int Id { get; set; }
        public string TipoTarea { get; set; }
        public DateTime FechaEjecucion { get; set; }
        public string DiaEjecucion { get; set; }
        public string HoraEjecucion { get; set; }
        public int CasosEncontrados { get; set; }
        public string CorreosEnviados { get; set; }
        public string Estado { get; set; }
        public string MensajeError { get; set; }
        public DateTime FechaCreacion { get; set; }

    }
}
