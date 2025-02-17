/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Comercial/Cursos/Detalle/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler'
  };

  // * VARIABLES
  let profesoresTable = 'profesoresTable';
  let sponsorsTable = 'sponsorsTable';
  let CprofesoresTable = null;
  let CsponsorsTable = null;

  // * TABLAS
  const profesoresCrud = {
    init: () => {
      profesoresCrud.eventos.TABLEPROFESORES();
    },
    globales: () => {
      // * MODALES
      $('#modalAddProfesor').on('show.bs.modal', function (e) {
        profesoresCrud.variables.myDropzoneAddProfesor.removeAllFiles(true);
        configFormVal('AddProfesor', profesoresCrud.validaciones.INSERT, () => profesoresCrud.eventos.INSERT());
      });

      $('#modalEditProfesor').on('show.bs.modal', function (e) {
        configFormVal('EditProfesor', profesoresCrud.validaciones.UPDATE, () => profesoresCrud.eventos.UPDATE());
        func.actualizarForm('EditProfesor', profesoresCrud.variables.rolEdit);
        if (profesoresCrud.variables.rolEdit?.rtafto) {
          let rutaArchivo = profesoresCrud.variables.rolEdit?.rtafto; 
          agregarArchivoADropzone(rutaArchivo, profesoresCrud.variables.myDropzoneEditProfesor);
        }
      });

      // * FORMULARIOS
      $(`#${profesoresTable}`).on('click', '.edit-sponsor-button', function () {
        const data = CprofesoresTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el profesor seleccionado');
        profesoresCrud.variables.rolEdit = data;
        $('#modalEditProfesor').modal('show');
      });

      $(`#${profesoresTable}`).on('click', '.delete-sponsor-button', function () {
        const data = CprofesoresTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el profesor seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el profesor?', {
          1: () => profesoresCrud.eventos.DELETE(data.id)
        });
      });

      // * DROPZONE
      let dropzoneBasicAdd = $('#AddProfesor #dropzone-area');
      if (dropzoneBasicAdd) {
        profesoresCrud.variables.myDropzoneAddProfesor = new Dropzone(dropzoneBasicAdd[0], {
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

      let dropzoneBasicEdit = $('#EditProfesor #dropzone-area');
      if (dropzoneBasicEdit) {
        profesoresCrud.variables.myDropzoneEditProfesor = new Dropzone(dropzoneBasicEdit[0], {
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
      rolEdit: {},
      idCurso: 0,
      myDropzoneAddProfesor: null,
      myDropzoneEditProfesor: null
    },
    eventos: {
      TABLEPROFESORES: () => {
        $(`#${profesoresTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CprofesoresTable) {
          CprofesoresTable = $(`#${profesoresTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDCRSO = profesoresCrud.variables.idCurso;
                d.CESTDO = func.obtenerCESTDO(profesoresTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: null, title: 'Profesor',
                render: data => `<div class="d-flex align-items-center"><img src="${data.rtafto}" class="rounded-circle" style="width: 50px; height: 50px;"><span class="ms-2">${data.nmbrs}</span></div>`
               },
              { data: null, title: 'Cargo', className: 'text-center', render: data => data?.cargo || '' },
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
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-sponsor-button" title="Editar"><i class="bx bx-edit"></i></button>
                        <button name="ELIMINAR" class="btn btn-sm btn-icon delete-sponsor-button" title="Eliminar"><i class="bx bx-trash"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${profesoresTable}`).find('.radio-buttons').length == 0) {
                $(`#${profesoresTable}_filter`).append(radio_group_estados);

                $(`#${profesoresTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${profesoresTable}`).DataTable().ajax.reload();
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
                  $('#modalAddProfesor').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CprofesoresTable.ajax.reload();
        }
      },
      INSERT: () => {
        let file = profesoresCrud.variables.myDropzoneAddProfesor.files[0];
        if (!file) return swalFire.error('Debe subir una imagen');

        let formData = new FormData();
        formData.append('IDCRSO', profesoresCrud.variables.idCurso);
        formData.append('NMBRS', $('#AddProfesor #NMBRS').val());
        formData.append('CARGO', $('#AddProfesor #CARGO').val());
        formData.append('UNVRSDD', $('#AddProfesor #UNVRSDD').val());
        formData.append('FTO', file);
        formData.append('RISIG', $('#AddProfesor #RISIG').val());
        formData.append('RISFB', $('#AddProfesor #RISFB').val());
        formData.append('RISLK', $('#AddProfesor #RISLK').val());
        formData.append('RTIK', $('#AddProfesor #RTIK').val());
        formData.append('CESTDO', $('#AddProfesor #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el Profesor']);
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
              swalFire.success('Profesor registrado correctamente', '', {
                1: () => {
                  $('#modalAddProfesor').modal('hide');
                  CprofesoresTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el Profesor')
        });
      },
      UPDATE: () => {
        let file = profesoresCrud.variables.myDropzoneEditProfesor.files[0];
        if (!file) return swalFire.error('Debe subir una imagen');

        let formData = new FormData();
        formData.append('ID', profesoresCrud.variables.rolEdit.id);
        formData.append('IDCRSO', profesoresCrud.variables.rolEdit.idcrso);
        formData.append('NMBRS', $('#EditProfesor #NMBRS').val());
        formData.append('CARGO', $('#EditProfesor #CARGO').val());
        formData.append('UNVRSDD', $('#EditProfesor #UNVRSDD').val());
        formData.append('RTAFTO', profesoresCrud.variables.rolEdit.rtafto);
        formData.append('RISIG', $('#EditProfesor #RISIG').val());
        formData.append('RISFB', $('#EditProfesor #RISFB').val());
        formData.append('RISLK', $('#EditProfesor #RISLK').val());
        formData.append('RTIK', $('#EditProfesor #RTIK').val());
        formData.append('CESTDO', $('#EditProfesor #CESTDO').val());
        formData.append('FTO', file.isExist ? null : file);

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el Profesor']);
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
              swalFire.success('Profesor actualizado correctamente', '', {
                1: () => {
                  $('#modalEditProfesor').modal('hide');
                  CprofesoresTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el Profesor')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el profesor']);
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
              swalFire.success('profesor eliminado correctamente', '', {
                1: () => $(`#${profesoresTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el profesor')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        NMBRS: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        NMBRS: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const sponsorCrud = {
    init: () => {
      sponsorCrud.eventos.TABLASPONSORS();
    },
    globales: () => {
      // * MODALES
      $('#modalAddSponsor').on('show.bs.modal', function (e) {
        sponsorCrud.variables.myDropzoneAddSponsor.removeAllFiles(true);
        configFormVal('AddSponsor', sponsorCrud.validaciones.INSERT, () => sponsorCrud.eventos.INSERT());
        $('#AddSponsor #GDPDRE').val(profesoresCrud.variables.rolEdit.dtlle);
      });

      $('#modalEditSponsor').on('show.bs.modal', function (e) {
        configFormVal('EditSponsor', sponsorCrud.validaciones.UPDATE, () => sponsorCrud.eventos.UPDATE());
        func.actualizarForm('EditSponsor', sponsorCrud.variables.rolEdit);
        if (sponsorCrud.variables.rolEdit?.rtafto) {
          let rutaArchivo = sponsorCrud.variables.rolEdit?.rtafto; 
          agregarArchivoADropzone(rutaArchivo, sponsorCrud.variables.myDropzoneEditSponsor);
        }
      });

      // * FORMULARIOS
      $(`#${sponsorsTable}`).on('click', '.edit-sponsor-button', function () {
        const data = CsponsorsTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el sponsor seleccionado');
        sponsorCrud.variables.rolEdit = data;
        $('#modalEditSponsor').modal('show');
      });

      $(`#${sponsorsTable}`).on('click', '.delete-sponsor-button', function () {
        const data = CsponsorsTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el sponsor seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el sponsor?', {
          1: () => sponsorCrud.eventos.DELETE(data.id)
        });
      });

      // * DROPZONE
      let dropzoneBasicAdd = $('#AddSponsor #dropzone-area');
      if (dropzoneBasicAdd) {
        sponsorCrud.variables.myDropzoneAddSponsor = new Dropzone(dropzoneBasicAdd[0], {
          previewTemplate: previewTemplate('imagen'),
          parallelUploads: 1,
          maxFilesize: 5,
          maxFiles: 1,
          acceptedFiles: '.png,.jpg,.jpeg',
          init: function () {
            this.on('addedfile', function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }
            });
          }
        });
      }

      let dropzoneBasicEdit = $('#EditSponsor #dropzone-area');
      if (dropzoneBasicEdit) {
        sponsorCrud.variables.myDropzoneEditSponsor = new Dropzone(dropzoneBasicEdit[0], {
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
      rolEdit: {},
      idCurso: 0,
      myDropzoneAddSponsor: null,
      myDropzoneEditSponsor: null
    },
    eventos: {
      TABLASPONSORS: () => {
        $(`#${sponsorsTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CsponsorsTable) {
          CsponsorsTable = $(`#${sponsorsTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarSponsor',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDCRSO = sponsorCrud.variables.idCurso;
                d.CESTDO = func.obtenerCESTDO(sponsorsTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              {
                data: null,
                title: 'Sponsor',
                render: data => `<div class="d-flex align-items-center"><img src="${data.rtafto}" class="rounded-circle" style="width: 50px; height: 50px;"><span class="ms-2">${data.nmbrs}</span></div>`
              },
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
                          <button name="EDITAR" class="btn btn-sm btn-icon edit-sponsor-button" title="Editar"><i class="bx bx-edit"></i></button>
                          <button name="ELIMINAR" class="btn btn-sm btn-icon delete-sponsor-button" title="Eliminar"><i class="bx bx-trash"></i></button>
                       </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${sponsorsTable}`).find('.radio-buttons').length == 0) {
                $(`#${sponsorsTable}_filter`).append(radio_group_estados);

                $(`#${sponsorsTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${sponsorsTable}`).DataTable().ajax.reload();
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
                  $('#modalAddSponsor').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CsponsorsTable.ajax.reload();
        }
      },
      INSERT: () => {
        console.log(sponsorCrud.variables.myDropzoneAddSponsor.files);
        let file = sponsorCrud.variables.myDropzoneAddSponsor.files[0];
        if (!file) return swalFire.error('Debe subir una imagen');

        let formData = new FormData();
        formData.append('IDCRSO', sponsorCrud.variables.idCurso);
        formData.append('NMBRS', $('#AddSponsor #NMBRS').val());
        formData.append('RTAFTO', $('#AddSponsor #RTAFTO').val());
        formData.append('CESTDO', $('#AddSponsor #CESTDO').val());
        formData.append('FTO', file);

        swalFire.cargando(['Espere un momento', 'Estamos registrando el sponsor']);
        $.ajax({
          url: uisApis.API + '=AddSponsor',
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
              swalFire.success('Sponsor registrado correctamente', '', {
                1: () => {
                  $('#modalAddSponsor').modal('hide');
                  CsponsorsTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el sponsor')
        });
      },
      UPDATE: () => {
        let file = sponsorCrud.variables.myDropzoneEditSponsor.files[0];
        if (!file) return swalFire.error('Debe subir una imagen');


        let formData = new FormData();
        formData.append('ID', sponsorCrud.variables.rolEdit.id);
        formData.append('IDCRSO', sponsorCrud.variables.rolEdit.idcrso);
        formData.append('NMBRS', $('#EditSponsor #NMBRS').val());
        formData.append('CESTDO', $('#EditSponsor #CESTDO').val());
        formData.append('FTO', file.isExist ? null : file);
        formData.append('RTAFTO', sponsorCrud.variables.rolEdit.rtafto);

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el sponsor']);
        $.ajax({
          url: uisApis.API + '=UpdateSponsor',
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
              swalFire.success('Sponsor actualizado correctamente', '', {
                1: () => {
                  $('#modalEditSponsor').modal('hide');
                  CsponsorsTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el sponsor')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el Grupo Dato']);
        $.ajax({
          url: uisApis.API + '=DeleteSponsor',
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
              swalFire.success('Sponsors eliminado correctamente', '', {
                1: () => $(`#${sponsorsTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el Sponsor')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        NMBRS: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        NMBRS: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const globalCrud = {
    init: () => {
      //   globalCrud.eventos.selects();
      //   globalCrud.eventos.selects2();
    },
    eventos: {
      selects: () => {
        let GRUPODATOS = null;
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
              let selects = document.querySelectorAll('select');
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

        let selects = document.querySelectorAll('#EditProfesor select, #AddProfesor select');
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
      let paramsUrl = new URLSearchParams(window.location.search);
      let id = paramsUrl.get('course');

      if (!id || isNaN(id)) {
        window.location.href = '/Comercial/Cursos';
        return;
      }

      profesoresCrud.variables.idCurso = id;
      sponsorCrud.variables.idCurso = id;

      await globalCrud.init();
      func.limitarCaracteres();
      profesoresCrud.init();
      profesoresCrud.globales();
      sponsorCrud.globales();

      var myTabs = document.querySelectorAll('.nav-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');
          if (tabPane === '#navs-profesores') {
            profesoresCrud.init();
          }

          if (tabPane === '#navs-sponsors') {
            sponsorCrud.init();
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
