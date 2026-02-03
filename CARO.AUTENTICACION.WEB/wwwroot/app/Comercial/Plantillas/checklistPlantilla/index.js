/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Comercial/Plantillas/checklistPlantilla/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler',
  };

  let GDTYPEP_G = [];
  // * VARIABLES
  let formularioTable = 'formularioTable';
  let preguntasTable = 'preguntasTable';
  let respuestasTable = 'respuestasTable';
  let CformularioTable = null;
  let CpreguntasTable = null;
  let CrespuestasTable = null;


  // * TABLAS
  const formularioCrud = {
    init: () => {
      formularioCrud.eventos.TABLE();
    },
    globales: () => {
      const fullEditorAddFormulario = new Quill('#AddFormulario #editor-DESCP', {
        bounds: '#AddFormulario #editor-DESCP',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });

      const fullEditorEditFormulario = new Quill('#EditFormulario #editor-DESCP', {
        bounds: '#EditFormulario #editor-DESCP',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });



      if ($("#AddFormulario #BGCOLOR").length) formularioCrud.variables.classicAddFormulario = func.pickCreate($("#AddFormulario #BGCOLOR")[0])
      if ($("#AddFormulario #BGCOLOR2").length) formularioCrud.variables.classicAddFormulario2 = func.pickCreate($("#AddFormulario #BGCOLOR2")[0])
      if ($("#EditFormulario #BGCOLOR").length) formularioCrud.variables.classicEditFormulario = func.pickCreate($("#EditFormulario #BGCOLOR")[0])
      if ($("#EditFormulario #BGCOLOR2").length) formularioCrud.variables.classicEditFormulario2 = func.pickCreate($("#EditFormulario #BGCOLOR2")[0])

      let dropzoneAddFormulario = $('#AddFormulario #dropzone-area');
      if (dropzoneAddFormulario) {
        formularioCrud.variables.myDropzoneAddFormulario = new Dropzone(dropzoneAddFormulario[0], {
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

      let dropzoneBasicFormularioEdit = $('#EditFormulario #dropzone-area');
      if (dropzoneBasicFormularioEdit) {
        formularioCrud.variables.myDropzoneEditFormulario = new Dropzone(dropzoneBasicFormularioEdit[0], {
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

              dropzoneBasicFormularioEdit.find('.centered-image').off('click');
              dropzoneBasicFormularioEdit.find('.dz-preview').css('cursor', 'pointer');

              let filePreview = this.files[0];
              if (filePreview.isExist) {
                let img = dropzoneBasicFormularioEdit.find('.dz-preview').find('.dz-details').find('img');
                img.attr('src', filePreview.dataURL);
                return;
              }

              let reader = new FileReader();
              reader.readAsDataURL(filePreview);
              reader.onload = function () {
                let img = dropzoneBasicFormularioEdit.find('.dz-preview').find('.dz-details').find('img');
                img.attr('src', reader.result);
                img.on('click', function () {
                  createModalImage(reader.result);
                });
              };
            });
          }
        });
      }


      // TODOS: MODALES
      $('#modalAddFormulario').on('show.bs.modal', function (e) {
        formularioCrud.variables.myDropzoneAddFormulario.removeAllFiles(true);
        configFormVal('AddFormulario', formularioCrud.validaciones.INSERT, () => formularioCrud.eventos.INSERT());
      });

      $('#modalEditFormulario').on('show.bs.modal', function (e) {
        formularioCrud.variables.myDropzoneEditFormulario.removeAllFiles(true);
        configFormVal('EditFormulario', formularioCrud.validaciones.UPDATE, () => formularioCrud.eventos.UPDATE());
        func.actualizarForm('EditFormulario', formularioCrud.variables.rowEdit);
        fullEditorEditFormulario.root.innerHTML = formularioCrud.variables.rowEdit.descp || '';

        formularioCrud.variables.classicEditFormulario.setColor(formularioCrud.variables.rowEdit.bgcolor || '#ffffff')
        formularioCrud.variables.classicEditFormulario2.setColor(formularioCrud.variables.rowEdit.bgcoloR2 || '#ffffff')
        if (formularioCrud.variables.rowEdit.logo) {
          agregarArchivoADropzone(pathFileImg + formularioCrud.variables.rowEdit.logo, formularioCrud.variables.myDropzoneEditFormulario);
        }
      });

      // * FORMULARIOS
      $(`#${formularioTable}`).on('click', '.edit-row-button', function () {
        const data = CformularioTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el formulario seleccionado');
        formularioCrud.variables.rowEdit = data;
        $('#modalEditFormulario').modal('show');
      });

      $(`#${formularioTable}`).on('click', '.delete-row-button', function () {
        const data = CformularioTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el formulario seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar el formulario?', {
          1: () => formularioCrud.eventos.DELETE(data.id)
        });
      });

      $(`#${formularioTable}`).on('click', '.config-row-button', function () {
        const data = CformularioTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el formulario seleccionado');
        formularioCrud.variables.rowEdit = data;
        redirect(true, 'navs-preguntas', data.id);
      });

      // ver usuarios
      $(`#${formularioTable}`).on('click', '.btn-link-formulario', function () {
        const data = CformularioTable.row($(this).closest('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el formulario seleccionado');
        let url = window.location.origin + `/Perfil/forms/Index?id=${data.id}&formulario=${data.nombre}`;
        window.open(url, '_blank');
      });

      // ver respuestas
      $(`#${formularioTable}`).on('click', '.btn-ver-respuestas', function () {
        const data = CformularioTable.row($(this).closest('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el formulario seleccionado');
        formularioCrud.variables.rowEdit = data;
        redirect(true, 'navs-respuestas', data.id);
      });

      // exportar formulario
      $(`#${formularioTable}`).on('click', '.btn-exportar-row', function () {
        const data = CformularioTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el formulario seleccionado');
        formularioCrud.eventos.EXPORTAR(data);
      });
    },
    variables: {
      rowEdit: {},
      myDropzoneAddFormulario: null,
      myDropzoneEditFormulario: null,
      classicAddFormulario: null,
      classicEditFormulario: null,
      classicAddFormulario2: null,
      classicEditFormulario2: null
    },
    eventos: {
      TABLE: () => {
        $(`#${formularioTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CformularioTable) {
          CformularioTable = $(`#${formularioTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=All',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDEMPRSA = func.IDEMPRESA();
                d.CESTDO = func.obtenerCESTDO(formularioTable);
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
              { data: "nombre", title: "Formulario", },
              { data: null, title: "Fcha. Inicio", width: "20%", class: "text-center", render: data => func.formatFecha(data.finicio, 'DD-MM-YYYY') },
              { data: null, title: "Fcha. Fin", width: "20%", class: "text-center", render: data => func.formatFecha(data.ffin, 'DD-MM-YYYY') },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'
                    }></i></span>`;
                }
              },
              {
                data: null,
                title: '',
                className: 'text-center',
                render: data => {
                  return `<div class="d-flex justify-content-center align-items-center gap-1 m-0 p-0">
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-row-button" title="Editar"><i class="bx bx-edit"></i></button>
                        <button name="CONFIGURACION" class="btn btn-sm btn-icon config-row-button" title="Configuración"><i class="bx bx-cog"></i></button>
                        <button name="EXPORTAR" class="btn btn-sm btn-icon  btn-exportar-row" title="Exportar"><i class="bx bx-download"></i></button>
                        <div class="dropdown">
                          <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Más opciones">
                            <i class="bx bx-dots-vertical-rounded"></i>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item btn-link-formulario" href="javascript:void(0);"><i class="bx bx-link me-2"></i>Ir al formulario</a></li>
                            <li><a class="dropdown-item btn-ver-respuestas" href="javascript:void(0);"><i class="bx bx-show me-2"></i>Ver respuestas</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger delete-row-button" href="javascript:void(0);"><i class="bx bx-trash me-2"></i>Eliminar</a></li>
                          </ul>
                        </div>
                      </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${formularioTable}`).find('.radio-buttons').length == 0) {
                $(`#${formularioTable}_filter`).append(radio_group_estados);

                $(`#${formularioTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${formularioTable}`).DataTable().ajax.reload();
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];

              // buttons.unshift({
              //   text: '<i class="bx bx-download me-0 me-md-2"></i><span class="d-none d-md-inline-block">Exportar</span>',
              //   className: 'erp-btn erp-btn-success',
              //   action: function (e, dt, node, config) {
              //     swalFire.info('Funcionalidad de exportar en desarrollo');
              //   }
              // });

              buttons.unshift({
                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                className: 'erp-btn erp-btn-secondary',
                action: function (e, dt, node, config) {
                  $('#modalAddFormulario').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CformularioTable.ajax.reload();
        }
      },
      INSERT: async () => {
        let file = formularioCrud.variables.myDropzoneAddFormulario.files[0];
        let IDEMPRSA = await func.IDEMPRESA();

        let formData = new FormData();
        formData.append('ID', "");
        formData.append('IDEMPRSA', IDEMPRSA);
        formData.append('NOMBRE', $('#AddFormulario #NOMBRE').val());
        formData.append('DESCP', new Quill('#AddFormulario #editor-DESCP').root.innerHTML);
        formData.append('FINICIO', $('#AddFormulario #FINICIO').val());
        formData.append('FFIN', $('#AddFormulario #FFIN').val());
        formData.append('LOGO', "");
        formData.append('BGCOLOR', formularioCrud.variables.classicAddFormulario.getColor().toHEXA().toString());
        formData.append('BGCOLOR2', formularioCrud.variables.classicAddFormulario2.getColor().toHEXA().toString());
        formData.append('GDFORMT', $('#AddFormulario #GDFORMT').val());
        formData.append('GDTPOGR', $('#AddFormulario #GDTPOGR').val());
        formData.append('FTO', file ? file : null);
        formData.append('CESTDO', $('#AddFormulario #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el formulario']);
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
              swalFire.success('Formulario registrado correctamente', '', {
                1: () => {
                  $('#modalAddFormulario').modal('hide');
                  CformularioTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el formulario')
        });
      },
      UPDATE: () => {
        let file = formularioCrud.variables.myDropzoneEditFormulario.files[0];

        let formData = new FormData();
        formData.append('ID', formularioCrud.variables.rowEdit.id);
        formData.append('NOMBRE', $('#EditFormulario #NOMBRE').val());
        formData.append('DESCP', new Quill('#EditFormulario #editor-DESCP').root.innerHTML);
        formData.append('FINICIO', $('#EditFormulario #FINICIO').val());
        formData.append('FFIN', $('#EditFormulario #FFIN').val());
        formData.append('LOGO', formularioCrud.variables.rowEdit.logo);
        formData.append('BGCOLOR', formularioCrud.variables.classicEditFormulario.getColor().toHEXA().toString());
        formData.append('BGCOLOR2', formularioCrud.variables.classicEditFormulario2.getColor().toHEXA().toString());
        formData.append('GDFORMT', $('#EditFormulario #GDFORMT').val());
        formData.append('GDTPOGR', $('#EditFormulario #GDTPOGR').val());
        formData.append('FTO', file ? file : null);
        formData.append('CESTDO', $('#EditFormulario #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el formulario']);
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
              swalFire.success('formulario actualizado correctamente', '', {
                1: () => {
                  $('#modalEditFormulario').modal('hide');
                  CformularioTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el formulario')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);
        if (!id) return swalFire.error('No se encontró el formulario seleccionado');

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el formulario']);
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
              swalFire.success('formulario eliminado correctamente', '', {
                1: () => $(`#${formularioTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el formulario')
        });
      },
      EXPORTAR: (data) => {
        console.log('Exportar formulario:', data);
        swalFire.cargando(['Espere un momento', 'Estamos preparando el formulario para exportar']);
        $.ajax({
          url: uisApis.API + '=AllExport&ID=' + data.id,
          type: 'GET',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
          },
          success: function (response) {
            if(response.data && response.data.length > 0) {
              formularioCrud.eventos._EXCEL(response.data, data.nombre);
            }else{
              swalFire.error('No se encontraron datos para exportar del formulario seleccionado');
            }
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al exportar el formulario')
        });
      },
      _EXCEL: (arrayData, nombreFormulario) => {
        try {
          swalFire.cargando(['Generando reporte...', 'Por favor espere mientras se genera el archivo Excel.']);

          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Respuestas');

          // Obtener preguntas del primer registro (todas las preguntas están en el primer elemento)
          let preguntas = [];
          if (arrayData[0] && arrayData[0].preguntas) {
            preguntas = typeof arrayData[0].preguntas === 'string' 
              ? JSON.parse(arrayData[0].preguntas) 
              : arrayData[0].preguntas;
          }

          console.log('Preguntas:', preguntas);
          console.log('Total usuarios:', arrayData.length);

          // Agregar título
          worksheet.mergeCells('B2:' + abecedarioExcel[2 + preguntas.length] + '2');
          const titleCell = worksheet.getCell('B2');
          titleCell.value = `REPORTE DE RESPUESTAS - ${nombreFormulario.toUpperCase()}`;
          titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
          titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF6600' } // Naranja
          };
          titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

          // Preparar cabeceras: Email, Nombres, y luego cada pregunta
          const columnas = ['Email', 'Nombres', ...preguntas.map(p => p.DESCP)];

          // Agregar cabeceras de grupo en fila 4
          // Cabecera "USUARIO" (columnas B y C)
          worksheet.mergeCells('B4:C4');
          const usuarioHeaderCell = worksheet.getCell('B4');
          usuarioHeaderCell.value = 'USUARIOS';
          usuarioHeaderCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
          usuarioHeaderCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF6600' }
          };
          usuarioHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
          usuarioHeaderCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          // Cabecera "PREGUNTAS" (desde D hasta la última columna de preguntas)
          if (preguntas.length > 0) {
            const ultimaColumnaPreguntas = abecedarioExcel[2 + preguntas.length];
            worksheet.mergeCells(`D4:${ultimaColumnaPreguntas}4`);
            const preguntasHeaderCell = worksheet.getCell('D4');
            preguntasHeaderCell.value = 'PREGUNTAS';
            preguntasHeaderCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
            preguntasHeaderCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF6600' }
            };
            preguntasHeaderCell.alignment = { vertical: 'middle', horizontal: 'center' };
            preguntasHeaderCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }

          // Establecer cabeceras con estilo (comenzando en B5)
          for (let i = 0; i < columnas.length; i++) {
            const cell = worksheet.getCell(`${abecedarioExcel[i + 1]}5`);
            cell.value = columnas[i];
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF6600' } // Naranja
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }

          // Procesar cada usuario (fila)
          let fila = 6;
          arrayData.forEach((usuario, index) => {
            // Parsear respuestas del usuario
            let respuestas = [];
            if (usuario.respuestas) {
              respuestas = typeof usuario.respuestas === 'string' 
                ? JSON.parse(usuario.respuestas) 
                : usuario.respuestas;
            }

            console.log(`Usuario ${index + 1} - ${usuario.email}:`, respuestas);

            // Crear un mapa de respuestas por ID de pregunta para acceso rápido
            const respuestasMap = {};
            respuestas.forEach(resp => {
              if (!respuestasMap[resp.IDPRGNTA]) {
                respuestasMap[resp.IDPRGNTA] = [];
              }
              // Buscar el valor de la respuesta en el orden correcto
              const valorRespuesta = resp.RESPUESTA || resp.DESCP || resp.RSPSTA || resp.IDRSPSTA || '-';
              respuestasMap[resp.IDPRGNTA].push(valorRespuesta);
              
              console.log(`  Pregunta ID ${resp.IDPRGNTA}: ${valorRespuesta}`);
            });

            // Columna B: Email
            const cellEmail = worksheet.getCell(`B${fila}`);
            cellEmail.value = usuario.email || '-';
            cellEmail.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            cellEmail.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };

            // Columna C: Nombres
            const cellNombres = worksheet.getCell(`C${fila}`);
            cellNombres.value = usuario.nombres || '-';
            cellNombres.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            cellNombres.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };

            // Columnas D en adelante: Respuestas por cada pregunta
            preguntas.forEach((pregunta, indexPregunta) => {
              const colIndex = indexPregunta + 3; // +3 porque empezamos en D (después de Email y Nombres)
              const cell = worksheet.getCell(`${abecedarioExcel[colIndex]}${fila}`);
              
              // Buscar la respuesta de este usuario para esta pregunta
              const respuestasPregunta = respuestasMap[pregunta.ID];
              let valorRespuesta = '-';
              
              if (respuestasPregunta && respuestasPregunta.length > 0) {
                // Si hay múltiples respuestas (checkboxes), unirlas con comas
                valorRespuesta = respuestasPregunta.join(', ');
              }

              cell.value = valorRespuesta;
              cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            });

            fila++;
          });

          // Ajustar anchos de columnas
          columnas.forEach((columna, index) => {
            const col = worksheet.getColumn(index + 2); // +2 porque empezamos en B (columna 2)
            let maxLength = columna.length;

            col.eachCell({ includeEmpty: true }, (cell) => {
              if (cell.value) {
                const cellValue = cell.value.toString();
                const lines = cellValue.split('\n');
                const maxLineLength = Math.max(...lines.map(line => line.length));
                if (maxLineLength > maxLength) {
                  maxLength = maxLineLength;
                }
              }
            });

            // Definir anchos específicos
            if (index === 0) col.width = 35; // Email
            else if (index === 1) col.width = 25; // Nombres
            else col.width = maxLength < 20 ? 20 : (maxLength > 50 ? 50 : maxLength); // Respuestas
          });

          // Aplicar filas alternas de color (estilo de tabla)
          const lastRow = fila - 1;
          for (let i = 6; i <= lastRow; i++) {
            const isEven = (i - 6) % 2 === 0;
            const fillColor = isEven ? 'FFF5F5F5' : 'FFFFFFFF'; // Gris claro / Blanco
            
            for (let j = 0; j < columnas.length; j++) {
              const cell = worksheet.getCell(`${abecedarioExcel[j + 1]}${i}`);
              if (!cell.fill || cell.fill.type !== 'pattern' || cell.fill.fgColor?.argb !== 'FFFF6600') {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: fillColor }
                };
              }
            }
          }

          // Generar y descargar el archivo
          workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reporte_${nombreFormulario}_${func.formatFecha(new Date(), 'DDMMYYYY_HHmmss')}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            swalFire.success('Excel generado correctamente', 'El archivo se ha descargado exitosamente');
          }).catch(error => {
            console.error('Error al generar Excel:', error);
            swalFire.error('Error al generar el archivo Excel');
          });

        } catch (error) {
          console.error('Error en _EXCEL:', error);
          swalFire.error('Ocurrió un error al generar el reporte: ' + error.message);
        }
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        NOMBRE: agregarValidaciones({
          required: true
        }),
        GDFORMT: agregarValidaciones({
          required: true
        }),
        GDTPOGR: agregarValidaciones({
          required: true
        }),
      },
      UPDATE: {
        NOMBRE: agregarValidaciones({
          required: true
        }),
        GDFORMT: agregarValidaciones({
          required: true
        }),
        GDTPOGR: agregarValidaciones({
          required: true
        }),
      }
    }
  };

  const preguntasCrud = {
    init: () => {
      preguntasCrud.eventos.TABLE();
    },
    globales: () => {
      func.selects2("AddPregunta #ADD_OPTION_S", true);
      func.selects2("EditPregunta #ADD_OPTION_S", true);
      $("#AddPregunta #GDTYPEP").on('change', function () {
        const selectedValue = $(this).val();
        $("#AddPregunta #GDTYPEP_R").toggle(selectedValue === 'R');
        $("#AddPregunta #GDTYPEP_C").toggle(selectedValue === 'C');
        $("#AddPregunta #GDTYPEP_S").toggle(selectedValue === 'S');
        preguntasCrud.eventos.RESETCONTAINERS('AddPregunta');
      });

      $("#EditPregunta #GDTYPEP").on('change', function () {
        const selectedValue = $(this).val();
        $("#EditPregunta #GDTYPEP_R").toggle(selectedValue === 'R');
        $("#EditPregunta #GDTYPEP_C").toggle(selectedValue === 'C');
        $("#EditPregunta #GDTYPEP_S").toggle(selectedValue === 'S');
        preguntasCrud.eventos.RESETCONTAINERS('EditPregunta');
      });


      $("#AddPregunta #ADD_OPTION_S").on('click', function () {
        const newOption = $("#AddPregunta #GDTYPEP_S #OPTION_S").val().trim();
        if (!newOption) return swalFire.error('Ingrese una opción válida');
        if ($(`#AddPregunta #GDTYPEP_S #OPTIONSELECT option:contains(${newOption})`).length) {
          return swalFire.error('La opción ya existe');
        }
        const UIDD = Date.now();
        var optionSelect = new Option(newOption, UIDD, true, true);

        $("#AddPregunta #GDTYPEP_S #OPTIONSELECT").append(optionSelect).trigger('change');
        $("#AddPregunta #GDTYPEP_S #OPTION_S").val('');
      });

      $("#EditPregunta #ADD_OPTION_S").on('click', function () {
        const newOption = $("#EditPregunta #GDTYPEP_S #OPTION_S").val().trim();
        if (!newOption) return swalFire.error('Ingrese una opción válida');
        if ($(`#EditPregunta #GDTYPEP_S #OPTIONSELECT option:contains(${newOption})`).length) {
          return swalFire.error('La opción ya existe');
        }

        const UIDD = Date.now();
        var optionSelect = new Option(newOption, UIDD, true, true);
        $("#EditPregunta #GDTYPEP_S #OPTIONSELECT").append(optionSelect).trigger('change');
        $("#EditPregunta #GDTYPEP_S #OPTION_S").val('');
      });

      $("#AddPregunta #GDTYPEP_R #ADD_OPTION_R").on('click', function () {
        const newOption = $("#AddPregunta #GDTYPEP_R #OPTION_R").val().trim();
        if (!newOption) return swalFire.error('Ingrese una opción válida');

        if ($(`#AddPregunta #GDTYPEP_R #RADIO_OPTIONS_CONTAINER input[value="${newOption}"]`).length) {
          return swalFire.error('La opción ya existe');
        }

        const optionId = 'radio-option-' + Date.now();
        const radioOption = $(`
          <div class="form-check d-flex align-items-center mb-2">
            <input class="form-check-input me-2" type="radio" name="radio-options" id="${optionId}" value="${newOption}">
            <label class="form-check-label me-2 flex-grow-1" for="${optionId}">${newOption}</label>
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-option" title="Eliminar">
              <i class="bx bx-trash"></i>
            </button>
          </div>
        `);

        $("#AddPregunta #GDTYPEP_R #RADIO_OPTIONS_CONTAINER").append(radioOption);
        $("#AddPregunta #GDTYPEP_R #OPTION_R").val('');

        radioOption.find('.btn-remove-option').on('click', function () {
          $(this).closest('.form-check').remove();
        });
      });

      $("#EditPregunta #GDTYPEP_R #ADD_OPTION_R").on('click', function () {
        const newOption = $("#EditPregunta #GDTYPEP_R #OPTION_R").val().trim();
        if (!newOption) return swalFire.error('Ingrese una opción válida');
        if ($(`#EditPregunta #GDTYPEP_R #RADIO_OPTIONS_CONTAINER input[value="${newOption}"]`).length) {
          return swalFire.error('La opción ya existe');
        }
        const optionId = 'radio-option-' + Date.now();
        const radioOption = $(`
          <div class="form-check d-flex align-items-center mb-2">
            <input class="form-check-input me-2" type="radio" name="radio-options" id="${optionId}" value="${newOption}">
            <label class="form-check-label me-2 flex-grow-1" for="${optionId}">${newOption}</label>
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-option" title="Eliminar">
              <i class="bx bx-trash"></i>
            </button>
          </div>
        `);

        $("#EditPregunta #GDTYPEP_R #RADIO_OPTIONS_CONTAINER").append(radioOption);
        $("#EditPregunta #GDTYPEP_R #OPTION_R").val('');
        radioOption.find('.btn-remove-option').on('click', function () {
          $(this).closest('.form-check').remove();
        });
      });

      $("#AddPregunta #GDTYPEP_C #ADD_OPTION_C").on('click', function () {
        const newOption = $("#AddPregunta #GDTYPEP_C #OPTION_C").val().trim();
        if (!newOption) return swalFire.error('Ingrese una opción válida');

        if ($(`#AddPregunta #GDTYPEP_C #CASILLEROS_OPTIONS_CONTAINER input[value="${newOption}"]`).length) {
          return swalFire.error('La opción ya existe');
        }

        const optionId = 'checkbox-option-' + Date.now();
        const checkboxOption = $(`
          <div class="form-check d-flex align-items-center mb-2">
            <input class="form-check-input me-2" type="checkbox" id="${optionId}" value="${newOption}">
            <label class="form-check-label me-2 flex-grow-1" for="${optionId}">${newOption}</label>
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-option" title="Eliminar">
              <i class="bx bx-trash"></i>
            </button>
          </div>
        `);

        $("#AddPregunta #GDTYPEP_C #CASILLEROS_OPTIONS_CONTAINER").append(checkboxOption);
        $("#AddPregunta #GDTYPEP_C #OPTION_C").val('');

        checkboxOption.find('.btn-remove-option').on('click', function () {
          $(this).closest('.form-check').remove();
        });
      });

      $("#EditPregunta #GDTYPEP_C #ADD_OPTION_C").on('click', function () {
        const newOption = $("#EditPregunta #GDTYPEP_C #OPTION_C").val().trim();
        if (!newOption) return swalFire.error('Ingrese una opción válida');
        if ($(`#EditPregunta #GDTYPEP_C #CASILLEROS_OPTIONS_CONTAINER input[value="${newOption}"]`).length) {
          return swalFire.error('La opción ya existe');
        }

        const optionId = 'checkbox-option-' + Date.now();
        const checkboxOption = $(`
          <div class="form-check d-flex align-items-center mb-2">
            <input class="form-check-input me-2" type="checkbox" id="${optionId}" value="${newOption}">
            <label class="form-check-label me-2 flex-grow-1" for="${optionId}">${newOption}</label>
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-option" title="Eliminar">
              <i class="bx bx-trash"></i>
            </button>
          </div>
        `);

        $("#EditPregunta #GDTYPEP_C #CASILLEROS_OPTIONS_CONTAINER").append(checkboxOption);
        $("#EditPregunta #GDTYPEP_C #OPTION_C").val('');
        checkboxOption.find('.btn-remove-option').on('click', function () {
          $(this).closest('.form-check').remove();
        });
      });


      // * MODALES
      $('#modalAddPregunta').on('show.bs.modal', function (e) {
        $("#AddPregunta #GDTYPEP_R").hide();
        $("#AddPregunta #GDTYPEP_C").hide();
        $("#AddPregunta #GDTYPEP_S").hide();
        configFormVal('AddPregunta', preguntasCrud.validaciones.INSERT, () =>
          preguntasCrud.eventos.INSERT()
        );
      });

      $('#modalEditPregunta').on('show.bs.modal', function (e) {
        configFormVal('EditPregunta', preguntasCrud.validaciones.UPDATE, () =>
          preguntasCrud.eventos.UPDATE()
        );
        func.actualizarForm('EditPregunta', preguntasCrud.variables.rowEdit);
        // ocultar contenedores
        $("#EditPregunta #GDTYPEP_R").hide();
        $("#EditPregunta #GDTYPEP_C").hide();
        $("#EditPregunta #GDTYPEP_S").hide();

        // limpiar contenedores
        preguntasCrud.eventos.RESETCONTAINERS('EditPregunta');

        let alternativas = preguntasCrud.variables.rowEdit.alternativas ? JSON.parse(preguntasCrud.variables.rowEdit.alternativas) : [];
        if (preguntasCrud.variables.rowEdit.gdtypep === 'R') {
          $("#EditPregunta #GDTYPEP_R").show();
          if (alternativas.length) {
            alternativas.forEach(option => {
              const radioOption = $(`
                <div class="form-check d-flex align-items-center mb-2">
                  <input class="form-check-input me-2" type="radio" name="radio-options" id="${option.ID}" value="${option.ID}">
                  <label class="form-check-label me-2 flex-grow-1" for="${option.ID}">${option.DESCP}</label>
                  <button type="button" class="btn btn-sm btn-outline-danger btn-remove-option" title="Eliminar">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              `);
              $("#EditPregunta #GDTYPEP_R #RADIO_OPTIONS_CONTAINER").append(radioOption);
              radioOption.find('.btn-remove-option').on('click', function () {
                $(this).closest('.form-check').remove();
              });
            });
          }
        } else if (preguntasCrud.variables.rowEdit.gdtypep === 'C') {
          $("#EditPregunta #GDTYPEP_C").show();
          if (alternativas.length) {
            alternativas.forEach(option => {
              const checkboxOption = $(`
                <div class="form-check d-flex align-items-center mb-2">
                  <input class="form-check-input me-2" type="checkbox" id="${option.ID}" value="${option.ID}">
                  <label class="form-check-label me-2 flex-grow-1" for="${option.ID}">${option.DESCP}</label>
                  <button type="button" class="btn btn-sm btn-outline-danger btn-remove-option"
                    title="Eliminar">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              `);
              $("#EditPregunta #GDTYPEP_C #CASILLEROS_OPTIONS_CONTAINER").append(checkboxOption);
              checkboxOption.find('.btn-remove-option').on('click', function () {
                $(this).closest('.form-check').remove();
              });
            });
          }
        } else if (preguntasCrud.variables.rowEdit.gdtypep === 'S') {
          $("#EditPregunta #GDTYPEP_S").show();
          if (alternativas.length) {
            alternativas.forEach(option => {
              var optionSelect = new Option(option.DESCP, option.ID, true, true);
              $("#EditPregunta #GDTYPEP_S #OPTIONSELECT").append(optionSelect).trigger('change');
            });
          }
        }

      });

      // * FORMULARIOS
      $(`#${preguntasTable}`).on('click', '.edit-row-button', function () {
        const data = CpreguntasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
        preguntasCrud.variables.rowEdit = data;
        $('#modalEditPregunta').modal('show');
      });

      $(`#${preguntasTable}`).on('click', '.delete-row-button', function () {
        const data = CpreguntasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar la pregunta?', {
          1: () => preguntasCrud.eventos.DELETE(data.id)
        });
      });
    },
    variables: {
      rowEdit: {}
    },
    eventos: {
      TABLE: () => {
        $(`#${preguntasTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);
        $(`#${preguntasTable}_title`).text('FORMULARIO: ' + formularioCrud.variables.rowEdit?.nombre || '');

        if (!CpreguntasTable) {
          CpreguntasTable = $(`#${preguntasTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=AllPreguntas',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDFORM = formularioCrud.variables.rowEdit.id;
                d.CESTDO = func.obtenerCESTDO(preguntasTable);
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
              { data: "descp", title: "Pregunta", },
              {
                data: null, title: 'Tipo', render: data => {
                  let tipo = GDTYPEP_G.find(x => x.vlR1 === data.gdtypep);
                  return tipo ? tipo.dtlle : data.gdtypep;
                }
              },
              {
                data: null,
                title: 'Obligatorio',
                className: 'text-center',
                render: data => {
                  //Poner Si o No
                  return `<span>${data.requiredp ? 'Sí' : 'No'}</span>`;
                }
              },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  console.log(data)
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'
                    }></i></span>`;
                }
              },
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
              if ($(`#${preguntasTable}`).find('.radio-buttons').length == 0) {
                $(`#${preguntasTable}_filter`).append(radio_group_estados);

                $(`#${preguntasTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${preguntasTable}`).DataTable().ajax.reload();
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
                  $('#modalAddPregunta').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CpreguntasTable.ajax.reload();
        }
      },
      RESETCONTAINERS: (referencia) => {
        $(`#${referencia} #GDTYPEP_R #RADIO_OPTIONS_CONTAINER`).empty();
        $(`#${referencia} #GDTYPEP_C #CASILLEROS_OPTIONS_CONTAINER`).empty();
        $(`#${referencia} #GDTYPEP_S #OPTIONSELECT`).empty();

        $(`#${referencia} #GDTYPEP_R #OPTION_R`).val('');
        $(`#${referencia} #GDTYPEP_C #OPTION_C`).val('');
        $(`#${referencia} #GDTYPEP_S #OPTION_S`).val('');
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('ID', "");
        formData.append('IDFORM', formularioCrud.variables.rowEdit.id);
        formData.append('DESCP', $('#AddPregunta #DESCP').val());
        formData.append('GDTYPEP', $('#AddPregunta #GDTYPEP').val());
        formData.append('REQUIREDP', $('#AddPregunta #REQUIREDP').is(':checked'));
        let CESTDO = $('#AddPregunta #CESTDO').val();
        formData.append('CESTDO', CESTDO);

        let GDTYPEP = $('#AddPregunta #GDTYPEP').val();

        if (GDTYPEP === 'S') {
          let JSON_RESPUESTAS = [];
          $('#AddPregunta #GDTYPEP_S #OPTIONSELECT option').each(function () {
            JSON_RESPUESTAS.push({
              DESCP: $(this).text(),
              CESTDO
            });
          });
          formData.append('ALTERNATIVAS', JSON.stringify(JSON_RESPUESTAS));
        }

        if (GDTYPEP === 'R') {
          let JSON_RESPUESTAS = [];
          $('#AddPregunta #GDTYPEP_R #RADIO_OPTIONS_CONTAINER input[type="radio"]').each(function () {
            JSON_RESPUESTAS.push({
              DESCP: $(this).val(),
              CESTDO
            });
          });
          formData.append('ALTERNATIVAS', JSON.stringify(JSON_RESPUESTAS));
        }

        if (GDTYPEP === 'C') {
          let JSON_RESPUESTAS = [];
          $('#AddPregunta #GDTYPEP_C #CASILLEROS_OPTIONS_CONTAINER input[type="checkbox"]').each(function () {
            JSON_RESPUESTAS.push({
              DESCP: $(this).val(),
              CESTDO
            });
          });
          formData.append('ALTERNATIVAS', JSON.stringify(JSON_RESPUESTAS));
        }

        swalFire.cargando(['Espere un momento', 'Por favor espere, estamos agregando la pregunta']);
        $.ajax({
          url: uisApis.API + '=AddPregunta',
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
              swalFire.success('Pregunta agregada correctamente',
                '', {
                1: () => {
                  $('#modalAddPregunta').modal('hide');
                  CpreguntasTable.ajax.reload();
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
        formData.append('ID', preguntasCrud.variables.rowEdit.id);
        formData.append('IDFORM', formularioCrud.variables.rowEdit.id);
        formData.append('DESCP', $('#EditPregunta #DESCP').val());
        formData.append('GDTYPEP', $('#EditPregunta #GDTYPEP').val());
        formData.append('REQUIREDP', $('#EditPregunta #REQUIREDP').is(':checked'));
        let CESTDO = $('#EditPregunta #CESTDO').val();
        formData.append('CESTDO', CESTDO);

        let GDTYPEP = $('#EditPregunta #GDTYPEP').val();
        let alternativas = preguntasCrud.variables.rowEdit.alternativas ? JSON.parse(preguntasCrud.variables.rowEdit.alternativas) : [];

        // todo lo que hay, contrastar con alternativas por el id, si no existe ya en el DOM colocar DEL: true 
        if (GDTYPEP === 'S') {
          let JSON_RESPUESTAS = [];

          // 1. Recorro lo que está en el DOM
          $('#EditPregunta #GDTYPEP_S #OPTIONSELECT option').each(function () {
            let alt = alternativas.find(a => a.ID == $(this).val());

            if (alt) {
              // sigue existiendo → se mantiene
              alt.DEL = false;
              JSON_RESPUESTAS.push(alt);
            } else {
              // no estaba en alternativas → es nuevo
              JSON_RESPUESTAS.push({
                DESCP: $(this).text(),
                CESTDO
              });
            }
          });

          // 2. Recorro lo que vino de BD y ya no está en el DOM → marcar como eliminado
          alternativas.forEach(a => {
            if (!JSON_RESPUESTAS.find(r => r.ID == a.ID)) {
              a.DEL = true;
              JSON_RESPUESTAS.push(a);
            }
          });

          // 3. Armar el formData
          formData.append('ALTERNATIVAS', JSON.stringify(JSON_RESPUESTAS));
        }

        if (GDTYPEP === 'R') {
          let JSON_RESPUESTAS = [];
          $('#EditPregunta #GDTYPEP_R #RADIO_OPTIONS_CONTAINER input[type="radio"]').each(function () {
            let alt = alternativas.find(a => a.ID == $(this).val());
            if (alt) {
              // sigue existiendo → se mantiene
              alt.DEL = false;
              JSON_RESPUESTAS.push(alt);
            } else {
              // no estaba en alternativas → es nuevo
              JSON_RESPUESTAS.push({
                DESCP: $(this).val(),
                CESTDO
              });
            }

          });

          // 2. Recorro lo que vino de BD y ya no está en el DOM → marcar como eliminado
          alternativas.forEach(a => {
            if (!JSON_RESPUESTAS.find(r => r.ID == a.ID)) {
              a.DEL = true;
              JSON_RESPUESTAS.push(a);
            }
          });

          formData.append('ALTERNATIVAS', JSON.stringify(JSON_RESPUESTAS));
        }

        if (GDTYPEP === 'C') {
          let JSON_RESPUESTAS = [];
          $('#EditPregunta #GDTYPEP_C #CASILLEROS_OPTIONS_CONTAINER input[type="checkbox"]').each(function () {
            let alt = alternativas.find(a => a.ID == $(this).val());
            if (alt) {
              // sigue existiendo → se mantiene
              alt.DEL = false;
              JSON_RESPUESTAS.push(alt);
            } else {
              // no estaba en alternativas → es nuevo
              JSON_RESPUESTAS.push({
                DESCP: $(this).val(),
                CESTDO
              });
            }

          });

          // 2. Recorro lo que vino de BD y ya no está en el DOM → marcar como eliminado
          alternativas.forEach(a => {
            if (!JSON_RESPUESTAS.find(r => r.ID == a.ID)) {
              a.DEL = true;
              JSON_RESPUESTAS.push(a);
            }
          });

          formData.append('ALTERNATIVAS', JSON.stringify(JSON_RESPUESTAS));
        }



        swalFire.cargando(['Espere un momento', 'Estamos actualizando la pregunta']);
        $.ajax({
          url: uisApis.API + '=UpdatePregunta',
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
              swalFire.success('Pregunta actualizado correctamente', '', {
                1: () => {
                  $('#modalEditPregunta').modal('hide');
                  CpreguntasTable.ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) =>
            swalFire.error('Ocurrió un error al actualizar la pregunta')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando la pregunta']);
        $.ajax({
          url: uisApis.API + '=DeletePregunta',
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
              swalFire.success('Pregunta eliminada correctamente', '', {
                1: () => $(`#${preguntasTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar la pregunta')
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DESCP: agregarValidaciones({
          required: true
        }),
        GDTYPEP: agregarValidaciones({
          required: true
        }),
      },
      UPDATE: {
        DESCP: agregarValidaciones({
          required: true
        }),
        GDTYPEP: agregarValidaciones({
          required: true
        }),
      }
    }
  };

  const respuestasCrud = {
    init: () => {
      respuestasCrud.eventos.TABLE();
    },
    globales: () => {
      $(`#${respuestasTable}`).on('click', '.btn-link-pre-formulario', function () {
        const data = CrespuestasTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
        const urlFormulario = '/Perfil/Forms/index?preview=true&id=' + formularioCrud.variables.rowEdit.id + '&sendmail=' + encodeURIComponent(data.email);
        window.open(urlFormulario, '_blank');
      });
    },
    eventos: {
      TABLE: () => {
        $(`#${respuestasTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CrespuestasTable) {
          CrespuestasTable = $(`#${respuestasTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=AllEmails',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.ID = formularioCrud.variables.rowEdit.id;
                d.CESTDO = func.obtenerCESTDO(respuestasTable);
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
              { data: "nombres", title: "Nombres", },
              { data: "email", title: "Correo", },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'
                    }></i></span>`;
                }
              },
              {
                data: null,
                title: '',
                className: 'text-center',
                render: data => {
                  return `<div class="d-flex justify-content-center m-0 p-0">
                        <button name="IR A LINK" class="btn btn-sm btn-icon btn-link-pre-formulario" title="Ir al formulario"><i class="bx bx-link"></i></button>
                      </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${respuestasTable}`).find('.radio-buttons').length == 0) {
                $(`#${respuestasTable}_filter`).append(radio_group_estados);

                $(`#${respuestasTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${respuestasTable}`).DataTable().ajax.reload();
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
                  $('#modalAddFormulario').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CrespuestasTable.ajax.reload();
        }
      },
    }
  }

  const usuariosCrud = {
    init: () => {
      func.selects2("FormReporte");
      usuariosCrud.eventos.REPORTE();
    },
    globales: () => {
      // evento a formReporte IDMRCA, que es un select2
      $('#FormReporte #IDMRCA').select2().on('change', function () {
        usuariosCrud.eventos.REPORTE();
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
              usuariosCrud.eventos.BARTCHARTJS(response.data);
              usuariosCrud.eventos.PASTELCHARTJS(response.data);
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

        if (horizontalBarChartVar) {
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

        if (polarChartVar) {
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
    },
    eventos: {
      selects: () => {
        let GRUPODATOS = "GDFORMT,GDTYPEP";
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
                if (name === 'GDTYPEP') GDTYPEP_G = data;
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
    }
  };

  return {
    init: async () => {
      await globalCrud.init();
      await func.limitarCaracteres()

      formularioCrud.init();
      formularioCrud.globales();
      preguntasCrud.globales();
      respuestasCrud.globales();
      // usuariosCrud.globales();

      var myTabs = document.querySelectorAll('.erp-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');
          if (tabPane === '#navs-formulario') {
            redirect(false, 'navs-preguntas', 0);
            redirect(false, 'navs-usuarios', 0);
            formularioCrud.eventos.TABLE();
          }

          if (tabPane === '#navs-preguntas') {
            $("#AddPregunta #GDTYPEP_R").hide();
            $("#AddPregunta #GDTYPEP_C").hide();
            $("#AddPregunta #GDTYPEP_S").hide();
            preguntasCrud.eventos.TABLE();
          }

          if (tabPane === '#navs-respuestas') {
            respuestasCrud.eventos.TABLE();
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
