/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Usuarios/Permisos/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler'
  };

  // * VARIABLES
  let permisosTable = 'permisosTable';
  let CpermisosTable = null;

  // * TABLAS
  const permisosCrud = {
    init: () => {
      permisosCrud.eventos.TABLEPERMISOS();
    },
    globales: () => {
      // * MODALES
      $('#modalAddPermiso').on('show.bs.modal', function (e) {
        configFormVal('AddPermiso', permisosCrud.validaciones.INSERT, () => permisosCrud.eventos.INSERT());
      });

      $('#modalEditPermiso').on('show.bs.modal', function (e) {
        configFormVal('EditPermiso', permisosCrud.validaciones.UPDATE, () => permisosCrud.eventos.UPDATE());
        func.actualizarForm('EditPermiso', permisosCrud.variables.rolEdit);
      });

      // * FORMULARIOS
      $(`#${permisosTable}`).on('click', '.edit-plantilla-button', function () {
        const data = CpermisosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el contacto seleccionado');
        permisosCrud.variables.rolEdit = data;
        $('#modalEditPermiso').modal('show');
      });

      $(`#${permisosTable}`).on('click', '.delete-plantilla-button', function () {
        const data = CpermisosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el rol seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar la plantilla?', {
          1: () => permisosCrud.eventos.DELETE(data.id)
        });
      });
    },
    variables: {
      rolEdit: {}
    },
    eventos: {
      TABLEPERMISOS: () => {
        $(`#${permisosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CpermisosTable) {
          CpermisosTable = $(`#${permisosTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(permisosTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'dscrpcn', title: 'Descripción' },
              { data: 'gdprmso', title: 'Abrev.' },
              { data: 'vsta', title: 'Vista' },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${
                    data.cestdo == 'A' ? 'Activo' : 'Inactivo'
                  }></i></span>`;
                }
              },
              { data: 'uedcn', title: 'U. Edición' },
              { data: null, title: 'F. Edición', render: data => func.formatFecha(data.fedcn, 'DD-MM-YYYY HH:mm a') },
              {
                data: null,
                title: '',
                className: 'text-center',
                render: data => {
                  return `<div class="d-flex justify-content-center m-0 p-0">
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-plantilla-button" title="Editar"><i class="bx bx-edit"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${permisosTable}`).find('.radio-buttons').length == 0) {
                $(`#${permisosTable}_filter`).append(radio_group_estados);

                $(`#${permisosTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${permisosTable}`).DataTable().ajax.reload();
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [
                {
                  extend: 'collection',
                  className: 'btn btn-label-secondary dropdown-toggle ms-2 me-0 mx-sm-3',
                  text: '<i class="bx bx-export me-2"></i>Exportar',
                  buttons: [
                    {
                      extend: 'pdf',
                      title: 'Suministros',
                      text: '<i class="bx bxs-file-pdf me-2"></i>Pdf',
                      className: 'dropdown-item',
                      exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                        format: {
                          body: function (data, row, column, node) {
                            return data;
                          }
                        }
                      }
                    }
                  ]
                }
              ];

              // AGREGAR al inicio PLANTILLA
              buttons.unshift({
                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                className: 'btn btn-label-primary btn-add-new',
                action: function (e, dt, node, config) {
                  $('#modalAddPermiso').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CpermisosTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('DSCRPCN', $('#AddPermiso #DSCRPCN').val());
        formData.append('GDPRMSO', $('#AddPermiso #GDPRMSO').val());
        formData.append('IDITM', $('#AddPermiso #IDITM').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el permiso']);
        $.ajax({
          url: uisApis.API + '=Add',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: function (data) {
            if (data?.codEstado > 0) {
              swalFire.success('Permiso registrado correctamente', '', {
                1: () => {
                  $('#modalAddPermiso').modal('hide');
                  CpermisosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el permiso')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', permisosCrud.variables.rolEdit.id);
        formData.append('DSCRPCN', $('#EditPermiso #DSCRPCN').val());
        formData.append('GDPRMSO', $('#EditPermiso #GDPRMSO').val());
        formData.append('IDITM', $('#EditPermiso #IDITM').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el Permiso']);
        $.ajax({
          url: uisApis.API + '=Update',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: function (data) {
            if (data?.codEstado > 0) {
              swalFire.success('Permiso actualizado correctamente', '', {
                1: () => {
                  $('#modalEditPermiso').modal('hide');
                  CpermisosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el permiso')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el Permiso']);
        $.ajax({
          url: uisApis.API + '=Delete',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: function (data) {
            if (data?.codEstado > 0) {
              swalFire.success('Permiso eliminado correctamente', '', {
                1: () => $(`#${permisosTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el permiso')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        GDPRMSO: agregarValidaciones({
          required: true,
          regexp: /^[a-zA-Z0-9]*$/
        }),
        IDITM: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        GDPRMSO: agregarValidaciones({
          required: true,
          regexp: /^[a-zA-Z0-9]*$/
        }),
        IDITM: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
      globalCrud.eventos.vistas();
    },
    eventos: {
      selects: () => {
        let GRUPODATOS = '';
        if (!GRUPODATOS) return;

        $.ajax({
          url: uisApis.GD + '=ObtenerAll',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'GET',
          data: {
            GDTOS: GRUPODATOS
          },
          success: function (response) {
            if (response?.data) {
              // todos los selects dentro EditPlantilla AddPlantilla, que no sea CESTDO
              let selects = document.querySelectorAll('#EditPlantilla select, #AddPlantilla select');
              selects = Array.from(selects).filter(select => select.getAttribute('name') != 'CESTDO');

              selects.forEach(select => {
                const name = select.getAttribute('name');
                const data = response.data.filter(d => d.gdpdre == name);
                select.innerHTML = `<option value="">-- Seleccione</option>`;

                if (data.length > 0) {
                  data.forEach(d => {
                    select.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
                  });
                }
              });
            }
          },
          error: error => swalFire.error('Ocurrió un error al cargar los módulos')
        });
      },
      vistas: () => {
        $.ajax({
          url: uisApis.API + '=Vistas',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'GET',
          success: function (response) {
            if (response?.data) {
              let selects = document.querySelectorAll('#AddPermiso #IDITM, #EditPermiso #IDITM');
              selects.forEach(select => {
                select.innerHTML = `<option value="">-- Seleccione</option>`;
                response.data.forEach(d => {
                  select.innerHTML += `<option value="${d.id}">${d.dscrpcn}</option>`;
                });
              });
            }
          },
          error: error => swalFire.error('Ocurrió un error al cargar las vistas')
        });
      }
    }
  };

  return {
    init: async () => {
      await func.limitarCaracteres();
      permisosCrud.init();
      permisosCrud.globales();
      globalCrud.init();
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
