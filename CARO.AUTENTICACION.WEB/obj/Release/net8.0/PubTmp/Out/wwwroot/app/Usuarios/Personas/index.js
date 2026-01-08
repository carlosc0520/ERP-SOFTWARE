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
  let grupoDatosBD = {};
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
        $('#AddPersona #PROVINCIA').html('').prop('disabled', true);
        $('#AddPersona #DISTRITO').html('').prop('disabled', true);
        $('#AddPersona #tblRedesSociales tbody').html('');
      });

      $('#modalEditPersona').on('show.bs.modal', async function (e) {
        let tabla = $("#EditPersona #tblRedesSociales tbody");
        tabla.html('');
        personasCrud.variables.myDropzoneEditPersona.removeAllFiles(true);
        configFormVal('EditPersona', personasCrud.validaciones.UPDATE, () => personasCrud.eventos.UPDATE());
        func.actualizarForm('EditPersona', personasCrud.variables.rowEdit);

        console.log(personasCrud.variables.rowEdit);
        $('#EditPersona #PROVINCIA').html('').prop('disabled', true);
        $('#EditPersona #DISTRITO').html('').prop('disabled', true);
        if (personasCrud.variables.rowEdit?.departamento) {
          await globalCrud.eventos.obtenerUbigeos(2, personasCrud.variables.rowEdit.departamento, '', ['#EditPersona #PROVINCIA']);
          $('#EditPersona #PROVINCIA').val(personasCrud.variables.rowEdit?.provincia).trigger('change');
        }

        if (personasCrud.variables.rowEdit?.provincia) {
          await globalCrud.eventos.obtenerUbigeos(3, personasCrud.variables.rowEdit.departamento, personasCrud.variables.rowEdit.provincia, ['#EditPersona #DISTRITO']);
          $('#EditPersona #DISTRITO').val(personasCrud.variables.rowEdit?.distrito).trigger('change');
        }

        let redes = JSON.parse(personasCrud.variables.rowEdit.redes || '[]');
        redes.forEach(r => {
          let textRed = grupoDatosBD['GDREDSOCIAL'].find(red => red.vlR1 === r.IDRED)?.dtlle || '';
          tabla.append(`<tr>
            <td>${textRed}</td>
            <td>${r.ENLACE}</td>
            <td class="text-center"><button type="button" class="btn btn-sm btn-danger btnEliminarRed"><i class="bx bx-trash"></i></button></td>
            <td class="d-none">${r.ID ? `<input type="hidden" value="${r.ID}">` : ''}</td>
          </tr>`);
        });
        tabla.find('.btnEliminarRed').off('click').on('click', function () {
          $(this).closest('tr').remove();
        });

        if (personasCrud.variables.rowEdit?.rtafto) {
          let rutaArchivo = personasCrud.variables.rowEdit?.rtafto;
          agregarArchivoADropzone(rutaArchivo, personasCrud.variables.myDropzoneEditPersona);
        }
      });

      // SELECT
      $('#AddPersona #DEPARTAMENTO').on('change', function () {
        let departamento = $(this).val();
        $('#AddPersona #PROVINCIA').html('').prop('disabled', true);
        $('#AddPersona #DISTRITO').html('').prop('disabled', true);
        if (departamento) globalCrud.eventos.obtenerUbigeos(2, departamento, '', ['#AddPersona #PROVINCIA']);
      });

      $('#AddPersona #PROVINCIA').on('change', function () {
        let departamento = $('#AddPersona #DEPARTAMENTO').val();
        let provincia = $(this).val();
        $('#AddPersona #DISTRITO').html('').prop('disabled', true);
        if (provincia) globalCrud.eventos.obtenerUbigeos(3, departamento, provincia, ['#AddPersona #DISTRITO']);
      });

      $('#EditPersona #DEPARTAMENTO').on('change', function () {
        let departamento = $(this).val();
        $('#EditPersona #PROVINCIA').html('').prop('disabled', true);
        $('#EditPersona #DISTRITO').html('').prop('disabled', true);
        if (departamento) globalCrud.eventos.obtenerUbigeos(2, departamento, '', ['#EditPersona #PROVINCIA']);
      });

      $('#EditPersona #PROVINCIA').on('change', function () {
        let departamento = $('#EditPersona #DEPARTAMENTO').val();
        let provincia = $(this).val();
        $('#EditPersona #DISTRITO').html('').prop('disabled', true);
        if (provincia) globalCrud.eventos.obtenerUbigeos(3, departamento, provincia, ['#EditPersona #DISTRITO']);
      });

      $("#AddPersona #btnAddRedSocial").on('click', function () {
        let idRed = $("#AddPersona #GDREDSOCIAL").val();
        let textRed = $("#AddPersona #GDREDSOCIAL option:selected").text();
        let enlace = $("#AddPersona #ENLACE").val().trim();
        if (!idRed) return swalFire.info('Seleccione una red social');
        if (!/^https?:\/\//i.test(enlace)) return swalFire.info('Ingrese un enlace válido (http o https)');

        let tabla = $("#AddPersona #tblRedesSociales tbody");
        tabla.append(`<tr>
          <td>${textRed}</td>
          <td>${enlace}</td>
          <td><button type="button" class="btn btn-sm btn-danger btnEliminarRed"><i class="bx bx-trash"></i></button></td>
          <td class="d-none">${idRed ? `<input type="hidden" value="${idRed}">` : ''}</td>
        </tr>`);

        $("#AddPersona #GDREDSOCIAL").val('').trigger('change');
        $("#AddPersona #ENLACE").val('');

        tabla.find('.btnEliminarRed').off('click').on('click', function () {
          $(this).closest('tr').remove();
        });
      });

      $("#EditPersona #btnAddRedSocial").on('click', function () {
        let idRed = $("#EditPersona #GDREDSOCIAL").val();
        let textRed = $("#EditPersona #GDREDSOCIAL option:selected").text();
        let enlace = $("#EditPersona #ENLACE").val().trim();
        if (!idRed) return swalFire.info('Seleccione una red social');
        if (!/^https?:\/\//i.test(enlace)) return swalFire.info('Ingrese un enlace válido (http o https)');
        let tabla = $("#EditPersona #tblRedesSociales tbody");
        tabla.append(`<tr>
          <td>${textRed}</td>
          <td>${enlace}</td>
          <td class="text-center"><button type="button" class="btn btn-sm btn-danger btnEliminarRed"><i class="bx bx-trash"></i></button></td>
          <td class="d-none"><input type="hidden" value=""></td>
        </tr>`);
        $("#EditPersona #GDREDSOCIAL").val('').trigger('change');
        $("#EditPersona #ENLACE").val('');
        tabla.find('.btnEliminarRed').off('click').on('click', function () {
          $(this).closest('tr').remove();
        });
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
                  let output;

                  if (data?.rtafto) {
                    output = `<img src="${data.rtafto}" class="rounded-circle avatar-sm me-3" alt="avatar" height="32" width="32">`;
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
        let tabla = $("#AddPersona #tblRedesSociales tbody tr");
        let redes = [];
        tabla.each(function () {
          let red = {};
          let IDRED = grupoDatosBD['GDREDSOCIAL'].find(r => r.dtlle === $(this).find('td').eq(0).text());
          red['ID'] = null,
            red['IDRED'] = IDRED ? IDRED.vlR1 : null;
          red['ENLACE'] = $(this).find('td').eq(1).text();
          redes.push(red);
        });

        let formData = new FormData();
        formData.append('NOMBRS', $('#AddPersona #NOMBRS').val());
        formData.append('SNOMBRS', $('#AddPersona #SNOMBRS').val());
        formData.append('APLLDS', $('#AddPersona #APLLDS').val());
        formData.append('SAPLLDS', $('#AddPersona #SAPLLDS').val());
        formData.append('DCUMNTO', $('#AddPersona #DCUMNTO').val());
        formData.append('CORREO', $('#AddPersona #CORREO').val());
        formData.append('TELFNO', $('#AddPersona #TELFNO').val());
        formData.append('DEPARTAMENTO', $('#AddPersona #DEPARTAMENTO option:selected').text());
        formData.append('PROVINCIA', $('#AddPersona #PROVINCIA option:selected').text());
        formData.append('DISTRITO', $('#AddPersona #DISTRITO option:selected').text());
        formData.append('DIRECCION', $('#AddPersona #DIRECCION').val());
        formData.append('IDMRCA', $('#AddPersona #IDMRCA').val());
        formData.append('CARGO', $('#AddPersona #CARGO').val());
        formData.append('IDROL', $('#AddPersona #IDROL').val());
        formData.append('RESENA', $('#AddPersona #RESENA').val());
        formData.append('PASSWORD', $('#AddPersona #PASSWORD').val());
        formData.append('PRMSO', $('#AddPersona #PRMSO').is(':checked'));
        formData.append('FTO', file);
        formData.append('CESTDO', $('#AddPersona #CESTDO').val());
        formData.append('REDESVAR', JSON.stringify(redes));


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
                  $('#AddPersona #tblRedesSociales tbody').html('');
                  redes = [];
                  personasCrud.variables.myDropzoneAddPersona.removeAllFiles(true);
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
        if (file && file.isExist) file = null;
        else if (!file) deleteFile = true;

        let tabla = $("#EditPersona #tblRedesSociales tbody tr");
        let redes = [];
        tabla.each(function () {
          let red = {};
          let IDRED = grupoDatosBD['GDREDSOCIAL'].find(r => r.dtlle === $(this).find('td').eq(0).text());
          red['ID'] = $(this).find('td').eq(3).find('input').val() || null;
          red['IDRED'] = IDRED ? IDRED.vlR1 : null;
          red['ENLACE'] = $(this).find('td').eq(1).text();
          redes.push(red);
        });

        redes = redes.filter(r => r.IDRED && r.ENLACE);
        redes.forEach(r => {
          if (r.ID && isNaN(parseInt(r.ID))) r.ID = null;
          else if (r.ID) r.ID = parseInt(r.ID);
        });



        let formData = new FormData();
        formData.append('ID', personasCrud.variables.rowEdit.id);
        formData.append('NOMBRS', $('#EditPersona #NOMBRS').val());
        formData.append('SNOMBRS', $('#EditPersona #SNOMBRS').val());
        formData.append('APLLDS', $('#EditPersona #APLLDS').val());
        formData.append('SAPLLDS', $('#EditPersona #SAPLLDS').val());
        formData.append('DCUMNTO', $('#EditPersona #DCUMNTO').val());
        formData.append('CORREO', $('#EditPersona #CORREO').val());
        formData.append('TELFNO', $('#EditPersona #TELFNO').val());
        formData.append('DEPARTAMENTO', $('#EditPersona #DEPARTAMENTO option:selected').text());
        formData.append('PROVINCIA', $('#EditPersona #PROVINCIA option:selected').text());
        formData.append('DISTRITO', $('#EditPersona #DISTRITO option:selected').text());
        formData.append('DIRECCION', $('#EditPersona #DIRECCION').val());
        formData.append('IDMRCA', $('#EditPersona #IDMRCA').val());
        formData.append('CARGO', $('#EditPersona #CARGO').val());
        formData.append('IDROL', $('#EditPersona #IDROL').val());
        formData.append('RESENA', $('#EditPersona #RESENA').val());
        formData.append('PASSWORD', $('#EditPersona #PASSWORD').val() || "");
        formData.append('PRMSO', $('#EditPersona #PRMSO').is(':checked'));
        formData.append('FTO', file);
        formData.append('DELETE', deleteFile);
        formData.append('CESTDO', $('#EditPersona #CESTDO').val());
        formData.append('RTAFTO', personasCrud.variables.rowEdit?.rtafto || '');
        formData.append('ANEXO', $('#EditPersona #ANEXO').val());
        formData.append('REDESVAR', JSON.stringify(redes));



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
                  redes = [];
                  personasCrud.variables.myDropzoneEditPersona.removeAllFiles(true);
                  personasCrud.variables.rowEdit = {};
                  $('#EditPersona #tblRedesSociales tbody').html('');
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
      globalCrud.eventos.obtenerUbigeos(1, '', '', ["#AddPersona #DEPARTAMENTO, #EditPersona #DEPARTAMENTO"]);
    },
    eventos: {
      selects: () => {
        let GRUPODATOS = 'GDREDSOCIAL';
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
              GRUPODATOS.split(',').forEach(g => {
                let datos = response.data.filter(d => d.gdpdre === g);
                grupoDatosBD[g] = datos;
                $("select[name='" + g + "']").html('<option value="">-- Seleccione</option>');
                datos.forEach(d => {
                  $("select[name='" + g + "']").append('<option value="' + d.vlR1 + '">' + d.dtlle + '</option>');
                });
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
      },
      obtenerUbigeos: async (IND, DDPRTMNTO, DPRVNCA, REF = []) => {
        await $.ajax({
          url: uisApis.GD + '=Ubigeos&IND=' + IND + '&DDPRTMNTO=' + DDPRTMNTO + '&DPRVNCA=' + DPRVNCA,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'GET',
          success: function (response) {
            if (response?.data.length > 0) {
              REF.forEach(r => {
                $(r).prop('disabled', false);
                $(r).html('<option value="">-- Seleccione</option>');
                response.data.forEach(d => {
                  $(r).append(`<option value="${d.label}">${d.label}</option>`);
                });
              });
            }
          },
          error: error => swalFire.error('Ocurrió un error al cargar los ubigeos')
        });
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
