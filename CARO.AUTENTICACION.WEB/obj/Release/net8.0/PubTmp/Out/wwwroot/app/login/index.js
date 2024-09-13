/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = { LOG: '/Login/Index?handler' };

  // * TABLAS
  const loginCrud = {
    init: () => {},

    globales: () => {
      // * FORMULARIOS
      loginCrud.formularios.AUTENTICAR();
    },
    variables: {},
    eventos: {
      AUTENTICAR: () => {
        swalFire.cargando(['Espere un momento', 'Estamos autenticando']);
        let formData = new FormData();
        formData.append('USRIO', $('#USRIO').val());
        formData.append('PSWORD', $('#PSWORD').val());

        $.ajax({
          url: uisApis.LOG + '=Login',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: function (data) {
            if(data?.succeeded){
              swalFire.success('Éxito', 'Autenticación exitosa', {
                1: () => {
                  localStorage.setItem('accessToken', data.accessToken);
                  window.location.href = '/Modulos?accessToken=' + data.accessToken
                }
              });
              return;
            }

            swalFire.error('Error', 'Ocurrió un error al autenticar');
          },
          error: data => swalFire.error('Error', 'Ocurrió un error al autenticar')
        });

        // window.location.href = '/Modulos';
      }
    },
    formularios: {
      AUTENTICAR: () =>
        configFormVal('formAuthentication', loginCrud.validaciones.AUTENTICAR, () => loginCrud.eventos.AUTENTICAR())
    },
    validaciones: {
      AUTENTICAR: {
        USRIO: agregarValidaciones({
          required: true
        }),
        PSWORD: agregarValidaciones({
          required: true,
          minlength: 8
        })
      }
    }
  };

  return {
    init: () => {
      loginCrud.init();
      loginCrud.globales();
    }
  };
};

executeView().init();
