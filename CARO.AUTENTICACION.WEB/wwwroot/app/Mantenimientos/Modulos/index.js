/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Mantenimientos/Vistas/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler'
  };

  // * VARIABLES
  let modulosTable = 'modulosTable';
  let submodulosTable = 'submodulosTable';
  let detsubmodulosTable = 'detsubmodulosTable';
  let CmodulosTable = null;
  let CsubmodulosTable = null;
  let CdetsubmodulosTable = null;

  // * TABLAS
  const moduloCrud = {
    init: () => {
      moduloCrud.eventos.TABLEMODULO();
    },
    globales: () => {
      // * MODALES
      $('#modalAddModulo').on('show.bs.modal', function (e) {
        configFormVal('AddModulo', moduloCrud.validaciones.INSERT, () => moduloCrud.eventos.INSERT());
      });

      $('#modalEditModulo').on('show.bs.modal', function (e) {
        configFormVal('EditModulo', moduloCrud.validaciones.UPDATE, () => moduloCrud.eventos.UPDATE());
        func.actualizarForm('EditModulo', moduloCrud.variables.rolEdit);
        if (moduloCrud.variables.rolEdit?.fto) {
          let filename = moduloCrud.variables.rolEdit?.namefto;
          let rtafto = `data:${moduloCrud.variables.rolEdit?.tpofto};base64,${moduloCrud.variables.rolEdit?.fto}`;
          let blob = new Blob([rtafto], { type: moduloCrud.variables.rolEdit?.tpofto });
          let fileOfBlob = new File([blob], filename);
          fileOfBlob.dataURL = rtafto;
          fileOfBlob.isExist = true;
          moduloCrud.variables.myDropzoneEditModulo.files.push(fileOfBlob);
          moduloCrud.variables.myDropzoneEditModulo.emit('addedfile', fileOfBlob);
          moduloCrud.variables.myDropzoneEditModulo.emit('complete', fileOfBlob);
        }
      });

      // * FORMULARIOS
      $(`#${modulosTable}`).on('click', '.edit-grupodato-button', function () {
        const data = CmodulosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el modulo seleccionado');
        moduloCrud.variables.rolEdit = data;
        $('#modalEditModulo').modal('show');
      });

      $(`#${modulosTable}`).on('click', '.delete-grupodato-button', function () {
        const data = CmodulosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el modulo seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el modulo?', {
          1: () => moduloCrud.eventos.DELETE(data.id)
        });
      });

      $(`#${modulosTable}`).on('click', '.view-grupodato-button', function () {
        const data = CmodulosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el modulo seleccionado');
        moduloCrud.variables.rolEdit = data;
        redirect(true, 'navs-submodulos', data.id);
      });

      // * DROPZONE
      let dropzoneBasicAdd = $('#AddModulo #dropzone-area');
      if (dropzoneBasicAdd) {
        moduloCrud.variables.myDropzoneAddModulo = new Dropzone(dropzoneBasicAdd[0], {
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

      let dropzoneBasicEdit = $('#EditModulo #dropzone-area');
      if (dropzoneBasicEdit) {
        moduloCrud.variables.myDropzoneEditModulo = new Dropzone(dropzoneBasicEdit[0], {
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
                  createModalImage(reader.result);
                });
              };
            });
          }
        });
      }
    },
    variables: {
      rolEdit: {},
      myDropzoneAddModulo: null,
      myDropzoneEditModulo: null
    },
    eventos: {
      TABLEMODULO: () => {
        $(`#${modulosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CmodulosTable) {
          CmodulosTable = $(`#${modulosTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(modulosTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'mdlo', title: 'Descripción' },
              { data: 'url', title: 'Enlace' },
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
              if ($(`#${modulosTable}`).find('.radio-buttons').length == 0) {
                $(`#${modulosTable}_filter`).append(radio_group_estados);

                $(`#${modulosTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${modulosTable}`).DataTable().ajax.reload();
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
                  $('#modalAddModulo').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CmodulosTable.ajax.reload();
        }
      },
      INSERT: () => {
        let file = moduloCrud.variables.myDropzoneAddModulo.files[0];
        if (!file) return swalFire.error('Debe seleccionar una imagen');

        let formData = new FormData();
        formData.append('MDLO', $('#AddModulo #MDLO').val());
        formData.append('URL', $('#AddModulo #URL').val());
        formData.append('URL2', $('#AddModulo #URL2').val());
        formData.append('FTO', file);
        formData.append('CESTDO', $('#AddModulo #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el Modulo']);
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
              swalFire.success('Modulo registrado correctamente', '', {
                1: () => {
                  $('#modalAddModulo').modal('hide');
                  CmodulosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el Modulo')
        });
      },
      UPDATE: () => {
        let file = moduloCrud.variables.myDropzoneEditModulo.files[0];
        if (!file) return swalFire.error('Debe seleccionar una imagen');

        if (file && file.isExist) file = null;

        let formData = new FormData();
        formData.append('ID', moduloCrud.variables.rolEdit.id);
        formData.append('IMG', moduloCrud.variables.rolEdit?.img || '');
        formData.append('MDLO', $('#EditModulo #MDLO').val());
        formData.append('URL', $('#EditModulo #URL').val());
        formData.append('URL2', $('#EditModulo #URL2').val());
        formData.append('FTO', file);
        formData.append('CESTDO', $('#EditModulo #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el Modulo']);
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
              swalFire.success('Modulo actualizado correctamente', '', {
                1: () => {
                  $('#modalEditModulo').modal('hide');
                  CmodulosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el Modulo')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el Modulo']);
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
              swalFire.success('Modulo eliminado correctamente', '', {
                1: () => $(`#${modulosTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el Modulo')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        MDLO: agregarValidaciones({
          required: true
        }),
        URL: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        MDLO: agregarValidaciones({
          required: true
        }),
        URL: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const subModulosCrud = {
    init: () => {
      subModulosCrud.eventos.TABLESUBMODULO();
    },
    globales: () => {
      // * MODALES
      $('#modalAddSubModulo').on('show.bs.modal', function (e) {
        configFormVal('AddSubModulo', subModulosCrud.validaciones.INSERT, () => subModulosCrud.eventos.INSERT());
        $('#AddSubModulo #GDPDRE').val(moduloCrud.variables.rolEdit.dtlle);
      });

      $('#modalEditSubModulo').on('show.bs.modal', function (e) {
        configFormVal('EditSubModulo', subModulosCrud.validaciones.UPDATE, () => subModulosCrud.eventos.UPDATE());
        func.actualizarForm('EditSubModulo', subModulosCrud.variables.rolEdit);
      });

      // * FORMULARIOS
      $(`#${submodulosTable}`).on('click', '.edit-grupodato-button', function () {
        const data = CsubmodulosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del sub modulo seleccionado');
        subModulosCrud.variables.rolEdit = data;
        $('#modalEditSubModulo').modal('show');
      });

      $(`#${submodulosTable}`).on('click', '.delete-grupodato-button', function () {
        const data = CsubmodulosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del sub modulo seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el detalle del sub modulo?', {
          1: () => subModulosCrud.eventos.DELETE(data.id)
        });
      });

      $(`#${submodulosTable}`).on('click', '.view-grupodato-button', function () {
        const data = CsubmodulosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del sub modulo seleccionado');
        subModulosCrud.variables.rolEdit = data;
        redirect(true, 'navs-submodulodet', data.id);
      });
    },
    variables: {
      rolEdit: {}
    },
    eventos: {
      TABLESUBMODULO: () => {
        $(`#${submodulosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${submodulosTable}_title`).text('MODULO: ' + moduloCrud.variables.rolEdit?.mdlo || '');

        if (!CsubmodulosTable) {
          CsubmodulosTable = $(`#${submodulosTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarSubModulo',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDMDLO = moduloCrud.variables.rolEdit.id;
                d.CESTDO = func.obtenerCESTDO(submodulosTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'dscrpcn', title: 'Descripción' },
              {
                data: null,
                title: 'Icono',
                className: 'text-center',
                render: data => {
                  return `<span><i class="${data.icno}"></i></span>`;
                }
              },
              { data: 'url', title: 'Enlace' },
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
              if ($(`#${submodulosTable}`).find('.radio-buttons').length == 0) {
                $(`#${submodulosTable}_filter`).append(radio_group_estados);

                $(`#${submodulosTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${submodulosTable}`).DataTable().ajax.reload();
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
                  $('#modalAddSubModulo').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CsubmodulosTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('IDMDLO', moduloCrud.variables.rolEdit.id);
        formData.append('DSCRPCN', $('#AddSubModulo #DSCRPCN').val());
        formData.append('ICONO', $('#AddSubModulo #ICONO').val());
        formData.append('URL', $('#AddSubModulo #URL').val());
        formData.append('ISPARENT', $('#AddSubModulo #ISPARENT').is(':checked'));
        formData.append('CESTDO', $('#AddSubModulo #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el detalle del submodulo']);
        $.ajax({
          url: uisApis.API + '=AddSubModulo',
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
              swalFire.success('Detalle de submodulo registrado correctamente', '', {
                1: () => {
                  $('#modalAddSubModulo').modal('hide');
                  CsubmodulosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al agregar el detalle del submodulo')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', subModulosCrud.variables.rolEdit.id);
        formData.append('DSCRPCN', $('#EditSubModulo #DSCRPCN').val());
        formData.append('ICONO', $('#EditSubModulo #ICONO').val());
        formData.append('URL', $('#EditSubModulo #URL').val());
        formData.append('ISPARENT', $('#EditSubModulo #ISPARENT').is(':checked'));
        formData.append('CESTDO', $('#EditSubModulo #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el detalle del Submodulo']);
        $.ajax({
          url: uisApis.API + '=UpdateSubModulo',
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
              swalFire.success('Detalle de Submodulo actualizado correctamente', '', {
                1: () => {
                  $('#modalEditSubModulo').modal('hide');
                  CsubmodulosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al actualizar el detalle del Submodulo')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el SubModulo']);
        $.ajax({
          url: uisApis.API + '=DeleteSubModulo',
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
              swalFire.success('SubModulo eliminado correctamente', '', {
                1: () => $(`#${submodulosTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el SubModulo')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        URL: agregarValidaciones({
          required: true
        }),
      },
      UPDATE: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        URL: agregarValidaciones({
          required: true
        }),
      }
    }
  };

  const detSubModulosCrud = {
    init: () => {
      detSubModulosCrud.eventos.TABLEDETSUBMODULO();
    },
    globales: () => {
      // * MODALES
      $('#modalAddDetSubModulo').on('show.bs.modal', function (e) {
        configFormVal('AddDetSubModulo', detSubModulosCrud.validaciones.INSERT, () =>
          detSubModulosCrud.eventos.INSERT()
        );
        $('#AddDetSubModulo #GDPDRE').val(moduloCrud.variables.rolEdit.dtlle);
      });

      $('#modalEditDetSubModulo').on('show.bs.modal', function (e) {
        configFormVal('EditDetSubModulo', detSubModulosCrud.validaciones.UPDATE, () =>
          detSubModulosCrud.eventos.UPDATE()
        );
        func.actualizarForm('EditDetSubModulo', detSubModulosCrud.variables.rolEdit);
      });

      // * FORMULARIOS
      $(`#${detsubmodulosTable}`).on('click', '.edit-grupodato-button', function () {
        const data = CdetsubmodulosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del sub modulo seleccionado');
        detSubModulosCrud.variables.rolEdit = data;
        $('#modalEditDetSubModulo').modal('show');
      });

      $(`#${detsubmodulosTable}`).on('click', '.delete-grupodato-button', function () {
        const data = CdetsubmodulosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del sub modulo seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el detalle del sub modulo?', {
          1: () => detSubModulosCrud.eventos.DELETE(data.id)
        });
      });
    },
    variables: {
      rolEdit: {}
    },
    eventos: {
      TABLEDETSUBMODULO: () => {
        $(`#${detsubmodulosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${detsubmodulosTable}_title`).text('SUB MODULO: ' + subModulosCrud.variables.rolEdit?.dscrpcn || '');

        if (!CdetsubmodulosTable) {
          CdetsubmodulosTable = $(`#${detsubmodulosTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarDetSubModulo',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDSUBMDLO = subModulosCrud.variables.rolEdit.id;
                d.CESTDO = func.obtenerCESTDO(detsubmodulosTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'dscrpcn', title: 'Descripción' },
              {
                data: null,
                title: 'Icono',
                className: 'text-center',
                render: data => {
                  return `<span><i class="${data.icno}"></i></span>`;
                }
              },
              { data: 'url', title: 'Enlace' },
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
              if ($(`#${detsubmodulosTable}`).find('.radio-buttons').length == 0) {
                $(`#${detsubmodulosTable}_filter`).append(radio_group_estados);

                $(`#${detsubmodulosTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${detsubmodulosTable}`).DataTable().ajax.reload();
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
                  $('#modalAddDetSubModulo').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CdetsubmodulosTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('IDSUBMDLO', subModulosCrud.variables.rolEdit.id);
        formData.append('DSCRPCN', $('#AddDetSubModulo #DSCRPCN').val());
        formData.append('ICONO', $('#AddDetSubModulo #ICONO').val());
        formData.append('URL', $('#AddDetSubModulo #URL').val());
        formData.append('CESTDO', $('#AddDetSubModulo #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el detalle del sub modulo']);
        $.ajax({
          url: uisApis.API + '=AddDetSubModulo',
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
              swalFire.success('Detalle de sub modulo registrado correctamente', '', {
                1: () => {
                  $('#modalAddDetSubModulo').modal('hide');
                  CdetsubmodulosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al agregar el detalle del sub modulo')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', detSubModulosCrud.variables.rolEdit.id);
        formData.append('DSCRPCN', $('#EditDetSubModulo #DSCRPCN').val());
        formData.append('ICONO', $('#EditDetSubModulo #ICONO').val());
        formData.append('URL', $('#EditDetSubModulo #URL').val());
        formData.append('CESTDO', $('#EditDetSubModulo #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el detalle del sub modulo']);
        $.ajax({
          url: uisApis.API + '=UpdateDetSubModulo',
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
              swalFire.success('Detalle de sub modulo actualizado correctamente', '', {
                1: () => {
                  $('#modalEditDetSubModulo').modal('hide');
                  CdetsubmodulosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al actualizar el detalle del sub modulo')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el detalle del sub modulo']);
        $.ajax({
          url: uisApis.API + '=DeleteDetSubModulo',
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
              swalFire.success('sub modulo eliminado correctamente', '', {
                1: () => $(`#${detsubmodulosTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el detalle sub modulo')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        URL: agregarValidaciones({
          required: true
        }),
      },
      UPDATE: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        URL: agregarValidaciones({
          required: true
        }),
      }
    }
  };

  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
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
      }
    }
  };

  return {
    init: async () => {
      await globalCrud.init();
      func.limitarCaracteres();
      moduloCrud.init();
      moduloCrud.globales();
      subModulosCrud.globales();
      detSubModulosCrud.globales();

      var myTabs = document.querySelectorAll('.nav-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');
          if (tabPane === '#navs-modulos') {
            redirect(false, 'navs-submodulos', 0);
            redirect(false, 'navs-submodulodet', 0);
            moduloCrud.eventos.TABLEMODULO();
          }

          if (tabPane === '#navs-submodulos') {
            redirect(false, 'navs-submodulodet', 0);
            subModulosCrud.eventos.TABLESUBMODULO();
          }

          if (tabPane === '#navs-submodulodet') {
            detSubModulosCrud.init();
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
