/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Usuarios/Personas/Index?handler',
    MR: '/Seguridad/Marcas/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler',
    ROL: '/Usuarios/Roles/Index?handler'
  };

  // * VARIABLES
  let personasTable = 'personasTable';
  let CpersonasTable = null;

  // * TABLAS
  const personasCrud = {
    init: () => {
      personasCrud.eventos.TABLEPERSONAS();
    },
    globales: () => {
      // * MODALES
      $('#modalAddPersona').on('show.bs.modal', function (e) {
        personasCrud.variables.myDropzoneAddPersona.removeAllFiles(true);
        configFormVal('AddPersona', personasCrud.validaciones.INSERT, () => personasCrud.eventos.INSERT());
      });

      $('#modalEditPersona').on('show.bs.modal', function (e) {
        personasCrud.variables.myDropzoneEditPersona.removeAllFiles(true);
        configFormVal('EditPersona', personasCrud.validaciones.UPDATE, () => personasCrud.eventos.UPDATE());
        func.actualizarForm('EditPersona', personasCrud.variables.rowEdit);
        if (personasCrud.variables.rowEdit?.fto) {
          let filename = personasCrud.variables.rowEdit?.namefto;
          let rtafto = `data:${personasCrud.variables.rowEdit?.tpofto};base64,${personasCrud.variables.rowEdit?.fto}`;
          let blob = new Blob([rtafto], { type: personasCrud.variables.rowEdit?.tpofto });
          let fileOfBlob = new File([blob], filename);
          fileOfBlob.dataURL = rtafto;
          fileOfBlob.isExist = true;
          personasCrud.variables.myDropzoneEditPersona.files.push(fileOfBlob);
          personasCrud.variables.myDropzoneEditPersona.emit('addedfile', fileOfBlob);
          personasCrud.variables.myDropzoneEditPersona.emit('complete', fileOfBlob);
        }
      });

      // * FORMULARIOS
      $(`#${personasTable}`).on('click', '.edit-persona-button', function () {
        const data = CpersonasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el contacto seleccionado');
        personasCrud.variables.rowEdit = data;
        $('#modalEditPersona').modal('show');
      });

      $(`#${personasTable}`).on('click', '.delete-persona-button', function () {
        const data = CpersonasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el rol seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar la plantilla?', {
          1: () => personasCrud.eventos.DELETE(data.id)
        });
      });

      // * DROPZONE
      let dropzoneBasicAdd = $('#AddPersona #dropzone-area');
      if (dropzoneBasicAdd) {
        personasCrud.variables.myDropzoneAddPersona = new Dropzone(dropzoneBasicAdd[0], {
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

      let dropzoneBasicEdit = $('#EditPersona #dropzone-area');
      if (dropzoneBasicEdit) {
        personasCrud.variables.myDropzoneEditPersona = new Dropzone(dropzoneBasicEdit[0], {
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
      rowEdit: {},
      myDropzoneAddPersona: null,
      myDropzoneEditPersona: null
    },
    eventos: {
      TABLEPERSONAS: () => {
        $(`#${personasTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CpersonasTable) {
          CpersonasTable = $(`#${personasTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(personasTable);
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
                data: null,
                title: 'Persona',
                className: 'text-left',
                render: data => {
                  const name = data?.ncmpto || '';
                  const email = data?.correo || '';
                  const image = data?.fto || null;

                  let output;

                  if (image) {
                    output = `<img src="data:${data.tpofto};base64,${image}" class="rounded-circle avatar-sm me-3" alt="avatar" height="32" width="32">`;
                  } else {
                    const states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
                    const initials = (name.match(/\b\w/g) || [])
                      .map(char => char.toUpperCase())
                      .slice(0, 2)
                      .join('');
                    const state = states[Math.floor(Math.random() * states.length)];

                    output = `<span class="avatar-initial rounded-circle bg-label-${state}">${initials}</span>`;
                  }

                  return `
                      <div class="d-flex justify-content-start align-items-center user-name">
                          <div class="avatar-wrapper">
                              <div class="avatar avatar-sm me-3">${output}</div>
                          </div>
                          <div class="d-flex flex-column">
                              <span class="fw-medium">${name}</span>
                              <small class="text-muted">${email}</small>
                          </div>
                      </div>
                  `;
                }
              },
              {
                data: null,
                title: 'Rol',
                className: 'text-left',
                render: data => {
                  return data.rol || '';
                }
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
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-persona-button" title="Editar"><i class="bx bx-edit"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${personasTable}`).find('.radio-buttons').length == 0) {
                $(`#${personasTable}_filter`).append(radio_group_estados);

                $(`#${personasTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${personasTable}`).DataTable().ajax.reload();
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
                  $('#modalAddPersona').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CpersonasTable.ajax.reload();
        }
      },
      INSERT: () => {
        let file = personasCrud.variables.myDropzoneAddPersona.files[0];

        let formData = new FormData();
        formData.append('IDROL', $('#AddPersona #IDROL').val());
        formData.append('IDMRCA', $('#AddPersona #IDMRCA').val());
        formData.append('NOMBRS', $('#AddPersona #NOMBRS').val());
        formData.append('SNOMBRS', $('#AddPersona #SNOMBRS').val());
        formData.append('APLLDS', $('#AddPersona #APLLDS').val());
        formData.append('SAPLLDS', $('#AddPersona #SAPLLDS').val());
        formData.append('DCUMNTO', $('#AddPersona #DCUMNTO').val());
        formData.append('CORREO', $('#AddPersona #CORREO').val());
        formData.append('PASSWORD', $('#AddPersona #PASSWORD').val());
        formData.append('PRMSO', $('#AddPersona #PRMSO').is(':checked'));
        formData.append('FTO', file);
        formData.append('CESTDO', $('#AddPersona #CESTDO').val());
        formData.append('ANEXO', $('#AddPersona #ANEXO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando a la persona']);
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
              swalFire.success('Persona registrada correctamente', '', {
                1: () => {
                  $('#modalAddPersona').modal('hide');
                  CpersonasTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar la persona')
        });
      },
      UPDATE: () => {
        let file = personasCrud.variables.myDropzoneEditPersona.files[0];
        let deleteFile = false;
        if(file && file.isExist) file = null; // misma imagen
        else if(!file) deleteFile = true; // ninguna imagen
        
      
        let formData = new FormData();
        formData.append('ID', personasCrud.variables.rowEdit.id);
        formData.append('IDROL', $('#EditPersona #IDROL').val());
        formData.append('IDMRCA', $('#EditPersona #IDMRCA').val());
        formData.append('NOMBRS', $('#EditPersona #NOMBRS').val());
        formData.append('SNOMBRS', $('#EditPersona #SNOMBRS').val());
        formData.append('APLLDS', $('#EditPersona #APLLDS').val());
        formData.append('SAPLLDS', $('#EditPersona #SAPLLDS').val());
        formData.append('DCUMNTO', $('#EditPersona #DCUMNTO').val());
        formData.append('CORREO', $('#EditPersona #CORREO').val());
        formData.append('PASSWORD', $('#EditPersona #PASSWORD').val() || "");
        formData.append('PRMSO', $('#EditPersona #PRMSO').is(':checked'));
        formData.append('FTO', file);
        formData.append('DELETE', deleteFile);
        formData.append('CESTDO', $('#EditPersona #CESTDO').val());
        formData.append('RTAFTO', personasCrud.variables.rowEdit?.rtafto || '');
        formData.append('ANEXO', $('#EditPersona #ANEXO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando a la persona']);
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
              swalFire.success('Persona actualizada correctamente', '', {
                1: () => {
                  $('#modalEditPersona').modal('hide');
                  CpersonasTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar a la persona')
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
                1: () => $(`#${personasTable}`).DataTable().ajax.reload()
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
        IDMRCA: agregarValidaciones({
          required: true
        }),
        IDROL: agregarValidaciones({
          required: true
        }),
        NOMBRS: agregarValidaciones({
          required: true
        }),
        APLLDS: agregarValidaciones({
          required: true
        }),
        SAPLLDS: agregarValidaciones({
          required: true
        }),
        DCUMNTO: agregarValidaciones({
          required: true
        }),
        CORREO: agregarValidaciones({
          required: true,
          regexp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
        }),
        PASSWORD: agregarValidaciones({
          required: true,
          minlength: 8,
        })
      },
      UPDATE: {
        IDMRCA: agregarValidaciones({
          required: true
        }),
        IDROL: agregarValidaciones({
          required: true
        }),
        NOMBRS: agregarValidaciones({
          required: true
        }),
        APLLDS: agregarValidaciones({
          required: true
        }),
        SAPLLDS: agregarValidaciones({
          required: true
        }),
        DCUMNTO: agregarValidaciones({
          required: true
        }),
        CORREO: agregarValidaciones({
          required: true,
          regexp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
        })
      }
    }
  };

  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
      globalCrud.eventos.selectsForm();
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
      selectsForm: () => {
        let urlMarcas = `${uisApis.MR}=Obtener&start=0&length=100`;
        let urlRoles = `${uisApis.ROL}=Buscar&start=0&length=10000`;

        Promise.all([
          fetch(urlMarcas).then(response => response.json()),
          fetch(urlRoles).then(response => response.json())
        ])
          .then(([resultMarcas, resultRoles]) => {
            globalCrud.generarSelects2('IDMRCA', resultMarcas?.data || [], 'id', 'mrca');
            globalCrud.generarSelects2('IDROL', resultRoles?.data || [], 'id', 'dscrpcn');
          })
          .catch(error => swalFire.error('Ocurrió un error al cargar los datos'));
      }
    },
    generarSelects2: (id, data, value, label) => {
      let selects = document.querySelectorAll(`select[name=${id}]`);
      selects.forEach(select => {
        select.innerHTML = '';
        select.innerHTML = `<option value="">-- Seleccione</option>`;
        data.forEach(d => {
          select.innerHTML += `<option value="${d[value]}">${d[label]}</option>`;
        });
      });
    }
  };

  return {
    init: async () => {
      func.limitarCaracteres();
      func.selects2();
      await globalCrud.init();
      personasCrud.init();
      personasCrud.globales();
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
