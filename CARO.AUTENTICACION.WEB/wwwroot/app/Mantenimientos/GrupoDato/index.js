/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Mantenimientos/GrupoDato/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler'
  };

  // * VARIABLES
  let grupoDatoTable = 'grupoDatoTable';
  let detalleGrupoDatoTable = 'detalleGrupoDatoTable';
  let CgrupoDatoTable = null;
  let CdetalleGrupoDatoTable = null;

  // * TABLAS
  const grupoDatoCrud = {
    init: () => {
      grupoDatoCrud.eventos.TABLEGRUPODATO();
    },
    globales: () => {
      // * MODALES
      $('#modalAddGrupoDato').on('show.bs.modal', function (e) {
        configFormVal('AddGrupoDato', grupoDatoCrud.validaciones.INSERT, () => grupoDatoCrud.eventos.INSERT());
      });

      $('#modalEditGrupoDato').on('show.bs.modal', function (e) {
        configFormVal('EditGrupoDato', grupoDatoCrud.validaciones.UPDATE, () => grupoDatoCrud.eventos.UPDATE());
        func.actualizarForm('EditGrupoDato', grupoDatoCrud.variables.rolEdit);
      });

      // * FORMULARIOS
      $(`#${grupoDatoTable}`).on('click', '.edit-grupodato-button', function () {
        const data = CgrupoDatoTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el grupo dato seleccionado');
        grupoDatoCrud.variables.rolEdit = data;
        $('#modalEditGrupoDato').modal('show');
      });

      $(`#${grupoDatoTable}`).on('click', '.delete-grupodato-button', function () {
        const data = CgrupoDatoTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el grupo dato seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el grupo dato?', {
          1: () => grupoDatoCrud.eventos.DELETE(data.id)
        });
      });

      $(`#${grupoDatoTable}`).on('click', '.view-grupodato-button', function () {
        const data = CgrupoDatoTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el grupo dato seleccionado');
        grupoDatoCrud.variables.rolEdit = data;
        redirect(true, 'navs-detalle-gd', data.id);
      });
    },
    variables: {
      rolEdit: {}
    },
    eventos: {
      TABLEGRUPODATO: () => {
        $(`#${grupoDatoTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CgrupoDatoTable) {
          CgrupoDatoTable = $(`#${grupoDatoTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(grupoDatoTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'dgdtlle', title: 'Descripción' },
              { data: 'dtlle', title: 'Abrev.' },
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
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-grupodato-button" title="Editar"><i class="bx bx-edit"></i></button>
                        <button name="ELIMINAR" class="btn btn-sm btn-icon delete-grupodato-button" title="Eliminar"><i class="bx bx-trash"></i></button>
                        <button name="VER" class="btn btn-sm btn-icon view-grupodato-button" title="Ver"><i class="bx bx-show"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${grupoDatoTable}`).find('.radio-buttons').length == 0) {
                $(`#${grupoDatoTable}_filter`).append(radio_group_estados);

                $(`#${grupoDatoTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${grupoDatoTable}`).DataTable().ajax.reload();
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
                  $('#modalAddGrupoDato').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CgrupoDatoTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('DGDTLLE', $('#AddGrupoDato #DGDTLLE').val());
        formData.append('GDTPO', $('#AddGrupoDato #GDTPO').val());
        formData.append('DTLLE', $('#AddGrupoDato #DTLLE').val());
        formData.append('VLR1', $('#AddGrupoDato #VLR1').val());
        formData.append('VLR2', $('#AddGrupoDato #VLR2').val());
        formData.append('CESTDO', $('#AddGrupoDato #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el grupo dato']);
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
              swalFire.success('Grupo dato registrado correctamente', '', {
                1: () => {
                  $('#modalAddGrupoDato').modal('hide');
                  CgrupoDatoTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el grupo dato')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', grupoDatoCrud.variables.rolEdit.id);
        formData.append('DGDTLLE', $('#EditGrupoDato #DGDTLLE').val());
        formData.append('GDTPO', $('#EditGrupoDato #GDTPO').val());
        formData.append('DTLLE', $('#EditGrupoDato #DTLLE').val());
        formData.append('VLR1', $('#EditGrupoDato #VLR1').val());
        formData.append('VLR2', $('#EditGrupoDato #VLR2').val());
        formData.append('CESTDO', $('#EditGrupoDato #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el Grupo Dato']);
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
              swalFire.success('Grupo Dato actualizado correctamente', '', {
                1: () => {
                  $('#modalEditGrupoDato').modal('hide');
                  CgrupoDatoTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el Grupo Dato')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el Grupo Dato']);
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
              swalFire.success('Grupo Dato eliminado correctamente', '', {
                1: () => $(`#${grupoDatoTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el Grupo Dato')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DGDTLLE: agregarValidaciones({
          required: true
        }),
        GDTPO: agregarValidaciones({
          required: true
        }),
        DTLLE: agregarValidaciones({
          required: true
        }),
        VLR1: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        DGDTLLE: agregarValidaciones({
          required: true
        }),
        GDTPO: agregarValidaciones({
          required: true
        }),
        DTLLE: agregarValidaciones({
          required: true
        }),
        VLR1: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const detalleGrupoDatoCrud = {
    init: () => {
      detalleGrupoDatoCrud.eventos.TABLEGRUPODATODETALLE();
    },
    globales: () => {
      // * MODALES
      $('#modalAddDetGrupoDato').on('show.bs.modal', function (e) {
        configFormVal('AddDetGrupoDato', detalleGrupoDatoCrud.validaciones.INSERT, () =>
          detalleGrupoDatoCrud.eventos.INSERT()
        );
        $('#AddDetGrupoDato #GDPDRE').val(grupoDatoCrud.variables.rolEdit.dtlle);
      });

      $('#modalEditDetGrupoDato').on('show.bs.modal', function (e) {
        configFormVal('EditDetGrupoDato', detalleGrupoDatoCrud.validaciones.UPDATE, () =>
          detalleGrupoDatoCrud.eventos.UPDATE()
        );
        func.actualizarForm('EditDetGrupoDato', detalleGrupoDatoCrud.variables.rolEdit);
      });

      // * FORMULARIOS
      $(`#${detalleGrupoDatoTable}`).on('click', '.edit-grupodato-button', function () {
        const data = CdetalleGrupoDatoTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del grupo dato seleccionado');
        detalleGrupoDatoCrud.variables.rolEdit = data;
        $('#modalEditDetGrupoDato').modal('show');
      });

      $(`#${detalleGrupoDatoTable}`).on('click', '.delete-grupodato-button', function () {
        const data = CdetalleGrupoDatoTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del grupo dato seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el detalle del grupo dato?', {
          1: () => detalleGrupoDatoCrud.eventos.DELETE(data.id)
        });
      });
    },
    variables: {
      rolEdit: {}
    },
    eventos: {
      TABLEGRUPODATODETALLE: () => {
        $(`#${detalleGrupoDatoTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${detalleGrupoDatoTable}_title`).text('GRUPO DATO: ' + grupoDatoCrud.variables.rolEdit?.dgdtlle || '');

        if (!CdetalleGrupoDatoTable) {
          CdetalleGrupoDatoTable = $(`#${detalleGrupoDatoTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarDetalle',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.GDPDRE = grupoDatoCrud.variables.rolEdit.dtlle;
                d.CESTDO = func.obtenerCESTDO(detalleGrupoDatoTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'dtlle', title: 'Descripción' },
              { data: null, title: 'Valor 1', className: 'text-center', render: data => data?.vlR1 || '' },
              { data: null, title: 'Valor 2', className: 'text-center', render: data => data?.vlR2 || '' },
              { data: null, title: 'Valor 3', className: 'text-center', render: data => data?.vlR3 || '' },
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
                          <button name="EDITAR" class="btn btn-sm btn-icon edit-grupodato-button" title="Editar"><i class="bx bx-edit"></i></button>
                          <button name="ELIMINAR" class="btn btn-sm btn-icon delete-grupodato-button" title="Eliminar"><i class="bx bx-trash"></i></button>
                       </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${detalleGrupoDatoTable}`).find('.radio-buttons').length == 0) {
                $(`#${detalleGrupoDatoTable}_filter`).append(radio_group_estados);

                $(`#${detalleGrupoDatoTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${detalleGrupoDatoTable}`).DataTable().ajax.reload();
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
                  $('#modalAddDetGrupoDato').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CdetalleGrupoDatoTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('GDPDRE', $('#AddDetGrupoDato #GDPDRE').val());
        formData.append('DTLLE', $('#AddDetGrupoDato #DTLLE').val());
        formData.append('VLR1', $('#AddDetGrupoDato #VLR1').val());
        formData.append('VLR2', $('#AddDetGrupoDato #VLR2').val());
        formData.append('VLR3', $('#AddDetGrupoDato #VLR3').val());
        formData.append('VLR4', $('#AddDetGrupoDato #VLR4').val());
        formData.append('CESTDO', $('#AddDetGrupoDato #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el detalle del grupo dato']);
        $.ajax({
          url: uisApis.API + '=AddDetalle',
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
              swalFire.success('Detalle de Grupo dato registrado correctamente', '', {
                1: () => {
                  $('#modalAddDetGrupoDato').modal('hide');
                  CdetalleGrupoDatoTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al agregar el detalle del grupo dato')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', detalleGrupoDatoCrud.variables.rolEdit.id);
        formData.append('GDPDRE', detalleGrupoDatoCrud.variables.rolEdit.gdpdre);
        formData.append('DTLLE', $('#EditDetGrupoDato #DTLLE').val());
        formData.append('VLR1', $('#EditDetGrupoDato #VLR1').val());
        formData.append('VLR2', $('#EditDetGrupoDato #VLR2').val());
        formData.append('VLR3', $('#EditDetGrupoDato #VLR3').val());
        formData.append('VLR4', $('#EditDetGrupoDato #VLR4').val());
        formData.append('CESTDO', $('#EditDetGrupoDato #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el detalle del Grupo Dato']);
        $.ajax({
          url: uisApis.API + '=UpdateDetalle',
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
              swalFire.success('Detalle de Grupo Dato actualizado correctamente', '', {
                1: () => {
                  $('#modalEditDetGrupoDato').modal('hide');
                  CdetalleGrupoDatoTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al actualizar el detalle del Grupo Dato')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el Grupo Dato']);
        $.ajax({
          url: uisApis.API + '=DeleteDetalle',
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
              swalFire.success('Grupo Dato eliminado correctamente', '', {
                1: () => $(`#${detalleGrupoDatoTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el Grupo Dato')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        GDPDRE: agregarValidaciones({
          required: true
        }),
        DGDTLLE: agregarValidaciones({
          required: true
        }),
        GDTPO: agregarValidaciones({
          required: true
        }),
        DTLLE: agregarValidaciones({
          required: true
        }),
        VLR1: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        DGDTLLE: agregarValidaciones({
          required: true
        }),
        GDTPO: agregarValidaciones({
          required: true
        }),
        DTLLE: agregarValidaciones({
          required: true
        }),
        VLR1: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
      //   globalCrud.eventos.selects2();
    },
    eventos: {
      selects: () => {
        let GRUPODATOS = 'GDTPO';
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
              let selects = document.querySelectorAll("select");
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
      selects2: () => {
        let GDTPO = [
          { dtlle: 'Grupo Dato', vlr1: 'G' },
          { dtlle: 'Parametro', vlr1: 'P' }
        ];

        let selects = document.querySelectorAll('#EditGrupoDato select, #AddGrupoDato select');
        selects = Array.from(selects).filter(select => select.getAttribute('name') == 'GDTPO');

        selects.forEach(select => {
          select.innerHTML = `<option value="">-- Seleccione</option>`;

          if (GDTPO.length > 0) {
            GDTPO.forEach(d => {
              select.innerHTML += `<option value="${d.vlr1}">${d.dtlle}</option>`;
            });
          }
        });
      }
    }
  };

  return {
    init: async () => {
      await globalCrud.init();
      func.limitarCaracteres();
      grupoDatoCrud.init();
      grupoDatoCrud.globales();
      detalleGrupoDatoCrud.globales();

      var myTabs = document.querySelectorAll('.nav-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');
          if (tabPane === '#navs-grupodato') {
            redirect(false, 'navs-detalle-gd', 0);
            grupoDatoCrud.eventos.TABLEGRUPODATO();
          }

          if (tabPane === '#navs-detalle-gd') {
            detalleGrupoDatoCrud.eventos.TABLEGRUPODATODETALLE();
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
