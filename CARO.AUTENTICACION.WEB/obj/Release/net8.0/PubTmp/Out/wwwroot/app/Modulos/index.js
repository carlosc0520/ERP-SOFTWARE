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
    init: () => { },

    globales: () => {
      // * MODULOS
      modulosCrud.eventos.CARGARMODULOS();
    },
    variables: {},
    eventos: {
      AUTENTICAR: () => {
        alert(1);
      },
      CARGARMODULOS: async () => {
        let token = await localStorage.getItem('accessToken');
        
        if (!token || ['null', 'undefined', ''].includes(token)) {
          modulosCrud.eventos.CARGARMODULOS();
          return;
        }

        swalFire.cargando(['Espere un momento', 'Estamos cargando los módulos']);
        let data = {
          length: 10000,
          start: 0,
          draw: 1,
          search: { value: '' },
          accessToken: token
        };
        await $.ajax({
          url: uisApis.MOD + '=Buscar&accessToken=' + token,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
          },
          headers: {
            'XSRF-TOKEN': token
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
            console.log(error)
            swalFire.error('Ocurrió un error al cargar los módulos');
          }
        });
      },
      HTMLMODULOS: data => {
        const modulosContainer = $('#modulos-container');
        modulosContainer.html('');

        data.forEach(modulo => {
          const moduloHtml = `
          <div class="col-md-3 col-lg-3 mb-3">
            <div class="card">
                <img class="card-img-top img-fluid" 
                width="100%" height="100"
                style="object-fit: cover!important;height: 300px!important;"
                src="${modulo?.fto}" alt="${modulo?.mdlo}">
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

        let butonLogin = `<div class="col-12 text-center">
          <a href="/Login" class="btn btn-outline-primary" id="btnLogin">
              Ir a Login
          </a>
        </div>`;

        modulosContainer.append(butonLogin);

        $("#btnLogin").off().on('click', function (e) {
          e.preventDefault();
          alert('cerrando sesion');
          window.location.href = '/Login';
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
