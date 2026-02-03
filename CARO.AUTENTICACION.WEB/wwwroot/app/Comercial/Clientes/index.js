/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Comercial/Clientes/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler',
    MR: '/Seguridad/Marcas/Index?handler',
    PER: '/Usuarios/Personas/Index?handler',
  };

  // * VARIABLES
  let clientesTable = 'clientesTable';
  let seguimientoTable = 'seguimientoTable';
  let CclientesTable = null;
  let CseguimientoTable = null;
  let polarChartVar;
  let horizontalBarChartVar;
  
  // * TABLAS
  const clientesCrud = {
    init: () => {
      clientesCrud.eventos.TABLE();
    },
    globales: () => {
      const fullEditor = new Quill('#AddCliente #APUNTES', {
        bounds: '#full-editor',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });

      const fullEditorEdit = new Quill('#EditCliente #APUNTES', {
        bounds: '#full-editor',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });

      let dropzoneBasic = $('#AddCliente #dropzone-area');
      if (dropzoneBasic) {
        clientesCrud.variables.myDropzoneAddCliente = new Dropzone(dropzoneBasic[0], {
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

      let dropzoneBasicEdit = $('#EditCliente #dropzone-area');
      if (dropzoneBasic) {
        clientesCrud.variables.myDropzoneEditCliente = new Dropzone(dropzoneBasicEdit[0], {
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
                img.on('click', function () {
                  createModalImage(reader.result);
                });
              };
            });
          }
        });
      }

      // * MODALES
      $('#modalAddCliente').on('show.bs.modal', function (e) {
        clientesCrud.variables.myDropzoneAddCliente.removeAllFiles(true);
        configFormVal('AddCliente', clientesCrud.validaciones.INSERT, () => clientesCrud.eventos.INSERT());
      });

      $('#modalEditCliente').on('show.bs.modal', function (e) {
        clientesCrud.variables.myDropzoneEditCliente.removeAllFiles(true);
        configFormVal('EditCliente', clientesCrud.validaciones.UPDATE, () => clientesCrud.eventos.UPDATE());
        func.actualizarForm('EditCliente', clientesCrud.variables.rowEdit);
        if (clientesCrud.variables.rowEdit.rtaimg) {
          agregarArchivoADropzone(clientesCrud.variables.rowEdit.rtaimg, clientesCrud.variables.myDropzoneEditCliente);
        }
      });

      // * FORMULARIOS
      $(`#${clientesTable}`).on('click', '.edit-row-button', function () {
        const data = CclientesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el cliente seleccionado');
        clientesCrud.variables.rowEdit = data;
        $('#modalEditCliente').modal('show');
      });

      $(`#${clientesTable}`).on('click', '.delete-row-button', function () {
        const data = CclientesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el cliente seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el cliente?', {
          1: () => clientesCrud.eventos.DELETE(data.id)
        });
      });

      $(`#${clientesTable}`).on('click', '.view-row-button', function () {
        const data = CclientesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el cliente seleccionado');
        clientesCrud.variables.rowEdit = data;
        redirect(true, 'navs-seguimiento', data.id);
      });
    },
    variables: {
      rowEdit: {},
      myDropzoneAddCliente: null,
      myDropzoneEditCliente: null
    },
    eventos: {
      TABLE: () => {
        $(`#${clientesTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CclientesTable) {
          CclientesTable = $(`#${clientesTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(clientesTable);
              },
            },
            columns: [
              {
                data: null,
                title: '',
                orderable: false,
                className: 'text-center',
                render: function (data, type, row, meta) {
                  // Mostrar el número de fila y la flecha juntos
                  return `
                                        <div style="display:flex;align-items:center;justify-content:center;gap:4px;">
                                            <button class='btn btn-sm btn-icon auditoria-row' title='Ver auditoría' tabindex="-1"><i class='bx bx-chevron-right'></i></button>
                                            <span style="min-width:22px;display:inline-block;">${data.rn || meta.row + 1}</span>
                                        </div>
                                    `;
                }
              },
              {
                data: null, title: 'Cliente',
                render: data => {
                  return `<div class="d-flex align-items-center">
                            <div class="avatar bg-light-primary me-1">
                                <div class="avatar-content">
                                      <img 
                                          class="rounded-circle"
                                          src="${data.rtaimg ? data.rtaimg : 'https://imageplaceholder.net/150x150'}" 
                                          alt="avatar" 
                                          onerror="this.src='https://imageplaceholder.net/150x150'" 
                                          width="150" 
                                          height="150"
                                      >  
                                </div>
                            </div>
                            <div class="d-flex flex-column m-2">
                                <span class="fw-bolder">${data.nmbrs} ${data.apllds}</span>
                                <small class="text-muted text-capitalize">${data.ruc}</small>
                                <small class="text-muted text-capitalize">${data.rznscl}</small>
                            </div>
                        </div>`;
                }
              },
              { data: "mrca", title: "Marca", },
              { data: "motivo", title: "Motivo", width: "20%" },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'
                    }></i></span>`;
                }
              },
              { data: null, title: 'U. Edición', render: data => data.uedcn.split('@')[0] },
              { data: null, title: 'F. Edición', render: data => func.formatFecha(data.fedcn, 'DD-MM-YYYY HH:mm a') },
              {
                data: null,
                title: '',
                className: 'text-center',
                render: data => {
                  return `<div class="d-flex justify-content-center m-0 p-0">
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-row-button" title="Editar"><i class="bx bx-edit"></i></button>
                        <button name="ELIMINAR" class="btn btn-sm btn-icon delete-row-button" title="Eliminar"><i class="bx bx-trash"></i></button>
                        <button name="VER" class="btn btn-sm btn-icon view-row-button" title="Ver"><i class="bx bx-show"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${clientesTable}`).find('.radio-buttons').length == 0) {
                $(`#${clientesTable}_filter`).append(radio_group_estados);

                $(`#${clientesTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${clientesTable}`).DataTable().ajax.reload();
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];

              buttons.unshift({
                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                className: 'erp-btn erp-btn-secondary',
                action: function (e, dt, node, config) {
                  $('#modalAddCliente').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CclientesTable.ajax.reload();
        }
      },
      INSERT: () => {
        let file = clientesCrud.variables.myDropzoneAddCliente.files[0];

        let formData = new FormData();
        formData.append('NMBRS', $('#AddCliente #NMBRS').val());
        formData.append('APLLDS', $('#AddCliente #APLLDS').val());
        formData.append('RUC', $('#AddCliente #RUC').val());
        formData.append('RZNSCL', $('#AddCliente #RZNSCL').val());
        formData.append('DRCCN', $('#AddCliente #DRCCN').val());
        formData.append('CORREO', $('#AddCliente #CORREO').val());
        formData.append('CNTCTO', $('#AddCliente #CNTCTO').val());
        formData.append('IDMRCA', $('#AddCliente #IDMRCA').val());
        formData.append('MOTIVO', $('#AddCliente #MOTIVO').val());
        formData.append('APUNTES', $('#AddCliente #APUNTES .ql-editor').html());
        formData.append('GDESTDOCLI', $('#AddCliente #GDESTDOCLI').val());
        formData.append('IMG', file ? file : null);
        formData.append('CESTDO', $('#AddCliente #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el cliente']);
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
              swalFire.success('Cliente registrado correctamente', '', {
                1: () => {
                  $('#modalAddCliente').modal('hide');
                  CclientesTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el cliente')
        });
      },
      UPDATE: () => {
        let file = clientesCrud.variables.myDropzoneEditCliente.files[0];

        let formData = new FormData();
        formData.append('ID', clientesCrud.variables.rowEdit.id);
        formData.append('NMBRS', $('#EditCliente #NMBRS').val());
        formData.append('APLLDS', $('#EditCliente #APLLDS').val());
        formData.append('RUC', $('#EditCliente #RUC').val());
        formData.append('RZNSCL', $('#EditCliente #RZNSCL').val());
        formData.append('DRCCN', $('#EditCliente #DRCCN').val());
        formData.append('CORREO', $('#EditCliente #CORREO').val());
        formData.append('CNTCTO', $('#EditCliente #CNTCTO').val());
        formData.append('IDMRCA', $('#EditCliente #IDMRCA').val());
        formData.append('MOTIVO', $('#EditCliente #MOTIVO').val());
        formData.append('APUNTES', $('#EditCliente #APUNTES .ql-editor').html());
        formData.append('GDESTDOCLI', $('#EditCliente #GDESTDOCLI').val());
        formData.append('IMG', file ? file : null);
        formData.append('RTAIMG', file ? clientesCrud.variables.rowEdit?.rtaimg : "");
        formData.append('CESTDO', $('#EditCliente #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el cliente']);
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
              swalFire.success('Cliente actualizado correctamente', '', {
                1: () => {
                  $('#modalEditCliente').modal('hide');
                  CclientesTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el cliente')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el cliente']);
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
              swalFire.success('Cliente eliminado correctamente', '', {
                1: () => $(`#${clientesTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el cliente')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        NMBRS: agregarValidaciones({
          required: true
        }),
        APLLDS: agregarValidaciones({
          required: true
        }),
        IDMRCA: agregarValidaciones({
          required: true
        }),
        GDESTDOCLI: agregarValidaciones({
          required: true
        }),
        MOTIVO: agregarValidaciones({
          required: true
        }),
      },
      UPDATE: {
        NMBRS: agregarValidaciones({
          required: true
        }),
        APLLDS: agregarValidaciones({
          required: true
        }),
        IDMRCA: agregarValidaciones({
          required: true
        }),
        GDESTDOCLI: agregarValidaciones({
          required: true
        }),
        MOTIVO: agregarValidaciones({
          required: true
        }),
      }
    }
  };

  const seguimientoCrud = {
    init: () => {
      seguimientoCrud.eventos.TABLE();
    },
    globales: () => {
      const fullEditor = new Quill('#AddSeguimiento #APUNTES', {
        bounds: '#full-editor',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });

      const fullEditorEdit = new Quill('#EditSeguimiento #APUNTES', {
        bounds: '#full-editor',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });

      // * MODALES
      $('#modalAddSeguimiento').on('show.bs.modal', function (e) {
        configFormVal('AddSeguimiento', seguimientoCrud.validaciones.INSERT, () =>
          seguimientoCrud.eventos.INSERT()
        );
      });

      $('#modalEditSeguimiento').on('show.bs.modal', function (e) {
        configFormVal('EditSeguimiento', seguimientoCrud.validaciones.UPDATE, () =>
          seguimientoCrud.eventos.UPDATE()
        );
        func.actualizarForm('EditSeguimiento', seguimientoCrud.variables.rowEdit);
      });

      // * FORMULARIOS
      $(`#${seguimientoTable}`).on('click', '.edit-row-button', function () {
        const data = CseguimientoTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle de seguimeinto seleccionado');
        seguimientoCrud.variables.rowEdit = data;
        $('#modalEditSeguimiento').modal('show');
      });

      $(`#${seguimientoTable}`).on('click', '.delete-row-button', function () {
        const data = CseguimientoTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle de seguimeinto seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el detalle de seguimeinto ?', {
          1: () => seguimientoCrud.eventos.DELETE(data.id)
        });
      });
    },
    variables: {
      rowEdit: {}
    },
    eventos: {
      TABLE: () => {
        $(`#${seguimientoTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${seguimientoTable}_title`).text('CLIENTE: ' + clientesCrud.variables.rowEdit?.nmbrs + ' ' + clientesCrud.variables.rowEdit?.apllds);

        if (!CseguimientoTable) {
          CseguimientoTable = $(`#${seguimientoTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarSeguimiento',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDCLIENTE = clientesCrud.variables.rowEdit.id;
                d.CESTDO = func.obtenerCESTDO(seguimientoTable);
              }
            },
            columns: [
              {
                data: null,
                title: '',
                orderable: false,
                className: 'text-center',
                render: function (data, type, row, meta) {
                  // Mostrar el número de fila y la flecha juntos
                  return `
                                        <div style="display:flex;align-items:center;justify-content:center;gap:4px;">
                                            <button class='btn btn-sm btn-icon auditoria-row' title='Ver auditoría' tabindex="-1"><i class='bx bx-chevron-right'></i></button>
                                            <span style="min-width:22px;display:inline-block;">${data.rn || meta.row + 1}</span>
                                        </div>
                                    `;
                }
              },
              { data: null, title: 'Fecha', render: data => func.formatFecha(data.fcha, 'DD-MM-YYYY') },
              { data: 'motivo', title: 'Motivo' },
              { data: 'nprsna', title: 'Persona' },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'
                    }></i></span>`;
                }
              },
              { data: null, title: 'U. Edición', render: data => data.uedcn.split('@')[0] },
              { data: null, title: 'F. Edición', render: data => func.formatFecha(data.fedcn, 'DD-MM-YYYY HH:mm a') },
              {
                data: null,
                title: '',
                className: 'text-center',
                render: data => {
                  return `<div class="d-flex justify-content-center m-0 p-0">
                          <button name="EDITAR" class="btn btn-sm btn-icon edit-row-button" title="Editar"><i class="bx bx-edit"></i></button>
                          <button name="ELIMINAR" class="btn btn-sm btn-icon delete-row-button" title="Eliminar"><i class="bx bx-trash"></i></button>
                       </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${seguimientoTable}`).find('.radio-buttons').length == 0) {
                $(`#${seguimientoTable}_filter`).append(radio_group_estados);

                $(`#${seguimientoTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${seguimientoTable}`).DataTable().ajax.reload();
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];

              // AGREGAR al inicio PLANTILLA
              buttons.unshift({
                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                className: 'erp-btn erp-btn-secondary',
                action: function (e, dt, node, config) {
                  $('#modalAddSeguimiento').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CseguimientoTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('FCHA', $('#AddSeguimiento #FCHA').val());
        formData.append('MOTIVO', $('#AddSeguimiento #MOTIVO').val());
        formData.append('IDPRSNA', $('#AddSeguimiento #IDPRSNA').val());
        formData.append('APUNTES', $('#AddSeguimiento #APUNTES .ql-editor').html());
        formData.append('IDCLIENTE', clientesCrud.variables.rowEdit.id);
        formData.append('CESTDO', $('#AddSeguimiento #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el detalle el seguimiento']);
        $.ajax({
          url: uisApis.API + '=AddSeguimiento',
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
              swalFire.success('Seguimiento de Cliente registrado correctamente', '', {
                1: () => {
                  $('#modalAddSeguimiento').modal('hide');
                  CseguimientoTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al agregar el seguimiento')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', seguimientoCrud.variables.rowEdit.id);
        formData.append('FCHA', $('#EditSeguimiento #FCHA').val());
        formData.append('MOTIVO', $('#EditSeguimiento #MOTIVO').val());
        formData.append('IDPRSNA', $('#EditSeguimiento #IDPRSNA').val());
        formData.append('APUNTES', $('#EditSeguimiento #APUNTES .ql-editor').html());
        formData.append('CESTDO', $('#EditSeguimiento #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el detalle del seguimiento']);
        $.ajax({
          url: uisApis.API + '=UpdateSeguimiento',
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
              swalFire.success('Seguimiento actualizado correctamente', '', {
                1: () => {
                  $('#modalEditSeguimiento').modal('hide');
                  CseguimientoTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al actualizar el detalle del seguimiento')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el detalle del seguimiento']);
        $.ajax({
          url: uisApis.API + '=DeleteSeguimiento',
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
              swalFire.success('Seguimiento eliminado correctamente', '', {
                1: () => $(`#${seguimientoTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el detalle del seguimiento')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        FCHA: agregarValidaciones({
          required: true
        }),
        MOTIVO: agregarValidaciones({
          required: true
        }),
        IDPRSNA: agregarValidaciones({
          required: true
        }),
      },
      UPDATE: {
        FCHA: agregarValidaciones({
          required: true
        }),
        MOTIVO: agregarValidaciones({
          required: true
        }),
        IDPRSNA: agregarValidaciones({
          required: true
        }),
      }
    }
  };

  const reporteCrud = {
    init: () => {
      func.selects2("FormReporte");
      reporteCrud.eventos.REPORTE();
    },
    globales: () => {
      // evento a formReporte IDMRCA, que es un select2
      $('#FormReporte #IDMRCA').select2().on('change', function () {
        reporteCrud.eventos.REPORTE();
      });
    },
    eventos: {
      REPORTE: () => {
        swalFire.cargando(['Espere un momento', 'Estamos obteniendo el reporte']);
        $.ajax({
          url: uisApis.API + '=Reporte&IDMRCA=' + $('#FormReporte #IDMRCA').val(),
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
          },
          type: 'GET',
          success: function (response) {
            if (response.success) {
              reporteCrud.eventos.BARTCHARTJS(response.data);
              reporteCrud.eventos.PASTELCHARTJS(response.data);
              swalFire.cerrar();
              return
            }

            swalFire.error("Ocurrió un error al obtener el reporte");

          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al obtener el reporte')
        });
      },
      BARTCHARTJS: (data) => {
        const horizontalBarChart = document.getElementById('horizontalBarChart');

        if(horizontalBarChartVar) {
          horizontalBarChartVar.destroy();
        }

        if (horizontalBarChart) {
          horizontalBarChartVar = new Chart(horizontalBarChart, {
            type: 'bar',
            data: {
              labels: data.map(d => d.descp),
              datasets: [
                {
                  data: data.map(d => d.cant),
                  backgroundColor: '#17a2b8', // Color de fondo (similar a config.colors.info)
                  borderColor: 'transparent',
                  maxBarThickness: 15
                }
              ]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 500
              },
              elements: {
                bar: {
                  borderRadius: {
                    topRight: 15,
                    bottomRight: 15
                  }
                }
              },
              plugins: {
                tooltip: {
                  rtl: false, 
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  titleColor: '#fff', 
                  bodyColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#fff', 
                  padding: 10
                },
                legend: {
                  display: false,
                  padding: 25,
                }
              },
              scales: {
                x: {
                  min: 0,
                  grid: {
                    color: '#ddd',
                    borderColor: '#ddd' 
                  },
                  ticks: {
                    color: '#666' // Color de las etiquetas del eje x
                  }
                },
                y: {
                  grid: {
                    borderColor: '#ddd',
                    display: false,
                    drawBorder: false
                  },
                  ticks: {
                    color: '#666' 
                  },
                  categorySpacing: 0.4,
                  barPercentage: 0.8, 
                  categoryPercentage: 0.7
                }
              }
            }
          });

        }
      },
      PASTELCHARTJS: (data) => {
        const polarChart = document.getElementById('polarChart');

        if(polarChartVar) {
          polarChartVar.destroy();
        }

        if (polarChart) {
          polarChartVar = new Chart(polarChart, {
            type: 'polarArea',
            data: {
              labels: data.map(d => d.descp),
              datasets: [
                {
                  label: 'Clientes',
                  backgroundColor: ['#6f42c1', '#ffc107', '#fd7e14', '#007bff', '#6c757d', '#17a2b8'], // Colores personalizados para cada sección
                  data: data.map(d => d.cant),
                  borderWidth: 0
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 500
              },
              scales: {
                r: {
                  ticks: {
                    display: false,
                    color: '#666' 
                  },
                  grid: {
                    display: false
                  }
                }
              },
              plugins: {
                tooltip: {
                  rtl: false, 
                  backgroundColor: '#f8f9fa', 
                  titleColor: '#343a40',
                  bodyColor: '#666', 
                  borderWidth: 1,
                  borderColor: '#ddd'
                },
                legend: {
                  rtl: false, 
                  position: 'right',
                  labels: {
                    usePointStyle: true,
                    padding: 25,
                    boxWidth: 8,
                    boxHeight: 8,
                    color: '#666' 
                  }
                }
              }
            }
          });
        }
      }
    }
  }


  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
      globalCrud.eventos.otros();
    },
    eventos: {
      selects: () => {
        let GRUPODATOS = "GDESTDOCLI,CEEE";
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
            let SELECTSG = GRUPODATOS.split(',');
            if (response?.data) {
              // todos los selects dentro EditPlantilla AddPlantilla, que no sea CESTDO
              let selects = document.querySelectorAll("select");
              selects = Array.from(selects).filter(select => SELECTSG.includes(select.getAttribute('name')));
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
      otros: () => {
        const fetchPER = new Promise((resolve, reject) => {
          $.ajax({
            url: `${uisApis.PER}=Buscar&start=0&length=100`,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET',
            success: response => resolve(response),
            error: error => reject('Ocurrió un error al cargar los datos de personas')
          });
        });

        const fetchMR = new Promise((resolve, reject) => {
          $.ajax({
            url: `${uisApis.MR}=Obtener&start=0&length=100`,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET',
            success: response => resolve(response),
            error: error => reject('Ocurrió un error al cargar los datos MR')
          });
        });

        Promise.all([fetchMR, fetchPER])
          .then(([dataMR, dataPER]) => {
            if (dataMR?.data) {
              let selects = document.querySelectorAll('#IDMRCA');
              selects.forEach(select => {
                select.innerHTML = '';
                select.innerHTML += `<option value="">-- Seleccione</option>`;
                dataMR.data.forEach(d => {
                  select.innerHTML += `<option value="${d.id}">${d.mrca}</option>`;
                });
              });
            }

            if (dataPER?.data) {
              let selects = document.querySelectorAll('#IDPRSNA');
              selects.forEach(select => {
                select.innerHTML = '';
                select.innerHTML += `<option value="">-- Seleccione</option>`;
                dataPER.data.forEach(d => {
                  select.innerHTML += `<option value="${d.id}">${d.ncmpto}</option>`;
                });
              });
            }
          })
          .catch(error => swalFire.error(error));
      },

    }
  };

  return {
    init: async () => {
      await globalCrud.init();
      await func.limitarCaracteres()

      clientesCrud.init();
      clientesCrud.globales();
      seguimientoCrud.globales();
      reporteCrud.globales();

      var myTabs = document.querySelectorAll('.nav-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');
          if (tabPane === '#navs-clientes') {
            redirect(false, 'navs-seguimiento', 0);
            clientesCrud.eventos.TABLE();
          }

          if (tabPane === '#navs-seguimiento') {
            seguimientoCrud.eventos.TABLE();
          }

          if (tabPane === '#navs-reporte') {
            reporteCrud.init();
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
