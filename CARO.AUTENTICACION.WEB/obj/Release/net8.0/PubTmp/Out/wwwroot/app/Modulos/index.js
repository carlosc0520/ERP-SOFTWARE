/**
 * MODULOS - Validación de Token
 */

'use strict';

const executeView = () => {
  const modulosCrud = {
    init: () => {},

    globales: () => {
      // Validar token y redirigir
      modulosCrud.eventos.VALIDAR_TOKEN();
    },

    eventos: {
      VALIDAR_TOKEN: async () => {
        let token = await localStorage.getItem('accessToken');
        
        // Mostrar spinner por 2 segundos antes de redirigir
        setTimeout(() => {
          // Si hay token, redirigir a Inicio
          if (token && !['null', 'undefined', ''].includes(token)) {
            window.location.href = '/Inicio';
            return;
          }

          // Si no hay token, redirigir a Login
          window.location.href = '/Login';
        }, 2000);
      }
    }
  };

  return {
    init: async () => {
      modulosCrud.init();
      modulosCrud.globales();
    }
  };
};


const useContext = async () => {
  $.ajax({
    url: '/Login/Index?handler=Validate&accessToken=' + localStorage.getItem('accessToken'),
    type: 'GET',
    success: data => (data?.success ? executeView().init() : (window.location.href = '/Login')),
    error: error => (window.location.href = '/Login')
  });
};

useContext();
