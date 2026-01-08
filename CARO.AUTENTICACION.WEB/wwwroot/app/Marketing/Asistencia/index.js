/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Marketing/Asistencia/Index?handler',
    CUR: '/Comercial/Cursos/Index?handler',
    DETCUR: '/Comercial/Cursos/Detalle/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler'
  };

  // * VARIABLES
  let cursosTable = 'cursosTable';
  let asistenciaTable = 'asistenciaTable';
  let participantesTable = 'participantesTable';
  let AsistenciaParticipanteTable = 'AsistenciaParticipanteTable';
  let CcursosTable = null;
  let CasistenciaTable = null;
  let CparticipantesTable = null;
  let CAsistenciaParticipanteTable = null;

  let usersList = [];
  let calendar = null;
  let bsAddEventSidebar = null;

  let myDropzoneEditConfig = null;

  const formateador = (tiempo = 0) => {
    if ([null, undefined].includes(tiempo)) return "";
    if (tiempo < 60) {
      return (tiempo + " min.");
    }

    const horas = Math.floor(tiempo / 60);
    const minutos = tiempo % 60;
    return (horas + " hrs " + minutos + " min.");
  }

  function combinarFechaYHoraLocal(fechaSeleccionada) {
    const ahora = new Date();
    const [año, mes, dia] = fechaSeleccionada.split('-');

    // Obtener hora local actual
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    console.log(`${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}`);
    return `${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
  }



  // * TABLAS
  const cursosCrud = {
    init: () => {
      cursosCrud.eventos.TABLECURSOS();
    },
    globales: () => {
      let dropzoneBasicEdit = $('#modalEditConfiguracion #dropzone-area');
      if (dropzoneBasicEdit) {
        myDropzoneEditConfig = new Dropzone(dropzoneBasicEdit[0], {
          previewTemplate: previewTemplate('archivo'),
          createImageThumbnails: false,
          parallelUploads: 1,
          maxFilesize: 50,
          maxFiles: 1,
          acceptedFiles: 'pdf, application/pdf',
          init: function () {
            this.on('addedfile', async function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }
            });
          }
        });
      }

      // * FORMULARIOS
      $(`#${cursosTable}`).on('click', '.view-calendario-row-button', function () {
        const data = CcursosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el curso seleccionado');
        cursosCrud.variables.rowEdit = data;
        redirect(true, 'navs-calendario', data.id);
      });

      $(`#${cursosTable}`).on('click', '.view-row-button', function () {
        const data = CcursosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el curso seleccionado');
        cursosCrud.variables.rowEdit = data;
        redirect(true, 'navs-participantes', data.id);
      });

      $(`#${cursosTable}`).on('click', '.view-configuracion-button', function () {
        const data = CcursosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el curso seleccionado');
        cursosCrud.variables.rowEdit = data;
        $('#modalEditConfiguracion').modal('show');
      });

      $(`#${cursosTable}`).on('click', '.view-horas-button', function () {
        const data = CcursosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el curso seleccionado');
        cursosCrud.variables.rowEdit = data;
        redirect(true, 'navs-asistencia', data.id);
      });

      $('#modalEditConfiguracion').on('show.bs.modal', function (e) {
        if (cursosCrud.variables.rowEdit.cestdo == 'I') {
          $("#modalEditConfiguracion #btnEditConfiguracion").addClass('d-none');
        } else {
          $("#modalEditConfiguracion #btnEditConfiguracion").removeClass('d-none');
        }

        myDropzoneEditConfig.removeAllFiles(true);
        configFormVal('EditConfiguracion', cursosCrud.validaciones.EDITAR, () => cursosCrud.eventos.EDITAR());
        if (cursosCrud.variables.rowEdit?.rtafto)
          agregarArchivoADropzoneFile(cursosCrud.variables.rowEdit?.rtafto, myDropzoneEditConfig, 'EditConfiguracion');
        func.actualizarForm('EditConfiguracion', cursosCrud.variables.rowEdit);
      });
    },
    variables: {
      rowEdit: {}
    },
    eventos: {
      TABLECURSOS: () => {
        $(`#${cursosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CcursosTable) {
          CcursosTable = $(`#${cursosTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.CUR + '=BuscarTable',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(cursosTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              {
                data: null,
                title: 'Imagen',
                render: data => `
                <a href="${data.imagen}" target="_blank">
                <img src="${data.imagen}" class="img-thumbnail" width="50" height="50" />
                </a>
                
                `
              },
              { data: 'dscrpcn', title: 'Descripción' },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span>
                    <i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-black-50'}" 
                      title=${data.cestdo == 'A' ? 'Activo' : data.cestdo == 'I' ? 'Terminado' : 'Inactivo'}>
                    </i></span>`;
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
                        <button name="VER" class="btn btn-sm btn-icon view-calendario-row-button" title="Ver"><i class="bx bx-show"></i></button>
                        <button name="PARTICIPANTES" class="btn btn-sm btn-icon view-row-button" title="Participantes"><i class="bx bx-user"></i></button>
                        <button name="HORAS" 
                          ${data.cestdo == 'I' ? 'disabled' : ''}
                        class="btn btn-sm btn-icon view-horas-button" title="Reg, horas"><i class="bx bx-time"></i></button>
                        <button name="CONFIGURACION" class="btn btn-sm btn-icon view-configuracion-button" title="Configuración"><i class="bx bx-cog"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${cursosTable}`).find('.radio-buttons').length == 0) {
                $(`#${cursosTable}_filter`).append(radio_group_estados);

                $(`#${cursosTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${cursosTable}`).DataTable().ajax.reload();
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              return [];
            })()
          });
        } else {
          CcursosTable.ajax.reload();
        }
      },
      EDITAR: () => {
        let file = myDropzoneEditConfig.files[0];
        if (!file) return swalFire.error('Debe seleccionar un archivo');

        let formData = new FormData();
        formData.append('ID', cursosCrud.variables.rowEdit.id);
        formData.append('EJEX', $('#EditConfiguracion #EJEX').val());
        formData.append('EJEY', $('#EditConfiguracion #EJEY').val());
        formData.append('EJEX2', $('#EditConfiguracion #EJEX2').val());
        formData.append('EJEY2', $('#EditConfiguracion #EJEY2').val());
        formData.append('FILE', file.isExist ? null : file);
        formData.append('RTAFTO', cursosCrud.variables.rowEdit?.rtafto || '');
        formData.append('CESTDO', $('#EditConfiguracion #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando la configuración del curso']);
        $.ajax({
          url: uisApis.API + '=UpdateConfig',
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
              swalFire.success('Configuración del curso actualizado correctamente', '', {
                1: () => {
                  $('#modalEditConfiguracion').modal('hide');
                  CcursosTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al actualizar la configuración del curso')
        });
      }
    },
    formularios: {},
    validaciones: {
      EDITAR: {
        EJEX: agregarValidaciones({
          required: true
        }),
        EJEY: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const asistenciaCrud = {
    init: () => {
      asistenciaCrud.eventos.TABLEASISTENCIA();
      asistenciaCrud.variables.isOn = false;
      if (asistenciaCrud.variables.html5QrcodeScanner) {
        asistenciaCrud.variables.html5QrcodeScanner.clear();
        $('#reader').addClass('d-none');
      }
    },
    globales: () => {
      // * MODALES
      $('#modalAddSubModulo').on('show.bs.modal', function (e) {
        configFormVal('AddSubModulo', asistenciaCrud.validaciones.INSERT, () => asistenciaCrud.eventos.INSERT());
        $('#AddSubModulo #GDPDRE').val(cursosCrud.variables.rolEdit.dtlle);
      });

      $('#modalEditSubModulo').on('show.bs.modal', function (e) {
        configFormVal('EditSubModulo', asistenciaCrud.validaciones.UPDATE, () => asistenciaCrud.eventos.UPDATE());
        func.actualizarForm('EditSubModulo', asistenciaCrud.variables.rolEdit);
      });

      // * FORMULARIOS
      $(`#${asistenciaTable}`).on('click', '.edit-grupodato-button', function () {
        const data = CasistenciaTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del sub modulo seleccionado');
        asistenciaCrud.variables.rolEdit = data;
        $('#modalEditSubModulo').modal('show');
      });

      $(`#${asistenciaTable}`).on('click', '.delete-grupodato-button', function () {
        const data = CasistenciaTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del sub modulo seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el detalle del sub modulo?', {
          1: () => asistenciaCrud.eventos.DELETE(data.id)
        });
      });

      $(`#${asistenciaTable}`).on('click', '.view-grupodato-button', function () {
        const data = CasistenciaTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el detalle del sub modulo seleccionado');
        asistenciaCrud.variables.rolEdit = data;
        redirect(true, 'navs-submodulodet', data.id);
      });

      // Hacer que el div sea arrastrable
      const makeElementDraggable = (elmnt) => {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        const dragMouseDown = (e) => {
          e = e || window.event;
          e.preventDefault();

          pos3 = e.clientX;
          pos4 = e.clientY;

          pos1 = elmnt.offsetLeft;
          pos2 = elmnt.offsetTop;

          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        }

        elmnt.onmousedown = dragMouseDown;

        const elementDrag = (e) => {
          e = e || window.event;
          e.preventDefault();

          // Calcular el nuevo desplazamiento
          const newPosX = pos1 + (e.clientX - pos3);
          const newPosY = pos2 + (e.clientY - pos4);

          // Establecer la nueva posición del elemento
          elmnt.style.left = newPosX + "px";
          elmnt.style.top = newPosY + "px";
        }

        const closeDragElement = () => {
          // Detener el arrastre al soltar el mouse
          document.onmouseup = null;
          document.onmousemove = null;
        }
      }

      // Aplicar la función al lector QR
      makeElementDraggable(document.getElementById("reader"));


    },
    variables: {
      rolEdit: {},
      html5QrcodeScanner: new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      ),
      isOn: false
    },
    eventos: {
      TABLEASISTENCIA: () => {
        $(`#${asistenciaTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${asistenciaTable}_title`).text(cursosCrud.variables.rowEdit?.dscrpcn || '');

        if (!CasistenciaTable) {
          CasistenciaTable = $(`#${asistenciaTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Asistencias',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDCRSO = cursosCrud.variables.rowEdit.id;
                d.FCHA = $(`#${asistenciaTable}_filter #FCHA`).val() || '';
                d.CESTDO = func.obtenerCESTDO(asistenciaTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'nombres', title: 'Inscrito(a)' },
              { data: null, title: 'F. Entrada', render: data => func.formatFecha(data.fingreso, 'DD-MM-YYYY HH:mm a') },
              { data: null, title: 'F. Salida', render: data => func.formatFecha(data.fsalida, 'DD-MM-YYYY HH:mm a') },
              { data: 'uedcn', title: 'U. Edición' },
            ],
            initComplete: function (settings, json) {
              $(`#${asistenciaTable}_filter`).find('input[type="search"]').off('keyup search input paste change');

              if (!$(`#${asistenciaTable}_filter #FCHA`).length > 0) {
                $(`#${asistenciaTable}_filter`).prepend(`
                              <div class="col-12 col-md-4" style="margin: 0px!important; padding: 0px!important;">
                                  <div class="input-group" style="flex-wrap: nowrap!important;">
                                      <input type="text" id="FCHA" name="FCHA" placeholder="YYYY-MM-DD" class="form-control date-mask dob-picker" />
                                      <span class="input-group-text">
                                          <i class="bi bi-calendar"></i>
                                      </span>
                                  </div>
                              </div>
                          `);

                flatpickr(`#${asistenciaTable}_filter #FCHA`, {
                  altFormat: 'Y-m-d',
                  dateFormat: 'Y-m-d',
                  altInput: true,
                  allowInput: true,
                  disableMobile: true,
                  locale: {
                    firstDayOfWeek: 1,
                    weekdays: {
                      shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
                      longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                    },
                    months: {
                      shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                      longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    },
                  },
                  // bloquear dias posteriores
                  maxDate: new Date(),
                  onClose: function (selectedDates, dateStr, instance) {
                    if (dateStr === '') {
                      instance.setDate(null);
                    }
                  },
                });

                $(`#${asistenciaTable}_filter #FCHA`)?.[0]?._flatpickr?.setDate(new Date().toISOString().split('T')[0]);
              }

              // input de texto bloqueado
              if (!$(`#${asistenciaTable}_filter #QR`).length > 0) {
                $(`#${asistenciaTable}_filter`).prepend(`
                              <div class="col-12 col-md-4" style="margin: 0px!important; padding: 0px!important;">
                                  <div class="input-group" style="flex-wrap: nowrap!important;">
                                      <input type="text" 
                                      autocomplete="off"
                                      id="QR" name="QR" placeholder="Código QR" class="form-control" />
                                  </div>
                              </div>
                          `);


                // evento para detectar cuando un qr fue leido y ya se introdusco todo en el inpt
                $(`#${asistenciaTable}_filter #QR`).on('input', function () {
                  if ($(this).val().length == 20) {
                    asistenciaCrud.eventos.ASISTENCIA_2($(this).val(), $(this));
                  }
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];

              // BOTON SAVE
              // buttons.unshift({
              //   text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Off - On</span>',
              //   className: 'btn btn-label-primary btn-add-new',
              //   action: function (e, dt, node, config) {
              //     asistenciaCrud.eventos.ASISTENCIA();
              //   }
              // });

              // buscar
              buttons.push({
                text: '<i class="bx bx-search me-0 me-md-2"></i><span class="d-none d-md-inline-block">Buscar</span>',
                className: 'btn btn-label-secondary btn-search',
                action: function (e, dt, node, config) {
                  $(`#${asistenciaTable}`).DataTable().search($(`#${asistenciaTable}_filter input[type="search"]`).val()).draw();

                }
              });

              return buttons;
            })()
          });
        } else {
          CasistenciaTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('IDMDLO', cursosCrud.variables.rolEdit.id);
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
                  CasistenciaTable.ajax.reload();
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
        formData.append('ID', asistenciaCrud.variables.rolEdit.id);
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
                  CasistenciaTable.ajax.reload();
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
                1: () => $(`#${asistenciaTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el SubModulo')
        });
      },
      ASISTENCIA: () => {
        if (asistenciaCrud.variables.isOn) {
          $('#reader').addClass('d-none');
          asistenciaCrud.variables.html5QrcodeScanner.clear();
          asistenciaCrud.variables.isOn = false;
          return;
        }


        asistenciaCrud.variables.isOn = true;
        $('#reader').removeClass('d-none');
        const onScanSuccess = (decodedText, decodedResult) => {

          if (!$(`#${asistenciaTable}_filter #FCHA`).val()) {
            swalFire.error('Ingrese una fecha válida');
            return;
          }

          asistenciaCrud.variables.html5QrcodeScanner.pause();
          let FCHA = $(`#${asistenciaTable}_filter #FCHA`).val();

          let formData = new FormData();
          formData.append('IDCRSO', cursosCrud.variables.rowEdit.id);
          formData.append('CODIGO', decodedText);
          formData.append('IDPRTCPNTE', "");
          formData.append('FCHA', combinarFechaYHoraLocal(FCHA));
          formData.append('CESTDO', 'A');

          swalFire.cargando(['Espere un momento', 'Estamos registrando la asistencia']);

          $.ajax({
            url: uisApis.API + '=AddAsistencia',
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'POST',
            dataType: 'json',
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
              if (data?.codEstado >= 0) {
                swalFire.success(data.codEstado == 0 ? "Se registró su entrada correctamente" : "Se registró su salida correctamente", "", {
                  1: () => {
                    CasistenciaTable.ajax.reload();
                  }
                });

              }

              if (data?.codEstado < 0) swalFire.error(data.mensaje);

              asistenciaCrud.variables.html5QrcodeScanner.resume();
            },
            error: (jqXHR, textStatus, errorThrown) => {
              swalFire.error('Ocurrió un error al registrar la asistencia');
              asistenciaCrud.variables.html5QrcodeScanner.resume();
            }
          });
        };

        const onScanFailure = (error) => {
          asistenciaCrud.variables.html5QrcodeScanner.resume();
        };

        asistenciaCrud.variables.html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      },
      ASISTENCIA_2: (decodedText, referencia) => {

        if (!$(`#${asistenciaTable}_filter #FCHA`).val()) {
          swalFire.error('Ingrese una fecha válida');
          return;
        }

        let FCHA = $(`#${asistenciaTable}_filter #FCHA`).val();
        let formData = new FormData();
        formData.append('IDCRSO', cursosCrud.variables.rowEdit.id);
        formData.append('CODIGO', decodedText);
        formData.append('IDPRTCPNTE', "");
        formData.append('FCHA', combinarFechaYHoraLocal(FCHA));
        formData.append('CESTDO', 'A');

        swalFire.cargando(['Espere un momento', 'Estamos registrando la asistencia']);

        $.ajax({
          url: uisApis.API + '=AddAsistencia',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: function (data) {
            if (data?.codEstado >= 0) {
              swalFire.success(data.codEstado == 0 ? "Se registró su entrada correctamente" : "Se registró su salida correctamente", "", {
                1: () => {
                  referencia.val('');
                  CasistenciaTable.ajax.reload();
                }
              });

            }

            if (data?.codEstado < 0) {
              referencia.val('');
              swalFire.error(data.mensaje);
            }
          },
          error: (jqXHR, textStatus, errorThrown) => {
            referencia.val('');
            swalFire.error('Ocurrió un error al registrar la asistencia');
          }
        });
      },
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        URL: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        URL: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const participantesCrud = {
    init: () => {
      participantesCrud.eventos.TABLEPARTICIPANTES();
    },
    globales: () => {
      // * MODALES
      $('#modalAddParticipante').on('show.bs.modal', function (e) {
        configFormVal('AddParticipante', participantesCrud.validaciones.INSERT, () =>
          participantesCrud.eventos.INSERT()
        );
      });

      $('#modalEditParticipante').on('show.bs.modal', function (e) {
        configFormVal('EditParticipante', participantesCrud.validaciones.UPDATE, () =>
          participantesCrud.eventos.UPDATE()
        );
        func.actualizarForm('EditParticipante', participantesCrud.variables.rowEdit);
      });

      // * FORMULARIOS
      $(`#${participantesTable}`).on('click', '.edit-row-button', function () {
        const data = CparticipantesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el participante seleccionado');
        participantesCrud.variables.rowEdit = data;
        $('#modalEditParticipante').modal('show');
      });

      $(`#${participantesTable}`).on('click', '.delete-row-button', function () {
        const data = CparticipantesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el participante seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el participante?', {
          1: () => participantesCrud.eventos.DELETE(data.id)
        });
      });

      $(`#${participantesTable}`).on('click', '.view-view-button', function () {
        const data = CparticipantesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el participante seleccionado');
        participantesCrud.variables.rowData = data;
        $("#modalAsistenciaParticipante").modal('show');
        participantesCrud.eventos.TABLEDETALLE();
      });

      $(`#${participantesTable}`).on('click', '.view-row-button', function () {
        const data = CparticipantesTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el participante seleccionado');
        participantesCrud.eventos.DOWNLOADQR(data.id, 1);
      });
    },
    variables: {
      rowEdit: {},
      rowData: {}
    },
    eventos: {
      TABLEPARTICIPANTES: () => {
        console.log(cursosCrud.variables.rowEdit.cestdo)
        $(`#${participantesTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${participantesTable}_title`).text('CURSO : ' + cursosCrud.variables.rowEdit?.dscrpcn || '');

        if (!CparticipantesTable) {
          CparticipantesTable = $(`#${participantesTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Participantes',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDEVENTO = cursosCrud.variables.rowEdit.id;
                d.CESTDO = func.obtenerCESTDO(participantesTable);
              },
              dataSrc: function (json) {
                return json.data.map((x, i) => {
                  x.registros = JSON.parse(x.registros);
                  return x;
                })
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'nombres', title: 'Participante' },
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
                            <button name="EDITAR" 
                            ${cursosCrud.variables.rowEdit.cestdo == 'I' ? 'disabled' : ''}
                            class="btn btn-sm btn-icon edit-row-button" title="Editar"><i class="bx bx-edit"></i></button>
                            <button 
                            ${cursosCrud.variables.rowEdit.cestdo == 'I' ? 'disabled' : ''}
                            name="ELIMINAR" class="btn btn-sm btn-icon delete-row-button" title="Eliminar"><i class="bx bx-trash"></i></button>
                            <button name="DESCARGAR" class="btn btn-sm btn-icon view-row-button" title="Descargar"><i class="bx bx-download"></i></button>
                            <button name="VER" class="btn btn-sm btn-icon view-view-button" title="Ver"><i class="bx bx-show me-0 me-md-2"></i></button>
                         </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${participantesTable}`).find('.radio-buttons').length == 0) {
                $(`#${participantesTable}_filter`).append(radio_group_estados);

                $(`#${participantesTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${participantesTable}`).DataTable().ajax.reload();
                });
              }

            },
            drawCallback: function (settings) {
              $(`#${participantesTable}_wrapper .btn-add-new`).prop('disabled', cursosCrud.variables.rowEdit.cestdo != 'A');
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];

              // AGREGAR al inicio PLANTILLA
              buttons.unshift({
                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                className: 'btn btn-label-primary btn-add-new',
                action: function (e, dt, node, config) {
                  $('#modalAddParticipante').modal('show');
                }
              });

              // boton exportar ZIP
              buttons.push({
                text: '<i class="bx bx-download me-0 me-md-2"></i><span class="d-none d-md-inline-block">Credenciales</span>',
                className: 'btn btn-label-secondary btn-export-zip',
                action: function (e, dt, node, config) {
                  participantesCrud.eventos.DOWNLOADQR(null, 2);
                }
              });

              // boton reprote excel
              buttons.push({
                text: '<i class="bx bx-file me-0 me-md-2"></i><span class="d-none d-md-inline-block">Reporte</span>',
                className: 'btn btn-label-secondary btn-export-excel',
                action: function (e, dt, node, config) {
                  participantesCrud.eventos.DOWNLOADEXCEL();
                }
              });

              return buttons;
            })()
          });
        } else {
          CparticipantesTable.ajax.reload();
        }
      },
      TABLEDETALLE: () => {
        if (!CAsistenciaParticipanteTable) {
          CAsistenciaParticipanteTable = $(`#${AsistenciaParticipanteTable}`).DataTable({
            ...configTable(null, null, [[10, 15, 20, -1], [10, 15, 20, "Todos"]], true),
            serverSide: false,
            data: participantesCrud.variables.rowData.registros.map((item, i) => {
              return {
                rn: i + 1,
                ...item
              }
            }),
            columns: [
              { data: "rn", title: '', width: "5%" },
              { data: "DIA", title: 'Día', width: "10%" },
              { data: null, title: "F. Ingreso", width: "20%", className: "text-center", render: (data) => func.formatearFechaA(data.FINGRESO2) },
              { data: null, title: "F. Salida", width: "20%", className: "text-center", render: (data) => func.formatearFechaA(data.FSALIDA2) },
              {
                data: null, title: 'Tiempo', width: "20%", className: "text-center",
                render: (data) => data?.MINUTOS_TOTAL ? `${data.MINUTOS_TOTAL} min` : '0 min'
              },
            ],
            columnDefs: [],
            buttons:
              (() => {
                let buttons = []
                return buttons;
              })()
          });
        } else {
          CAsistenciaParticipanteTable.clear().rows.add(participantesCrud.variables.rowData.registros.map((item, i) => ({
            rn: i + 1,
            ...item
          }))).draw();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('IDEVENTO', cursosCrud.variables.rowEdit.id);
        formData.append('NOMBRES', $('#AddParticipante #NOMBRES').val());
        formData.append('APELLIDOS', $('#AddParticipante #APELLIDOS').val());
        formData.append('DNI', $('#AddParticipante #DNI').val());
        formData.append('CORREO', $('#AddParticipante #CORREO').val());
        formData.append('CESTDO', $('#AddParticipante #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el participante']);
        $.ajax({
          url: uisApis.API + '=AddParticipante',
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
              swalFire.success('participante registrado correctamente', '', {
                1: () => {
                  $('#modalAddParticipante').modal('hide');
                  CparticipantesTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el participante')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', participantesCrud.variables.rowEdit.id);
        formData.append('NOMBRES', $('#EditParticipante #NOMBRES').val());
        formData.append('APELLIDOS', $('#EditParticipante #APELLIDOS').val());
        formData.append('DNI', $('#EditParticipante #DNI').val());
        formData.append('CORREO', $('#EditParticipante #CORREO').val());
        formData.append('CESTDO', $('#EditParticipante #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el participante']);
        $.ajax({
          url: uisApis.API + '=UpdateParticipante',
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
              swalFire.success('participante actualizado correctamente', '', {
                1: () => {
                  $('#modalEditParticipante').modal('hide');
                  CparticipantesTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el participante')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el detalle del sub modulo']);
        $.ajax({
          url: uisApis.API + '=DeleteParticipante',
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
              swalFire.success('participante eliminado correctamente', '', {
                1: () => $(`#${participantesTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el participante')
        });
      },
      DOWNLOADQR: (data, type) => {
        let length = type == 1 ? 1 : 99999;
        swalFire.cargando(['Espere un momento', 'Estamos descargando el archivo']);
        $.ajax({
          url:
            uisApis.API +
            '=QRDownload&ID=' +
            (data?.id || "") +
            '&IDEVENTO=' +
            cursosCrud.variables.rowEdit.id +
            '&IND=' +
            type +
            '&ROWS=' +
            length +
            '&INIT=0&draw=1',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
          },
          type: 'GET',
          success: async function (response) {
            if (response.data && type == 1) {
              let blob = await base64toBlob(response.data, 'application/pdf');
              let link = document.createElement('a');
              link.href = window.URL.createObjectURL(blob);
              link.download = response.nombre + '.pdf';
              link.click();
              swalFire.success('Archivo descargado correctamente');
              return;
            }

            if (response.data && type == 2) {
              let blob = await base64toBlob(response.data, 'application/zip');
              let link = document.createElement('a');
              link.href = window.URL.createObjectURL(blob);
              link.download = response.nombre + '.zip';
              link.click();
              swalFire.success('Archivo descargado correctamente');
              return;
            }
            swalFire.error('Ocurrió un error al descargar el archivo');
          },
          error: error => swalFire.error('Ocurrió un error al descargar el archivo')
        });
      },
      DOWNLOADEXCEL: () => {
        swalFire.cargando(['Espere un momento', 'Estamos descargando el archivo']);

        $.ajax({
          url: uisApis.API + '=AsistenciasParticipante&IDCRSO=' + cursosCrud.variables.rowEdit.id + '&length=99999&draw=1&start=0',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
          },
          type: 'GET',
          data: {
            IDEVENTO: cursosCrud.variables.rowEdit.id
          },
          success: async function (response) {
            if (response.data && response.data.length > 0) {
              const workbook = new ExcelJS.Workbook();
              let data = response.data;

              let columnas = ['', 'DIA', 'INGRESO', 'SALIDA', 'TARDANZA', 'ANTICIPADO', 'HORAS ACUMULADAS'];
              const abecedario = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

              data.map((participante, index) => {
                let columna = 0;
                const worksheet = workbook.addWorksheet(participante.nombres);
                for (let i = 0; i < columnas.length; i++) {
                  worksheet.getCell(`${abecedario[columna]}10`).value = columnas[i];
                  worksheet.getCell(`${abecedario[columna]}10`).font = { bold: true };
                  columna++;
                }

                let fila = 11;
                let minutosTotales = 0;
                let minutosTardanzas = 0;
                let inasistencias = 0;
                let registros = JSON.parse(participante?.registros || '[]');
                registros.map((item, index) => {
                  worksheet.getCell(`A${fila}`).value = index + 1;
                  worksheet.getCell(`B${fila}`).value = item.DIA;
                  worksheet.getCell(`C${fila}`).value = item.FINGRESO2;
                  worksheet.getCell(`D${fila}`).value = item.FSALIDA2;
                  worksheet.getCell(`E${fila}`).value = formateador(item.MINUTOS_TARDANZA);
                  worksheet.getCell(`F${fila}`).value = formateador(item.MINUTOS_ANTES);
                  worksheet.getCell(`G${fila}`).value = formateador(item.MINUTOS_ACUM);

                  minutosTotales += item.MINUTOS_ACUM;
                  minutosTardanzas += item.MINUTOS_TARDANZA;
                  if ([null, undefined, "-"].includes(item.FINGRESO2)) {
                    inasistencias++;
                  }
                  fila++;
                });

                columnas.forEach((columna, index) => {
                  const col = worksheet.getColumn(index + 1);
                  let maxLength = 0;

                  col.eachCell({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value ? cell.value.toString().length : 0;
                    if (columnLength > maxLength) {
                      maxLength = columnLength;
                    }
                  });

                  col.width = maxLength < 10 ? 10 : maxLength;
                });

                for (let i = 0; i < columnas.length; i++) {
                  worksheet.getColumn(abecedario[i]).alignment = { vertical: 'middle', horizontal: 'center' };
                }

                worksheet.getCell('A4').value = 'PARTICIPANTE:';
                worksheet.getCell('A4').font = { bold: true };
                worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'left' };
                worksheet.getCell('B4').value = participante.nombres;

                worksheet.getCell('A5').value = 'FECHA DE REPORTE:';
                worksheet.getCell('A5').font = { bold: true };
                worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'left' };
                worksheet.getCell('B5').value = new Date().toLocaleDateString();

                worksheet.getCell(`A6`).value = 'TOTAL DE HORAS ACUMULADAS:';
                worksheet.getCell(`A6`).font = { bold: true };
                worksheet.getCell(`A6`).alignment = { vertical: 'middle', horizontal: 'left' };
                worksheet.getCell(`B6`).value = formateador(minutosTotales);

                worksheet.getCell(`A7`).value = 'TOTAL HORAS DE TARDANZAS:';
                worksheet.getCell(`A7`).font = { bold: true };
                worksheet.getCell(`A7`).alignment = { vertical: 'middle', horizontal: 'left' };
                worksheet.getCell(`B7`).value = formateador(minutosTardanzas);

                worksheet.getCell(`A8`).value = 'TOTAL DE INASISTENCIAS:';
                worksheet.getCell(`A8`).font = { bold: true };
                worksheet.getCell(`A8`).alignment = { vertical: 'middle', horizontal: 'left' };
                worksheet.getCell(`B8`).value = inasistencias;

                worksheet.getColumn('A').width = 30;


              });

              const buffer = await workbook.xlsx.writeBuffer();
              saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Reporte_${cursosCrud.variables.rowEdit.dscrpcn}.xlsx`);
              swalFire.success('Archivo descargado correctamente');
            } else {
              swalFire.error('No se encontraron registros para descargar');
            }
          },
          error: error => swalFire.error('Ocurrió un error al descargar el archivo')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        NOMBRES: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        NOMBRES: agregarValidaciones({
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

  const calendarioCrud = {
    init: () => {
      calendarioCrud.reloadCalendar();
    },
    reloadCalendar: () => {
      $.ajax({
        url: uisApis.API + '=Buscar&start=0&CESTDO=&length=1000&draw=1&IDCRSO=' + cursosCrud.variables.rowEdit.id,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
        },
        success: function (response) {
          console.log(response);
          let events = response.data.map(d => {
            return {
              id: d.id,
              title: d.dscrpcn,
              start: new Date(d.fini),
              end: new Date(d.ffin),
              extendedProps: {
                ID: d.id,
                EVENTTITLE: d.dscrpcn,
                EVENTSTARTDATE: d.fini,
                EVENTENDDATE: d.ffin,
                CESTDO: d.cestdo,
                EVENTGUESTS: d.prfesrs
              }
            };
          });

          calendar.removeAllEvents();
          calendar.addEventSource(events);
          calendar.render();
        }
      });
    },
    globales: async () => {
      await calendarioCrud.MODAL();
    },
    MODAL: async () => {
      // * MODAL INPUTS CALENDAR AGREGAR
      let inlineCalendar = document.querySelector('.inline-calendar');
      let inlineCalInstance = inlineCalendar.flatpickr({
        monthSelectorType: 'static',
        inline: true,
        locale: {
          firstDayOfWeek: 1,
          weekdays: {
            shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
            longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
          },
          months: {
            shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            longhand: [
              'Enero',
              'Febrero',
              'Marzo',
              'Abril',
              'Mayo',
              'Junio',
              'Julio',
              'Agosto',
              'Septiembre',
              'Octubre',
              'Noviembre',
              'Diciembre'
            ]
          }
        }
      });

      inlineCalInstance.config.onChange.push(function (date) {
        calendar.changeView(calendar.view.type, moment(date[0]).format('YYYY-MM-DD'));
        modifyToggler();
        appCalendarSidebar.classList.remove('show');
        appOverlay.classList.remove('show');
      });

      // USER LIST
      await $.ajax({
        url: uisApis.DETCUR + '=Buscar&start=0&length=1000&draw=1&IDCRSO=' + cursosCrud.variables.rowEdit.id,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
        }
      }).done(function (response) {
        usersList = response.data.map(d => {
          return {
            value: d.id,
            name: d.nmbrs,
            avatar: d.rtafto
          };
        });

        tagsTagify(document.querySelector(`#EVENTGUESTS`), usersList);
      });

      function initializeCalendar({
        formSelector,
        calendarSelector,
        eventSidebarSelector,
        offcanvasTitleSelector,
        initialEvents,
        locale = 'es',
        maxEventsPerDay = 2
      }) {
        const $calendarEl = $(calendarSelector);
        const $addEventSidebar = $(eventSidebarSelector);
        const $offcanvasTitle = $(offcanvasTitleSelector);

        bsAddEventSidebar = new bootstrap.Offcanvas($addEventSidebar[0]);

        const modifyToggler = () => {
          const fcSidebarToggleButton = document.querySelector('.fc-sidebarToggle-button');
          fcSidebarToggleButton.classList.remove('fc-button-primary');
          fcSidebarToggleButton.classList.add('d-lg-none', 'd-inline-block', 'ps-0');
          while (fcSidebarToggleButton.firstChild) {
            fcSidebarToggleButton.firstChild.remove();
          }
          fcSidebarToggleButton.setAttribute('data-bs-toggle', 'sidebar');
          fcSidebarToggleButton.setAttribute('data-overlay', '');
          fcSidebarToggleButton.setAttribute('data-target', '#app-calendar-sidebar');
          fcSidebarToggleButton.insertAdjacentHTML('beforeend', '<i class="bx bx-menu bx-sm text-heading"></i>');
        };

        const eventClick = async ({ event }) => {
          func.resetAll('#' + formSelector, true);
          const eventDetails = event._def.extendedProps;
          calendarioCrud.variables.rowEdit = eventDetails;
          func.actualizarForm(formSelector, eventDetails);

          $(`#${formSelector} .dob-picker-format-hour`).each(function () {
            this._flatpickr.setDate(eventDetails[this.name], true);
          });

          await $(`#${formSelector} .selects2-form`)
            .not('tags')
            .each(function () {
              let valores;
              try {
                valores = eventDetails[this.name].split(',');
              } catch (error) {
                valores = [];
              }

              const tagify = this.__tagify;
              if (tagify) {
                tagify.removeAllTags();
                tagify.addTags(usersList.filter(u => valores.includes(u.value.toString())));
              }
            });

          $offcanvasTitle.text('Actualizar Evento');
          $(`#${formSelector} #btnDeleteCalendar`).show();
          $(`#${formSelector} #btnRegisterCalendar`).show();
          bsAddEventSidebar.show();
        };

        const dateClick = info => {
          func.resetAll('#' + formSelector, true);
          calendarioCrud.variables.rowEdit = {};
          $(`#${formSelector} .dob-picker-format-hour`).each(function () {
            this._flatpickr.setDate(moment(info.date).format('YYYY-MM-DD HH:mm'), true);
          });

          bsAddEventSidebar.show();
          $offcanvasTitle.text('Agregar Evento');
          $(`#${formSelector} #btnDeleteCalendar`).hide();
          $(`#${formSelector} #btnRegisterCalendar`).hide();
        };

        calendar = new Calendar($calendarEl[0], {
          initialView: 'dayGridMonth',
          events: initialEvents,
          plugins: [dayGridPlugin, interactionPlugin, listPlugin, timegridPlugin],
          editable: true,
          dragScroll: true,
          dayMaxEvents: maxEventsPerDay,
          eventResizableFromStart: true,
          customButtons: {
            sidebarToggle: { text: '' }
          },
          headerToolbar: {
            start: 'sidebarToggle, prev,next, title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
          },
          eventClick: info => {
            eventClick(info);
          },
          dateClick: info => {
            dateClick(info);
          },
          eventClassNames: function ({ event: calendarEvent }) {
            let valores = calendarEvent._def.extendedProps;
            // si fecha ini es menor a hoy poner amarillo
            if (valores.CESTDO == 'I') return ['fc-event-' + 'danger'];
            if (moment(valores.EVENTSTARTDATE).isBefore(moment(), 'day')) return ['fc-event-' + 'warning'];
            if (valores.CESTDO == 'A') return ['fc-event-' + 'primary'];
          },
          locale,
          buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', list: 'Lista' }
        });

        calendar.render();
        modifyToggler();
      }

      initializeCalendar({
        formSelector: 'AddCalendar',
        calendarSelector: '#calendar',
        sidebarSelector: '.app-calendar-sidebar',
        eventSidebarSelector: '#addEventSidebar',
        offcanvasTitleSelector: '.offcanvas-title',
        initialEvents: [],
        locale: 'es'
      });

      // prevenir
      $('#AddCalendar').on('submit', function (e) {
        e.preventDefault();
      });

      $('#AddCalendar #btnAddCalendar').on('click', function () {
        if (!calendarioCrud.variables.rowEdit.ID) calendarioCrud.eventos.INSERTAR();
        else calendarioCrud.eventos.ACTUALIZAR();
      });

      $('#AddCalendar #btnDeleteCalendar').on('click', function () {
        calendarioCrud.eventos.ELIMINAR();
      });
    },
    eventos: {
      INSERTAR: () => {
        if (!cursosCrud.variables.rowEdit.id) return swalFire.error('No se encontró el curso seleccionado');

        if (!$('#AddCalendar #EVENTTITLE').val()) return swalFire.error('Ingrese un título para el evento');
        if (!$('#AddCalendar #EVENTSTARTDATE').val()) return swalFire.error('Ingrese una fecha de inicio');
        if (!$('#AddCalendar #EVENTENDDATE').val()) return swalFire.error('Ingrese una fecha de fin');

        let EVENTGUESTS = $('#AddCalendar #EVENTGUESTS').val()
          ? JSON.parse($('#AddCalendar #EVENTGUESTS').val())
            .map(u => u.value)
            .join(',')
          : '';

        let formData = new FormData();
        formData.append('IDCRSO', cursosCrud.variables.rowEdit.id);
        formData.append('DSCRPCN', $('#AddCalendar #EVENTTITLE').val());
        formData.append('FINI', $('#AddCalendar #EVENTSTARTDATE').val());
        formData.append('FFIN', $('#AddCalendar #EVENTENDDATE').val());
        formData.append('PRFESRS', EVENTGUESTS);
        formData.append('CESTDO', $('#AddCalendar #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el evento']);
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
              swalFire.success('Fecha registrada correctamente', '', {
                1: () => {
                  $('#AddCalendar').trigger('reset');
                  bsAddEventSidebar.hide();
                  calendarioCrud.reloadCalendar();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al registrar el evento')
        });
      },
      ACTUALIZAR: () => {
        if (!calendarioCrud.variables.rowEdit.ID) return swalFire.error('No se encontró el evento seleccionado');

        if (!$('#AddCalendar #EVENTTITLE').val()) return swalFire.error('Ingrese un título para el evento');
        if (!$('#AddCalendar #EVENTSTARTDATE').val()) return swalFire.error('Ingrese una fecha de inicio');
        if (!$('#AddCalendar #EVENTENDDATE').val()) return swalFire.error('Ingrese una fecha de fin');

        let EVENTGUESTS = $('#AddCalendar #EVENTGUESTS').val()
          ? JSON.parse($('#AddCalendar #EVENTGUESTS').val())
            .map(u => u.value)
            .join(',')
          : '';

        let formData = new FormData();
        formData.append('ID', calendarioCrud.variables.rowEdit.ID);
        formData.append('DSCRPCN', $('#AddCalendar #EVENTTITLE').val());
        formData.append('FINI', $('#AddCalendar #EVENTSTARTDATE').val());
        formData.append('FFIN', $('#AddCalendar #EVENTENDDATE').val());
        formData.append('PRFESRS', EVENTGUESTS);
        formData.append('CESTDO', $('#AddCalendar #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el evento']);
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
              swalFire.success('Evento actualizado correctamente', '', {
                1: () => {
                  $('#AddCalendar').trigger('reset');
                  bsAddEventSidebar.hide();
                  calendarioCrud.reloadCalendar();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el evento')
        });
      },
      ELIMINAR: () => {
        if (!calendarioCrud.variables.rowEdit.ID) return swalFire.error('No se encontró el evento seleccionado');

        swalFire.confirmar('¿Está seguro de eliminar el evento?', {
          1: () => {
            let formData = new FormData();
            formData.append('ID', calendarioCrud.variables.rowEdit.ID);

            swalFire.cargando(['Espere un momento', 'Estamos eliminando el evento']);
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
                  swalFire.success('Evento eliminado correctamente', '', {
                    1: () => {
                      $('#AddCalendar').trigger('reset');
                      bsAddEventSidebar.hide();
                      calendarioCrud.reloadCalendar();
                    }
                  });
                }

                if (data?.codEstado <= 0) swalFire.error(data.mensaje);
              },
              error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el evento')
            });
          }
        });
      }
    },
    variables: {
      rowEdit: {}
    }
  };



  return {
    init: async () => {
      await globalCrud.init();
      func.limitarCaracteres();
      cursosCrud.init();
      cursosCrud.globales();
      asistenciaCrud.globales();
      participantesCrud.globales();
      calendarioCrud.globales();

      var myTabs = document.querySelectorAll('.nav-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');

          if (asistenciaCrud.variables.html5QrcodeScanner && tabPane !== '#navs-asistencia') {
            asistenciaCrud.variables.html5QrcodeScanner.clear();
            $('#reader').addClass('d-none');
          }

          if (tabPane === '#navs-cursos') {
            redirect(false, 'navs-calendario', 0);
            redirect(false, 'navs-asistencia', 0);
            redirect(false, 'navs-participantes', 0);
            cursosCrud.eventos.TABLECURSOS();
          }

          if (tabPane === '#navs-calendario') {
            redirect(false, 'navs-asistencia', 0);
            calendarioCrud.init();
          }

          if (tabPane === '#navs-asistencia') {
            asistenciaCrud.init();
          }

          if (tabPane === '#navs-participantes') {
            participantesCrud.init();
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
