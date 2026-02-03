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
            public const string ResetLogin = "SEG.USP_CRUD_MSTB01_UPDATE";
            public const string ListarUbigeos = "SEG.USP_LMSTB11_ListarUbigeos";
        }

        public static class CCFIRMA
        {
            public const string LibroReclamacionesCrud = "CCFIRMA.USP_CRUD_TLIBROR";
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
            public const string MailingsCrud = "COM.SP_GestionMailing";
            public const string EmailCrud = "COM.USP_CRUD_MCTB06";
            public const string ProfesoresCrud = "COM.USP_CRUD_MCTB08";
            public const string SponsorsCrud = "COM.USP_CRUD_MCTB09";
            public const string ClienteCrud = "COM.USP_CRUD_MCTB10";
            public const string SeguimientoCrud = "COM.USP_CRUD_MCTB11"; 
            public const string FormularioCrud = "COM.USP_CRUD_MCTB12";
            public const string FormularioCrudRespuesta = "COM.USP_CRUD_MCTB13";
            public const string ClienteXCasoCrud = "COM.USP_CRUD_MCTB18";
            public const string ContactoXClienteXCasoCrud = "COM.USP_CRUD_MCTB23";
            public const string EquiposXCasoCrud = "COM.USP_CRUD_MCTB19";
            public const string CasosCrud = "COM.USP_CRUD_MCTB20";
            public const string CasosHistoryCrud = "COM.USP_CRUD_MCTB24";
            public const string CasoMasivosCrud = "COM.USP_CRUD_MCTB26";
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

            public const string EmpreasCrud = "PER.USP_CRUD_MPTB00";
        }
        #endregion

        #region MARCAS
        public static class MARCAS
        {
            public const string CrudMarcasAIC = "PAG.USP_CRUD_MSTB00_AIC";
        }
        #endregion

        #region MARKETING
        public static class MARKETING
        {
            public const string CrudCalendario = "MKT.USP_CRUD_MMTB00";
            public const string CrudParticipantes = "MKT.USP_CRUD_MMTB01";
            public const string CrudAsistencia = "MKT.USP_CRUD_MMTB02";

        }
        #endregion

        #region LEGAL
        public static class LEGAL
        {
            public const string CrudDocumentos = "LEG.USP_CRUD_MLTB01";
            public const string CrudAbogados = "LEG.USP_CRUD_MLTB02";
            public const string CrudHorarios = "LEG.USP_CRUD_MLTB03";
            public const string CrudSolicitudes = "LEG.USP_CRUD_MLTB04";

        }
        #endregion

        #region CANAL_DENUNCIAS
        public static class CANALDENUNCIAS
        {
            public const string CrudConfiguracion = "CDN.USP_CRUD_MCDN00";
            public const string CrudReceptores = "CDN.USP_CRUD_MCDN02";
            public const string CrudDenuncias = "CDN.USP_CRUD_MCDN03";
            public const string CrudTestigos = "CDN.USP_CRUD_MCDN04";
            public const string CrudDocumentos = "CDN.USP_CRUD_MCDN05";
            public const string CrudChatDenuncia = "CDN.USP_CRUD_MCDN06";
            public const string CrudParametroDenuncia = "CDN.USP_CRUD_MCDN07";
            public const string CrudMovimientosDenuncia = "CDN.USP_CRUD_MCDN08";
            public const string CrudAcciones = "CDN.USP_CRUD_MCDN09";
            public const string CrudSolicitudes = "CDN.USP_CRUD_MCDN10";
        }
        #endregion
    }
}
