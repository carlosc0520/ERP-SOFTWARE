namespace CARO.ENTIDAD
{
    [AttributeUsage(AttributeTargets.Class)]
    public class BaseDatosAttribute : Attribute
    {
        public string nombreTabla;
        public string esquema;
        public BaseDatosAttribute() { }
    }
}
