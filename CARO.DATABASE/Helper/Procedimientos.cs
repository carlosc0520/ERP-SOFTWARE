namespace CARO.DATABASE.Helper
{
    public static class Procedimientos
    {
     
        public static class SEGURIDAD
        {
            public const string ModulosCrud = "SEG.USP_CRUD_MSTB00";
            public const string GrupoDatoCrud = "SEG.USP_CRUD_MSTB05";
            public const string MarcasCrud = "PER.USP_CRUD_MPTB00";
            public const string LoginCrud = "SEG.USP_CRUD_MSTB01";
        }

        public static class MENU
        {
            public const string MenuCrud = "SEG.USP_CRUD_MSTB02";
        }

        #region COMERCIAL
        public static class COMERCIAL
        {
            public const string PlantillaCrud = "COM.USP_CRUD_MCTB01";
            public const string CursoCrud = "COM.USP_CRUD_MCTB02";
            public const string DetalleCursoCrud = "COM.USP_CRUD_MCTB03";
            public const string ContactosCrud = "COM.USP_CRUD_MCTB05";
            public const string EmailCrud = "COM.USP_CRUD_MCTB06";
        }
        #endregion

        #region USUARIO
        public static class USUARIO
        {
            public const string RolesCrud = "SEG.USP_CRUD_MSTB06";
            public const string ActualizarRoles = "SEG.USP_CRUD_MSTB07";

            public const string PermisosCrud = "SEG.USP_CRUD_MSTB08";
            public const string ActualizarPermisosItems = "SEG.USP_CRUD_MSTB09";

            public const string PersonasCrud = "PER.USP_CRUD_MPTB01";
        }
        #endregion

        #region MANTENIMIENTOS
        public static class MANTENIMIENTOS
        {
            public const string GrupoDatoCrud = "SEG.USP_CRUD_MSTB04";
            public const string GrupoDatoDetCrud = "SEG.USP_CRUD_MSTB05D";

            public const string ModulosCrud = "SEG.USP_CRUD_MSTB00D";
            public const string SubModulosCrud = "SEG.USP_CRUD_MSTB02D";
            public const string DetSubModulosCrud = "SEG.USP_CRUD_MSTB03D";

        }
        #endregion
    }
}
