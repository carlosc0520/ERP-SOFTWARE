/**
 * Empresa CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Mantenimientos/Empresas/Index?handler',
    PER: '/Usuarios/Personas/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler'
  };

  // * VARIABLES
  let empresasTable = 'empresasTable';
  let CempresasTable = null;

  // * TABLAS
  const empresaCrud = {
    init: () => {
      empresaCrud.eventos.TABLEEMPRESAS();
    },
    globales: () => {
      // * MODALES
      $('#modalAddEmpresa').on('show.bs.modal', function (e) {
        empresaCrud.variables.myDropzoneAddEmpresa.removeAllFiles(true);
        configFormVal('AddEmpresa', empresaCrud.validaciones.INSERT, () => empresaCrud.eventos.INSERT());
      });

      $('#modalEditEmpresa').on('show.bs.modal', function (e) {
        empresaCrud.variables.myDropzoneEditEmpresa.removeAllFiles(true);
        configFormVal('EditEmpresa', empresaCrud.validaciones.UPDATE, () => empresaCrud.eventos.UPDATE());
        func.actualizarForm('EditEmpresa', empresaCrud.variables.rowEdit);
        if (empresaCrud.variables.rowEdit?.rtafto) {
          let rutaArchivo = empresaCrud.variables.rowEdit?.rtafto;
          agregarArchivoADropzone(rutaArchivo, empresaCrud.variables.myDropzoneEditEmpresa);
        }
      });

      // * FORMULARIOS
      $(`#${empresasTable}`).on('click', '.edit-row', function () {
        const data = CempresasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró la empresa seleccionada');
        empresaCrud.variables.rowEdit = data;
        $('#modalEditEmpresa').modal('show');
      });

      $(`#${empresasTable}`).on('click', '.delete-row', function () {
        const data = CempresasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró la empresa seleccionada');
        swalFire.confirmar('¿Está seguro de eliminar la empresa?', {
          1: () => empresaCrud.eventos.DELETE(data.id)
        });
      });

      // * DROPZONE
      let dropzoneBasicAdd = $('#AddEmpresa #dropzone-area');
      if (dropzoneBasicAdd) {
        empresaCrud.variables.myDropzoneAddEmpresa = new Dropzone(dropzoneBasicAdd[0], {
          previewTemplate: previewTemplate('imagen'),
          parallelUploads: 1,
          maxFilesize: 5,
          maxFiles: 1,
          acceptedFiles: 'image/*',
          init: function () {
            this.on('addedfile', function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }
            });
          }
        });
      }

      let dropzoneBasicEdit = $('#EditEmpresa #dropzone-area');
      if (dropzoneBasicEdit) {
        empresaCrud.variables.myDropzoneEditEmpresa = new Dropzone(dropzoneBasicEdit[0], {
          previewTemplate: previewTemplateImage('imagen'),
          createImageThumbnails: false,
          parallelUploads: 1,
          maxFilesize: 5,
          maxFiles: 1,
          acceptedFiles: 'image/*',
          init: function () {
            this.on('addedfile', async function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }

              dropzoneBasicEdit.find('.centered-image').off('click');
              dropzoneBasicEdit.find('.dz-preview').css('cursor', 'pointer');

              let filePreview = this.files[0];
              if (filePreview.isExist) {
                let img = dropzoneBasicEdit.find('.dz-preview').find('.dz-details').find('img');
                img.attr('src', filePreview.dataURL);
                return;
              }

              let reader = new FileReader();
              reader.readAsDataURL(filePreview);
              reader.onload = function () {
                let img = dropzoneBasicEdit.find('.dz-preview').find('.dz-details').find('img');
                img.attr('src', reader.result);
                file.dataURL = reader.result;
                img.on('click', function () {
                  createModalImage($(this).attr('src'));
                });
              };
            });
          }
        });
      }
    },
    variables: {
      rowEdit: {},
      myDropzoneAddEmpresa: null,
      myDropzoneEditEmpresa: null
    },
    eventos: {
      TABLEEMPRESAS: () => {
        $(`#${empresasTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CempresasTable) {
          CempresasTable = $(`#${empresasTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(empresasTable);
              },
              dataSrc: function (json) {
                if (json?.data) {
                  let primero = json.data[0];
                  $('#total_usuarios').text(`Total ${primero?.totalrows} usuarios`);
                }
                return json.data;
              }
            },
            columns: [
              { data: 'rn', title: '' },
              {
                data: null, title: "Logo",
                render: data => {
                  return `
                  <a href="${data.rtafto}" 
                  data-lightbox="${data.rtafto}"
                  data-title="${data.mrca}"
                  target="_blank"
                  class="d-flex align-items-center">
                  <img src="${data.rtafto}" class=" me-3" alt="avatar" height="50" width="70">
                  </a>
                  `;
                }
              },
              {
                data: null,
                title: 'Empresa',
                className: 'text-left',
                render: data => data?.mrca || ''
              },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'
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
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-row" title="Editar"><i class="bx bx-edit"></i></button>
                        <button name="ELIMINAR" class="btn btn-sm btn-icon delete-row" title="Eliminar"><i class="bx bx-trash"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${empresasTable}`).find('.radio-buttons').length == 0) {
                $(`#${empresasTable}_filter`).append(radio_group_estados);

                $(`#${empresasTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${empresasTable}`).DataTable().ajax.reload();
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [

              ];

              buttons.unshift({
                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                className: 'btn btn-label-primary btn-add-new',
                action: function (e, dt, node, config) {
                  $('#modalAddEmpresa').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CempresasTable.ajax.reload();
        }
      },
      INSERT: () => {
        let file = empresaCrud.variables.myDropzoneAddEmpresa.files[0];
        if (!file) return swalFire.error('Debe seleccionar una imagen');

        let formData = new FormData();
        formData.append('MRCA', $('#AddEmpresa #MRCA').val());
        formData.append('FTO', file);
        formData.append('CESTDO', $('#AddEmpresa #CESTDO').val());
        formData.append('RUC', $('#AddEmpresa #RUC').val());
        formData.append('RZNSCIL', $('#AddEmpresa #RZNSCIL').val());
        formData.append('IDPRSNA', $('#AddEmpresa #IDPRSNA').val());
        formData.append('DRCNN', $('#AddEmpresa #DRCNN').val());
        formData.append('IDPAIS', $('#AddEmpresa #IDPAIS').val());
        formData.append('PRVNCA', $('#AddEmpresa #PRVNCA').val());
        formData.append('CCNTA', $('#AddEmpresa #CCNTA').val());
        formData.append('CCNTACCI', $('#AddEmpresa #CCNTACCI').val());
        formData.append('GDENTDD', $('#AddEmpresa #GDENTDD').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando a la Empresa']);
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
              swalFire.success('Empresa registrada correctamente', '', {
                1: () => {
                  $('#modalAddEmpresa').modal('hide');
                  CempresasTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar la Empresa')
        });
      },
      UPDATE: () => {
        let file = empresaCrud.variables.myDropzoneEditEmpresa.files[0];
        if (!file) return swalFire.error('Debe seleccionar una imagen');

        let formData = new FormData();
        formData.append('ID', empresaCrud.variables.rowEdit.id);
        formData.append('MRCA', $('#EditEmpresa #MRCA').val());
        formData.append('CESTDO', $('#EditEmpresa #CESTDO').val());
        formData.append('FTO', file);
        formData.append('RTAFTO', empresaCrud.variables.rowEdit?.rtafto || '');
        formData.append('RUC', $('#EditEmpresa #RUC').val());
        formData.append('RZNSCIL', $('#EditEmpresa #RZNSCIL').val());
        formData.append('IDPRSNA', $('#EditEmpresa #IDPRSNA').val());
        formData.append('DRCNN', $('#EditEmpresa #DRCNN').val());
        formData.append('IDPAIS', $('#EditEmpresa #IDPAIS').val());
        formData.append('PRVNCA', $('#EditEmpresa #PRVNCA').val());
        formData.append('CCNTA', $('#EditEmpresa #CCNTA').val());
        formData.append('CCNTACCI', $('#EditEmpresa #CCNTACCI').val());
        formData.append('GDENTDD', $('#EditEmpresa #GDENTDD').val());


        swalFire.cargando(['Espere un momento', 'Estamos actualizando a la Empresa']);
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
              swalFire.success('Empresa actualizada correctamente', '', {
                1: () => {
                  $('#modalEditEmpresa').modal('hide');
                  CempresasTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar a la Empresa')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando la empresa']);
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
              swalFire.success('Empresa eliminada correctamente', '', {
                1: () => $(`#${empresasTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar la empresa')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        MRCA: agregarValidaciones({
          required: true
        }),
      },
      UPDATE: {
        MRCA: agregarValidaciones({
          required: true
        }),
      }
    }
  };

  const globalCrud = {
    init: async () => {
      await globalCrud.eventos.selects();
    },
    eventos: {
      selects: async () => {
        try {
          let GRUPODATOS = "GDENTDD";
          if (!GRUPODATOS) return;

          const obtenerSelects = $.ajax({
            url: uisApis.GD + '=ObtenerAll',
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET',
            data: {
              GDTOS: GRUPODATOS
            }
          });

          const obtenerPersonas = $.ajax({
            url: uisApis.PER + '=Buscar&start=0&length=1000',
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET'
          });

          const ObtenerPaises = $.ajax({
            url: uisApis.GD + '=ObtenerAll&VLR1=1',
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET',
            data: {
              VLR1: '1'
            }
          });


          const [responseSelects, responsePersonas, responsePaises] = await Promise.all([obtenerSelects, obtenerPersonas, ObtenerPaises]);

          if (responseSelects?.data) {
            let selects = document.querySelectorAll('#AddEmpresa select, #EditEmpresa select');
            selects = Array.from(selects).filter(select => select.getAttribute('name') !== 'CESTDO');

            selects.forEach(select => {
              const name = select.getAttribute('name');
              const data = responseSelects.data.filter(d => d.gdpdre === name);
              select.innerHTML = `<option value="">-- Seleccione</option>`;

              if (data.length > 0) {
                data.forEach(d => {
                  select.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
                });
              }
            });
          }

          if (responsePersonas?.data && responsePersonas.data.length > 0) {
            let selects = ["#AddEmpresa #IDPRSNA", "#EditEmpresa #IDPRSNA"];
            selects.forEach(select => {
              let selectElement = document.querySelector(select);
              selectElement.innerHTML = `<option value="">-- Seleccione</option>`;
              responsePersonas.data.forEach(d => {
                selectElement.innerHTML += `<option value="${d.id}">${d.ncmpto}</option>`;
              });
            });
          }

          if (responsePaises?.data){
            let selects = ["#AddEmpresa #IDPAIS", "#EditEmpresa #IDPAIS"];
            selects.forEach(select => {
              let selectElement = document.querySelector(select);
              selectElement.innerHTML = `<option value="">-- Seleccione</option>`;
              responsePaises.data.forEach(d => {
                selectElement.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
              });
            });
          }
        } catch (error) {
          swalFire.error('Ocurrió un error al cargar los datos');
          console.error(error);
        }
      },
    }
  };

    return {
      init: async () => {
        await func.selects2();
        func.limitarCaracteres();
        await globalCrud.init();
        empresaCrud.init();
        empresaCrud.globales();
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
