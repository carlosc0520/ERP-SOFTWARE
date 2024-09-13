/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Usuarios/Roles/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler'
  };

  // * VARIABLES
  let rolesTable = 'rolesTable';
  let permisosTable = 'permisosRolTable';
  let permisositemsTable = 'permisosItemsRolTable';
  let CrolesTable = null;
  let CpermisosTable = null;
  let CpermisositemsTable = null;

  // * TABLAS
  const rolesCrud = {
    init: () => {
      rolesCrud.eventos.TABLEROLES();
    },
    globales: () => {
      // * MODALES
      $('#modalAddRol').on('show.bs.modal', function (e) {
        configFormVal('AddRol', rolesCrud.validaciones.INSERT, () => rolesCrud.eventos.INSERT());
      });

      $('#modalEditRol').on('show.bs.modal', function (e) {
        configFormVal('EditRol', rolesCrud.validaciones.UPDATE, () => rolesCrud.eventos.UPDATE());
        func.actualizarForm('EditRol', rolesCrud.variables.rolEdit);
      });

      $('#modalAddPermisos').on('show.bs.modal', function (e) {
        redirect(true, 'navs-permisos', 1);
        rolesCrud.eventos.TABLEPERMISOS();
      });

      // * FORMULARIOS
      $(`#${rolesTable}`).on('click', '.edit-plantilla-button', function () {
        const data = CrolesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el contacto seleccionado');
        rolesCrud.variables.rolEdit = data;
        $('#modalEditRol').modal('show');
      });

      $(`#${rolesTable}`).on('click', '.view-plantilla-button', function () {
        let data = CrolesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el contacto seleccionado');
        rolesCrud.variables.rolEdit = data;
        $('#modalAddPermisos').modal('show');
      });

      $(`#${rolesTable}`).on('click', '.delete-plantilla-button', function () {
        const data = CrolesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el rol seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar la plantilla?', {
          1: () => rolesCrud.eventos.DELETE(data.id)
        });
      });

      $(`#${permisosTable}`).on('click', '.view-permiso-button', function () {
        let data = CpermisosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('El permiso aun no ha sido asignado');
        if (!data.prmso) return swalFire.error('El permiso esta desactivado');
        rolesCrud.variables.rolEditPermisos = data;
        redirect(true, 'navs-permisos-vista', 1);
      });
    },
    variables: {
      rolEdit: {},
      rolEditPermisos: {}
    },
    eventos: {
      TABLEROLES: () => {
        $(`#${rolesTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CrolesTable) {
          CrolesTable = $(`#${rolesTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(rolesTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'dscrpcn', title: 'Descripción' },
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
                        <button class="btn btn-sm btn-icon view-plantilla-button" title="Ver Detalle"><i class="bi bi-eye" style="font-size: 1.2rem"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${rolesTable}`).find('.radio-buttons').length == 0) {
                $(`#${rolesTable}_filter`).append(radio_group_estados);

                $(`#${rolesTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${rolesTable}`).DataTable().ajax.reload();
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
                  $('#modalAddRol').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CrolesTable.ajax.reload();
        }
      },
      TABLEPERMISOS: () => {
        $(`#${permisosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${permisosTable}_filter input[type="search"]`).val('');

        if (!CpermisosTable) {
          CpermisosTable = $(`#${permisosTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarPermisos',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(permisosTable);
                d.IDRLE = rolesCrud.variables.rolEdit.id;
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'dscrpcn', title: 'Descripción' },
              // check activado o inactivo
              {
                data: null,
                title: 'Permiso',
                className: 'text-center',
                render: data => {
                  return `
                    <label class="switch switch-square">
                        <input type="checkbox" class="switch-input" ${data.prmso ? 'checked' : ''}>
                        <span class="switch-toggle-slider">
                            <span class="switch-on"></span>
                            <span class="switch-off"></span>
                        </span>
                    </label>
                `;
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
                        <button class="btn btn-sm btn-icon view-permiso-button" title="Ver Permisos"><i class="bi bi-eye" style="font-size: 1.2rem"></i></button>
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
            // SI ACTALIZA EL CHECK ACTUALIZAR EN DATATABLE
            drawCallback: function (settings) {
              $('.switch-input').on('change', function () {
                let data = CpermisosTable.row($(this).parents('tr')).data();
                data.prmso = $(this).is(':checked');
              });
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];

              // AGREGAR al inicio PLANTILLA
              buttons.unshift({
                // GUARDAR
                text: '<i class="bx bx-save me-0 me-md-2"></i><span class="d-none d-md-inline-block">Guardar</span>',
                className: 'btn btn-label-primary btn-add-new',
                action: function (e, dt, node, config) {
                  rolesCrud.eventos.UPDATEPERMISOS();
                }
              });

              return buttons;
            })()
          });
        } else {
          CpermisosTable.ajax.reload();
        }
      },
      TABLEPERMISOSITEMS: () => {
        $(`#${permisositemsTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${permisositemsTable}_filter input[type="search"]`).val('');

        if (!CpermisositemsTable) {
          CpermisositemsTable = $(`#${permisositemsTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarPermisosItems',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(permisositemsTable);
                d.IDRGSTR = rolesCrud.variables.rolEditPermisos.id;
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'dscrpcn', title: 'Descripción' },
              { data: 'gdprmso', title: 'Abrev.' },
              {
                data: null,
                title: 'Permiso',
                className: 'text-center',
                render: data => {
                  return `
                    <label class="switch switch-square">
                        <input type="checkbox" class="switch-input" ${data.prmso ? 'checked' : ''}>
                        <span class="switch-toggle-slider">
                            <span class="switch-on"></span>
                            <span class="switch-off"></span>
                        </span>
                    </label>
                `;
                }
              },
              { data: 'uedcn', title: 'U. Edición' },
              { data: null, title: 'F. Edición', render: data => func.formatFecha(data.fedcn, 'DD-MM-YYYY HH:mm a') }
            ],
            initComplete: function (settings, json) {
              if ($(`#${permisositemsTable}`).find('.radio-buttons').length == 0) {
                $(`#${permisositemsTable}_filter`).append(radio_group_estados);

                $(`#${permisositemsTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${permisositemsTable}`).DataTable().ajax.reload();
                });
              }
            },
            // SI ACTALIZA EL CHECK ACTUALIZAR EN DATATABLE
            drawCallback: function (settings) {
              $('.switch-input').on('change', function () {
                let data = CpermisositemsTable.row($(this).parents('tr')).data();
                data.prmso = $(this).is(':checked');
              });
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];

              // AGREGAR al inicio PLANTILLA
              buttons.unshift({
                // GUARDAR
                text: '<i class="bx bx-save me-0 me-md-2"></i><span class="d-none d-md-inline-block">Guardar</span>',
                className: 'btn btn-label-primary btn-add-new',
                action: function (e, dt, node, config) {
                  rolesCrud.eventos.UPDATEPERMISOSITEMS();
                }
              });

              return buttons;
            })()
          });
        } else {
          CpermisositemsTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('DSCRPCN', $('#AddRol #DSCRPCN').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el Rol']);
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
              swalFire.success('Rol registrado correctamente', '', {
                1: () => {
                  $('#modalAddRol').modal('hide');
                  CrolesTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el contacto')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', rolesCrud.variables.rolEdit.id);
        formData.append('DSCRPCN', $('#EditRol #DSCRPCN').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el Rol']);
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
              swalFire.success('Rol actualizado correctamente', '', {
                1: () => {
                  $('#modalEditRol').modal('hide');
                  CrolesTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el contacto')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el rol']);
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
              swalFire.success('Rol eliminado correctamente', '', {
                1: () => $(`#${rolesTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el contacto')
        });
      },
      UPDATEPERMISOS: () => {
        let data = CpermisosTable.rows().data().toArray();
        let datos = [];
        data.forEach(d => {
          let item = {
            ID: d?.id || 0,
            IDRLE: rolesCrud.variables.rolEdit.id,
            IDITM: d.iditm,
            PRMSO: d.prmso,
            CESTDO: 'A'
          };

          datos.push(item);
        });

        datos = datos.filter(d => d.PRMSO != null);

        let formData = new FormData();
        formData.append('DATA', JSON.stringify(datos));
        swalFire.cargando(['Espere un momento', 'Estamos actualizando los permisos']);
        $.ajax({
          url: uisApis.API + '=AddPermisos',
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
              swalFire.success('Permisos actualizados correctamente', '', {
                1: () => {
                  //   $('#modalAddPermisos').modal('hide');
                  CpermisosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar los permisos')
        });
      },
      UPDATEPERMISOSITEMS: () => {
        let data = CpermisositemsTable.rows().data().toArray();
        let datos = [];
        data.forEach(d => {
          let item = {
            ID: d?.id || 0,
            IDRGSTR: rolesCrud.variables.rolEditPermisos.id,
            IDPRMSO: d.idprmso,
            PRMSO: d.prmso,
            CESTDO: 'A'
          };

          datos.push(item);
        });

        datos = datos.filter(d => d.PRMSO != null);

        let formData = new FormData();
        formData.append('DATA', JSON.stringify(datos));
        swalFire.cargando(['Espere un momento', 'Estamos actualizando los permisos']);
        $.ajax({
          url: uisApis.API + '=AddPermisosItems',
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
              swalFire.success('Permisos items actualizados correctamente', '', {
                1: () => {
                  CpermisositemsTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar los permisos items')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DSCRPCN: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        DSCRPCN: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
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
      }
    }
  };

  return {
    init: () => {
      rolesCrud.init();
      rolesCrud.globales();

      globalCrud.init();

      var myTabs = document.querySelectorAll('.nav-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');

          if (tabPane === '#navs-permisos') {
            rolesCrud.eventos.TABLEPERMISOS();
            redirect(false, 'navs-permisos-vista', 0);
          }

          if (tabPane === '#navs-permisos-vista') {
            rolesCrud.eventos.TABLEPERMISOSITEMS();
          }
        });
      });
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
