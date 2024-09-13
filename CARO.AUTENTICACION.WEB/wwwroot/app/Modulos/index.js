/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    MOD: '/Modulos/Index?handler'
  };

  // * TABLAS
  const modulosCrud = {
    init: () => {},

    globales: () => {
      // * FORMULARIOS
      //   modulosCrud.formularios.AUTENTICAR();

      // * MODULOS
      modulosCrud.eventos.CARGARMODULOS();
    },
    variables: {},
    eventos: {
      AUTENTICAR: () => {
        alert(1);
      },
      CARGARMODULOS: () => {
        swalFire.cargando(['Espere un momento', 'Estamos cargando los módulos']);
        let data = {
          length: 10000,
          start: 0,
          draw: 1,
          search: { value: '' }
        };
        $.ajax({
          url: uisApis.MOD + '=Buscar',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'GET',
          data: data,
          success: function (response) {
            if (response?.data) {
              modulosCrud.eventos.HTMLMODULOS(response.data);
              return;
            }

            swalFire.error('Ocurrió un error al cargar los módulos');
          },
          error: function (error) {
            swalFire.error('Ocurrió un error al cargar los módulos');
          }
        });
      },
      HTMLMODULOS: data => {
        const modulosContainer = $('#modulos-container');
        modulosContainer.html('');

        data.forEach(modulo => {
          const moduloHtml = `
          <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100">
                <img class="card-img-top" src="img${modulo?.img}" alt="Card image cap" />
                <div class="card-body mx-auto">
                    <a href="${modulo?.url}" class="btn btn-outline-primary">
                       Ir a ${modulo?.mdlo}
                    </a>
                </div>
            </div>
          </div>
          `;

          modulosContainer.append(moduloHtml);
        });

        swalFire.cerrar();
      }
    },
    formularios: {
      AUTENTICAR: () =>
        configFormVal('formAuthentication', modulosCrud.validaciones.AUTENTICAR, () => modulosCrud.eventos.AUTENTICAR())
    },
    validaciones: {
      AUTENTICAR: {
        EMAIL: agregarValidaciones({
          required: true
        }),
        PASSWORD: agregarValidaciones({
          required: true,
          minlength: 8
        })
      }
    }
  };

  return {
    init: () => {
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
