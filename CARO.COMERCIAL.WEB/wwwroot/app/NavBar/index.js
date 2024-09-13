/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = { API: '/Layouts/Sections/Menu/Menu?handler' };

  // * TABLAS
  const NavBarCrud = {
    init: () => {},

    globales: () => {
      // * FORMULARIOS

    },
    variables: {},
    eventos: {
 
    },
    formularios: {
    },
    validaciones: {
    }
  };

  return {
    init: () => {
      NavBarCrud.init();
      NavBarCrud.globales();
    }
  };
};

executeView().init();
