/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Comercial/Plantillas/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler'
  };

  // * VARIABLES
  let plantillasTable = 'plantillasTable';
  let CplantillasTable = null;

  // * TABLAS
  const plantillasCrud = {
    init: () => {
      plantillasCrud.eventos.TABLEPLANTILLA();
    },
    globales: () => {
      // * FORMULARIOS
      $(`#${plantillasTable}`).on('click', '.edit-plantilla-button', function () {
        const data = CplantillasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró la plantilla seleccionada');
        plantillasCrud.variables.editPlantilla = data;
        $('#modalEditPlantilla').modal('show');
      });

      $(`#${plantillasTable}`).on('click', '.delete-plantilla-button', function () {
        const data = CplantillasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró la plantilla seleccionada');
        plantillasCrud.variables.deletePlantilla = data;
        swalFire.confirmar('¿Está seguro de eliminar la plantilla?', {
          1: () => plantillasCrud.eventos.DELETE(data)
        });
      });

      $(`#${plantillasTable}`).on('click', '.view-plantilla-button', function () {
        const data = CplantillasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró la plantilla seleccionada');
        window.open(`${data.rta}`, '_blank');
      });

      $(`#downloadPlantilla`).on('click', function () {
        const data = plantillasCrud.variables.editPlantilla;
        // obtener archivo de data.rtaplntlla y descargarlo
        $.ajax({
          url: uisApis.API + '=ObtenerFile&RTAPLNTLLA=' + data.rtaplntlla,
          type: 'GET',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
          },
          dataType: 'json',
          success: function (res) {
            try {
              const linkSource = res.file;
              const downloadLink = document.createElement('a');
              const fileName = res?.fileName || 'archivo';

              downloadLink.href = linkSource;
              downloadLink.download = fileName;
              downloadLink.click();
            } catch (error) {
              swalFire.error('Ocurrió un error al descargar el archivo');
            }
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al descargar el archivo')
        });
      });

      // * MODALES
      $('#modalAddPlantilla').on('show.bs.modal', function (e) {
        plantillasCrud.variables.myDropzoneAddPlantilla.removeAllFiles();
        configFormVal('AddPlantilla', plantillasCrud.validaciones.INSERT, () => plantillasCrud.eventos.INSERT());
      });

      $('#modalEditPlantilla').on('show.bs.modal', function (e) {
        plantillasCrud.variables.myDropzoneEditPlantilla.removeAllFiles();
        configFormVal('EditPlantilla', plantillasCrud.validaciones.UPDATE, () => plantillasCrud.eventos.UPDATE());
        func.actualizarForm('EditPlantilla', plantillasCrud.variables.editPlantilla);
      });

      // * FILES
      const dropzoneBasic = $('#AddPlantilla #dropzone-area');
      if (dropzoneBasic) {
        plantillasCrud.variables.myDropzoneAddPlantilla = new Dropzone(dropzoneBasic[0], {
          previewTemplate: previewTemplate('archivo'),
          parallelUploads: 1,
          maxFilesize: 5,
          maxFiles: 1,
          acceptedFiles: '.xls,.xlsx,.pdf,.doc,.docx',
          init: function () {
            this.on('addedfile', function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }
            });
          }
        });
      }

      const dropzoneBasicEdit = $('#EditPlantilla #dropzone-area');
      if (dropzoneBasic) {
        plantillasCrud.variables.myDropzoneEditPlantilla = new Dropzone(dropzoneBasicEdit[0], {
          previewTemplate: previewTemplate('archivo'),
          parallelUploads: 1,
          maxFilesize: 5,
          maxFiles: 1,
          acceptedFiles: '.xls,.xlsx,.pdf,.doc,.docx',
          init: function () {
            this.on('addedfile', function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }
            });
          }
        });
      }
    },
    variables: {
      myDropzoneAddPlantilla: null,
      myDropzoneEditPlantilla: null,
      editPlantilla: {}
    },
    eventos: {
      TABLEPLANTILLA: () => {
        $(`#${plantillasTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CplantillasTable) {
          CplantillasTable = $(`#${plantillasTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(plantillasTable);
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
                        <button name="ELIMINAR" class="btn btn-sm btn-icon delete-plantilla-button" data-id="${data.id}" title="Eliminar"><i class="bx bx-trash"></i></button>
                        <button class="btn btn-sm btn-icon view-plantilla-button" title="Ver Detalle"><i class="bi bi-eye" style="font-size: 1.2rem"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${plantillasTable}`).find('.radio-buttons').length == 0) {
                $(`#${plantillasTable}_filter`).append(radio_group_estados);

                $(`#${plantillasTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${plantillasTable}`).DataTable().ajax.reload();
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
                        columns: [0, 1, 2, 3, 4, 5],
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
                  $('#modalAddPlantilla').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CplantillasTable.ajax.reload();
        }
      },
      INSERT: () => {
        const file = plantillasCrud.variables.myDropzoneAddPlantilla.files[0];
        if (!file) return swalFire.error('Debe seleccionar un archivo de plantilla');

        let formData = new FormData();
        formData.append('DSCRPCN', $('#AddPlantilla #DSCRPCN').val());
        formData.append('DTLLE', $('#AddPlantilla #DTLLE').val());
        formData.append('GDTPODCMNTO', $('#AddPlantilla #GDTPODCMNTO').val());
        formData.append('RTA', $('#AddPlantilla #RTA').val());
        formData.append('ARCHVO', file);

        swalFire.cargando(['Espere un momento', 'Estamos registrando la plantilla']);
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
              swalFire.success('Plantilla agregada correctamente', '', {
                1: () => {
                  $('#modalAddPlantilla').modal('hide');
                  plantillasCrud.variables.myDropzoneAddPlantilla.removeAllFiles();
                  $(`#${plantillasTable}`).DataTable().ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar la plantilla')
        });
      },
      UPDATE: () => {
        const file = plantillasCrud.variables.myDropzoneEditPlantilla.files[0];

        let formData = new FormData();
        formData.append('ID', plantillasCrud.variables.editPlantilla.id);
        formData.append('RTAPLNTLLA', plantillasCrud.variables.editPlantilla.rtaplntlla);
        formData.append('DSCRPCN', $('#EditPlantilla #DSCRPCN').val());
        formData.append('DTLLE', $('#EditPlantilla #DTLLE').val());
        formData.append('GDTPODCMNTO', $('#EditPlantilla #GDTPODCMNTO').val());
        formData.append('RTA', $('#EditPlantilla #RTA').val());
        formData.append('ARCHVO', file || null);

        swalFire.cargando(['Espere un momento', 'Estamos actualizando la plantilla']);
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
              swalFire.success('Plantilla actualizada correctamente', '', {
                1: () => {
                  $('#modalEditPlantilla').modal('hide');
                  plantillasCrud.variables.myDropzoneEditPlantilla.removeAllFiles();
                  $(`#${plantillasTable}`).DataTable().ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar la plantilla')
        });
      },
      DELETE: data => {
        let formData = new FormData();
        formData.append('ID', data.id);
        formData.append('RTAPLNTLLA', data.rtaplntlla);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando la plantilla']);
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
              swalFire.success('Plantilla eliminada correctamente', '', {
                1: () => $(`#${plantillasTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar la plantilla')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        GDTPODCMNTO: agregarValidaciones({
          required: true
        }),
        RTA: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        GDTPODCMNTO: agregarValidaciones({
          required: true
        }),
        RTA: agregarValidaciones({
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
        $.ajax({
          url: uisApis.GD + '=ObtenerAll',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'GET',
          data: {
            GDTOS: 'GDTPODCMNTO'
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
      plantillasCrud.init();
      plantillasCrud.globales();

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
