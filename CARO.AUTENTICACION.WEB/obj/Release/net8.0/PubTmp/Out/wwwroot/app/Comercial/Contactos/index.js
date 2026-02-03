/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Comercial/Contactos/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler',
    MR: '/Seguridad/Marcas/Index?handler'
  };

  // * VARIABLES
  let CcontactosTable = null;
  let contactosTable = 'contactosTable';
  let CmailingsTable = null;
  let mailingsTable = 'emailsTable';

  let grupoDatos = [];
  let marcasGD = [];
  let contactosPorRubro = {}
  const safeParse = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === 'object') return value;      // ya está parseado
    try { return JSON.parse(value); } catch { return fallback; }
  };

  async function actualizarPreview() {
    const html = await mailCaroCrud.eventos.generarHTML_Plantilla1(false);
    $('#previewContainer').html(html);
  }

  // * TABLAS
  const contactosCrud = {
    init: () => {
      contactosCrud.eventos.TABLACONTACTOS();
    },
    globales: () => {
      // * MODALES
      $('#modalAddContacto').on('show.bs.modal', function (e) {
        configFormVal('AddContacto', contactosCrud.validaciones.INSERT, () => contactosCrud.eventos.INSERT());
      });

      $('#modalEditContacto').on('show.bs.modal', function (e) {
        configFormVal('EditContacto', contactosCrud.validaciones.UPDATE, () => contactosCrud.eventos.UPDATE());
        func.actualizarForm('EditContacto', contactosCrud.variables.contacto);

        const safeSplit = (valor) => {
          return valor ? valor.toString().split(',') : [];
        };

        $('#EditContacto #IDMRCA').val(safeSplit(contactosCrud.variables.contacto.idmrcA_F)).trigger('change');
        $('#EditContacto #GDRBROC').val(safeSplit(contactosCrud.variables.contacto.gdrbroc)).trigger('change');
        $('#EditContacto #GDCRGOC').val(safeSplit(contactosCrud.variables.contacto.gdcrgoc)).trigger('change');
        $('#EditContacto #CLENTE').prop('checked', contactosCrud.variables.contacto.clente == 1 ? true : false);
      });

      // * FORMULARIOS
      $(`#${contactosTable}`).on('click', '.edit-plantilla-button', function () {
        const data = CcontactosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el contacto seleccionado');
        contactosCrud.variables.contacto = data;
        $('#modalEditContacto').modal('show');
      });

      $(`#${contactosTable}`).on('click', '.delete-plantilla-button', function () {
        const data = CcontactosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el contacto seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar la plantilla?', {
          1: () => contactosCrud.eventos.DELETE(data.id)
        });
      });

      // * CARGA MASIVA
      $('#archivoContactos').on('change', function (e) {
        contactosCrud.eventos.CARGAR_ARCHIVO(e.target.files[0]);
      });

      $("#btnAddMasivoContacto").off('click').on('click', async function (e) {
        e.preventDefault();

        const contactos = contactosCrud.variables.data;

        if (!contactos || contactos.length === 0) {
          return swalFire.warning('No hay contactos cargados para insertar');
        }

        // Confirmar inserción
        swalFire.confirmar(`¿Está seguro de insertar ${contactos.length} contactos?`, {
          1: async () => {
            swalFire.cargando(['Espere un momento', `Insertando contactos...`]);

            let insertados = 0;
            let errores = 0;
            const erroresDetalle = [];

            // Insertar uno por uno
            for (let i = 0; i < contactos.length; i++) {
              try {
                await contactosCrud.eventos.INSERT(contactos[i]);
                insertados++;
              } catch (error) {
                errores++;
                erroresDetalle.push({
                  fila: i + 1,
                  contacto: `${contactos[i].nombre} ${contactos[i].apellido}`,
                  error: error
                });
              }
            }

            // Mostrar resultado
            const mensaje = `
              <div class="text-start">
                <p><strong>Insertados:</strong> ${insertados}</p>
                <p><strong>Errores:</strong> ${errores}</p>
                ${errores > 0 ? `
                  <hr>
                  <p class="mb-2"><strong>Detalle de errores:</strong></p>
                  <ul class="small">
                    ${erroresDetalle.slice(0, 5).map(e => `<li>Fila ${e.fila}: ${e.contacto} - ${e.error}</li>`).join('')}
                    ${errores > 5 ? `<li>... y ${errores - 5} errores más</li>` : ''}
                  </ul>
                ` : ''}
              </div>
            `;

            if (errores === 0) {
              swalFire.success('Todos los contactos fueron insertados correctamente', mensaje, {
                1: () => {
                  $('#modalAddMasivoContacto').modal('hide');
                  $(`#${contactosTable}`).DataTable().ajax.reload();
                  // Limpiar
                  $('#archivoContactos').val('');
                  if ($.fn.DataTable.isDataTable('#cargaContactosTable')) {
                    $('#cargaContactosTable').DataTable().clear().destroy();
                  }
                  contactosCrud.variables.data = {};
                }
              });
            } else if (insertados > 0) {
              swalFire.warning('Inserción parcial', mensaje, {
                1: () => {
                  $(`#${contactosTable}`).DataTable().ajax.reload();
                }
              });
            } else {
              swalFire.error('No se pudo insertar ningún contacto', mensaje);
            }
          }
        });
      })

      // cuando se cierra modal volver a cargar tabla
      $('#modalAddMasivoContacto').on('hidden.bs.modal', function (e) {
        $(`#${contactosTable}`).DataTable().ajax.reload();
      });
    },
    variables: {
      contacto: {},
      data: {}
    },
    eventos: {
      TABLACONTACTOS: () => {
        $(`#${contactosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CcontactosTable) {
          CcontactosTable = $(`#${contactosTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDMRCA = func.IDEMPRESA();
                d.CESTDO = func.obtenerCESTDO(contactosTable);
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
              { data: null, title: 'Persona', render: data => `${data.nmbrs}, ${data.apllds}` },
              { data: 'eml', title: 'Email' },
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
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-plantilla-button" title="Editar"><i class="bx bx-edit"></i></button>
                        <button name="ELIMINAR" class="btn btn-sm btn-icon delete-plantilla-button" data-id="${data.id}" title="Eliminar"><i class="bx bx-trash"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${contactosTable}`).find('.radio-buttons').length == 0) {
                $(`#${contactosTable}_filter`).append(radio_group_estados);

                $(`#${contactosTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${contactosTable}`).DataTable().ajax.reload();
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
                  $('#modalAddContacto').modal('show');
                }
              });

              // agregar boton carga masiva
              buttons.unshift({
                text: '<i class="bx bx-upload me-0 me-md-2"></i><span class="d-none d-md-inline-block">Carga Masiva</span>',
                className: 'btn btn-label-primary btn-upload',
                action: function (e, dt, node, config) {
                  // limpiar todo
                  $('#archivoContactos').val('');
                  if ($.fn.DataTable.isDataTable('#cargaContactosTable')) {
                    $('#cargaContactosTable').DataTable().clear().destroy();
                  }
                  contactosCrud.variables.data = {};
                  $('#modalAddMasivoContacto').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CcontactosTable.ajax.reload();
        }
      },
      INSERT: (dataContacto = null) => {
        return new Promise((resolve, reject) => {
          let formData = new FormData();

          if (dataContacto) {
            // Datos pasados por parámetro (carga masiva)
            formData.append('CLIENTE', dataContacto.cliente || '');
            formData.append('NMBRS', dataContacto.nombre || '');
            formData.append('APLLDS', dataContacto.apellido || '');
            formData.append('EML', dataContacto.email || '');
            formData.append('TLFNO', dataContacto.telefono || '');
            formData.append('DRCCN', dataContacto.direccion || '');
            formData.append('CLENTE', 1);
            formData.append('GDRBROC', dataContacto.rubro || '');
            formData.append('GDCRGOC', dataContacto.cargo || '');
            formData.append('IDMRCA_V', dataContacto.marca || '');
            formData.append('GDSEXO', dataContacto.gdsexo || '');
            formData.append('CESTDO', 'A');
          } else {
            // Datos del formulario
            formData.append('CLIENTE', $('#AddContacto #CLIENTE').val());
            formData.append('NMBRS', $('#AddContacto #NMBRS').val());
            formData.append('APLLDS', $('#AddContacto #APLLDS').val());
            formData.append('EML', $('#AddContacto #EML').val());
            formData.append('TLFNO', $('#AddContacto #TLFNO').val());
            formData.append('DRCCN', $('#AddContacto #DRCCN').val());
            formData.append('CLENTE', $('#AddContacto #CLENTE').is(':checked') ? 1 : 0);
            formData.append('GDRBROC', $('#AddContacto #GDRBROC').val());
            formData.append('GDCRGOC', $('#AddContacto #GDCRGOC').val());
            formData.append('IDMRCA_V', $('#AddContacto #IDMRCA').val());
            formData.append('CESTDO', $('#AddContacto #CESTDO').val());
            formData.append('GDSEXO', $('#AddContacto #GDSEXO').val());
          }

          if (!dataContacto) {
            swalFire.cargando(['Espere un momento', 'Estamos registrando el contacto']);
          }

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
                if (!dataContacto) {
                  swalFire.success('Contacto registrado correctamente', '', {
                    1: () => {
                      $('#modalAddContacto').modal('hide');
                      $(`#${contactosTable}`).DataTable().ajax.reload();
                    }
                  });
                }
                resolve(data);
              } else {
                if (!dataContacto) {
                  swalFire.error(data.mensaje);
                }
                reject(data.mensaje || 'Error al insertar');
              }
            },
            error: (jqXHR, textStatus, errorThrown) => {
              if (!dataContacto) {
                swalFire.error('Ocurrió un error al agregar el contacto');
              }
              reject(errorThrown || 'Error de conexión');
            }
          });
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', contactosCrud.variables.contacto.id);
        formData.append('CLIENTE', $('#EditContacto #CLIENTE').val());
        formData.append('NMBRS', $('#EditContacto #NMBRS').val());
        formData.append('APLLDS', $('#EditContacto #APLLDS').val());
        formData.append('EML', $('#EditContacto #EML').val());
        formData.append('TLFNO', $('#EditContacto #TLFNO').val());
        formData.append('DRCCN', $('#EditContacto #DRCCN').val());
        formData.append('CLENTE', $('#EditContacto #CLENTE').is(':checked') ? 1 : 0);
        formData.append('GDRBROC', $('#EditContacto #GDRBROC').val());
        formData.append('GDCRGOC', $('#EditContacto #GDCRGOC').val());
        formData.append('IDMRCA_V', $('#EditContacto #IDMRCA').val());
        formData.append('CESTDO', $('#EditContacto #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el contacto']);
        formData.append('GDSEXO', $('#EditContacto #GDSEXO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el contacto']);
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
              swalFire.success('Contacto actualizado correctamente', '', {
                1: () => {
                  $('#modalEditContacto').modal('hide');
                  $(`#${contactosTable}`).DataTable().ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el contacto')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el contacto']);
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
              swalFire.success('Contacto eliminado correctamente', '', {
                1: () => $(`#${contactosTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el contacto')
        });
      },
      CARGAR_ARCHIVO: (file) => {
        if (!file) return;
        const reader = new FileReader();

        reader.onload = function (e) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Buscar hoja "contactos"
            const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'contactos');
            if (!sheetName) {
              return swalFire.error('No se encontró la hoja "contactos" en el archivo');
            }

            const worksheet = workbook.Sheets[sheetName];

            // Leer encabezados de la primera fila
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            const headers = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
              const cell = worksheet[cellAddress];

              // Detener si encontramos una celda vacía (fin de headers reales)
              if (!cell || !cell.v) break;

              headers.push(cell.v.toString().toLowerCase().trim());
            }

            // Convertir a JSON asegurando que todas las columnas estén presentes
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              defval: '', // Valor por defecto para celdas vacías
              raw: false  // Convertir todo a string
            });

            if (jsonData.length === 0) {
              return swalFire.error('La hoja "contactos" está vacía');
            }

            // Validar estructura de columnas
            const requiredColumns = ['cliente', 'nombre', 'apellidop', 'apellidom', 'email', 'telefono', 'direccion', 'rubro', 'cargo', 'marca', 'gdsexo'];
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            if (missingColumns.length > 0) {
              return swalFire.error(`Faltan columnas requeridas: ${missingColumns.join(', ')}`);
            }

            // Normalizar los datos para asegurar que todas las columnas existan (incluso vacías)
            const normalizedData = jsonData.map(row => {
              const normalizedRow = {};
              requiredColumns.forEach(col => {
                // Buscar la columna con mayúsculas/minúsculas flexibles
                const key = Object.keys(row).find(k => k.toLowerCase() === col);
                let value = key ? (row[key] || '') : '';
                // Limpiar espacios, saltos de línea y tabulaciones
                if (typeof value === 'string') {
                  value = value.trim().replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ');
                }
                normalizedRow[col] = value;
              });
              return normalizedRow;
            });

            // Destruir DataTable si existe
            if ($.fn.DataTable.isDataTable('#cargaContactosTable')) {
              $('#cargaContactosTable').DataTable().clear().destroy();
            }

            // Crear DataTable con los datos
            
            
            let RUBRO_GD = grupoDatos.filter(gd => gd.gdpdre === 'GDRBROC');
            let CARGO_GD = grupoDatos.filter(gd => gd.gdpdre === 'GDCRGOC');
            let SEXO_GD = grupoDatos.filter(gd => gd.gdpdre === 'GDSEXO');
            let MARCA_GD = marcasGD;

            // Función helper para procesar valores múltiples separados por comas
            const procesarValoresMultiples = (valorStr, arrayBusqueda, campoComparar, campoRetornar) => {
              if (!valorStr || !valorStr.trim()) return '';

              // Separar por comas, limpiar y procesar cada valor
              const valores = valorStr.split(',')
                .map(v => v.trim())
                .filter(v => v.length > 0);

              const resultados = valores
                .map(valor => {
                  const encontrado = arrayBusqueda.find(item =>
                    item[campoComparar].toLowerCase() === valor.toLowerCase()
                  );
                  return encontrado ? encontrado[campoRetornar] : null;
                })
                .filter(v => v !== null);

              return resultados.join(',');
            };
            
            // iterar registros y mapear valores
            normalizedData.forEach(contacto => {
              contacto.apellido = `${contacto?.apellidop || ''} ${contacto.apellidom || ''}`.trim();

              contacto.cargo = procesarValoresMultiples(
                contacto.cargo,
                CARGO_GD,
                'dtlle',
                'vlR1'
              );

              // Procesar MARCA (puede tener múltiples valores)
              contacto.marca = procesarValoresMultiples(
                contacto.marca,
                MARCA_GD,
                'mrca',
                'id'
              );

              // Procesar RUBRO (puede tener múltiples valores)
              contacto.rubro = procesarValoresMultiples(
                contacto.rubro,
                RUBRO_GD,
                'dtlle',
                'vlR1'
              );

              // Procesar SEXO (normalmente un solo valor)
              contacto.gdsexo = procesarValoresMultiples(
                contacto.gdsexo,
                SEXO_GD,
                'dtlle',
                'vlR1'
              );
            });

            console.log('Contactos normalizados para inserción masiva:', normalizedData);
            $('#cargaContactosTable').DataTable({
              data: normalizedData,
              columns: [
                { data: 'cliente', title: 'Cliente', defaultContent: '' },
                { data: 'nombre', title: 'Nombre', defaultContent: '' },
                { data: 'apellido', title: 'Apellido', defaultContent: '' },
                { data: 'email', title: 'Email', defaultContent: '' },
                { data: 'telefono', title: 'Teléfono', defaultContent: '' },
                { data: 'direccion', title: 'Dirección', defaultContent: '' },
                { data: 'rubro', title: 'Rubro', defaultContent: '' },
                { data: 'cargo', title: 'Cargo', defaultContent: '' },
                { data: 'marca', title: 'Marca', defaultContent: '' },
                { data: 'gdsexo', title: 'Sexo', defaultContent: '' }
              ],
              pageLength: 10,
              lengthChange: false,
              searching: false,
              info: true,
              ordering: false,
              language: {
                emptyTable: "No hay datos disponibles",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                paginate: {
                  first: "Primero",
                  last: "Último",
                  next: "Siguiente",
                  previous: "Anterior"
                }
              }
            });
            contactosCrud.variables.data = normalizedData;
            swalFire.success(`${normalizedData.length} contactos cargados correctamente`);

          } catch (error) {
            console.error('Error al procesar el archivo:', error);
            swalFire.error('Error al procesar el archivo. Verifique que sea un archivo Excel válido');
          }
        };

        reader.onerror = function () {
          swalFire.error('Error al leer el archivo');
        };

        reader.readAsArrayBuffer(file);
      },
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
        EML: agregarValidaciones({
          required: true,
          regexp: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'El email no es válido'
        }),
        GDSEXO: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        NMBRS: agregarValidaciones({
          required: true
        }),
        APLLDS: agregarValidaciones({
          required: true
        }),
        EML: agregarValidaciones({
          required: true,
          regexp: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'El email no es válido'
        }),
        GDSEXO: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const mailingsCrud = {
    init: () => {
      mailingsCrud.eventos.TABLE();
    },
    globales: () => {
      // evento al view
      $(`#${mailingsTable}`).on('click', '.view-email-button', function () {
        const data = CmailingsTable.row($(this).parents('tr')).data();
        if (!data.mailinG_ID) return swalFire.error('No se encontró el mailing seleccionado');

        data.imageneS_JSON = safeParse(data.imageneS_JSON, []);
        data.metricaS_DETALLE = safeParse(data.metricaS_DETALLE, []);
        data.metricaS_GENERAL = safeParse(data.metricaS_GENERAL, {});

        // añadirle asunto antes de data.cuerpO_HTML
        const contenidoConAsunto = `<div style="text-align:left;margin-bottom:16px;">
        <h2 style="color:#222;margin:0;font-size:20px;">${data.asunto}</h2>
      </div><br>` + data.cuerpO_HTML;

        $('#btnAddMailing').hide();
        $('#vistaPreviaBody').html(contenidoConAsunto);
        $('#modalVistaPrevia').modal('show');
        // Aquí puedes agregar la lógica para mostrar el correo electrónico
      });

      $(`#${mailingsTable}`).on('click', '.view-metricas-button', function () {

        const data = CmailingsTable.row($(this).parents('tr')).data();
        if (!data.mailinG_ID) return swalFire.error('No se encontró el mailing seleccionado');

        const general = safeParse(data.metricaS_GENERAL, {});
        const detalle = safeParse(data.metricaS_DETALLE, []);

        mailingsCrud.eventos.mostrarMetricas(general, detalle);
      });

    },
    variables: {
      data: {}
    },
    eventos: {
      TABLE: () => {
        $(`#${mailingsTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CmailingsTable) {
          CmailingsTable = $(`#${mailingsTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarMailings',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDMRCA = func.IDEMPRESA();
                d.FPROGRAMADA = $('#filtroFechaProgramada').val() || '';
                d.ESTADO = $('#filtroEstado').val() || '';
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
              { data: 'asunto', title: 'Asunto' },
              { data: null, title: 'F. Registro', render: data => func.formatFecha(data.fechA_REGISTRO, 'DD-MM-YYYY HH:mm a') },
              {
                data: null,
                title: 'F. Envío',
                render: data => func.formatFecha(data.fprogramada, 'DD-MM-YYYY HH:mm a')
              },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  const estado = data.estado?.toLowerCase() || 'pendiente';
                  return estado === 'enviado'
                    ? `<span title="Enviado"><i class="bx bx-check-circle text-success" style="font-size:20px;"></i></span>`
                    : `<span title="Pendiente"><i class="bx bx-time-five text-warning" style="font-size:20px;"></i></span>`;
                }
              },
              {
                data: null,
                title: '',
                className: 'text-center',
                render: data => {
                  console.log(data);
                  return `<div class="d-flex justify-content-center m-0 p-0">
                        <button name="VIEW" class="btn btn-sm btn-icon view-email-button" data-id="${data.id}" title="Ver"><i class="bx bx-show"></i></button>
                        <button name="REPORTE" class="btn btn-sm btn-icon view-metricas-button" data-id="${data.id}" title="Reporte"><i class="bx bx-bar-chart"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              // Agregar filtros de fecha y estado
              if ($(`#${mailingsTable}_wrapper .filtros-mailing`).length === 0) {
                $(`#${mailingsTable}_filter`).append(`
                  <div class="filtros-mailing d-inline-flex gap-2 ms-2">
                    <input type="date" id="filtroFechaProgramada" class="form-control form-control-sm" style="width:150px;" placeholder="Fecha" />
                    <select id="filtroEstado" class="form-select form-select-sm" style="width:120px;">
                      <option value="">Todos</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="enviado">Enviado</option>
                    </select>
                  </div>
                `);

                $('#filtroFechaProgramada, #filtroEstado').on('change', function () {
                  $(`#${mailingsTable}`).DataTable().ajax.reload();
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];
              return buttons;
            })()
          });
        } else {
          CmailingsTable.ajax.reload();
        }
      },
      mostrarMetricas: (mGeneral, mDetalle) => {
        const g = `
        <div class="row text-center gy-4">

          <div class="col">
            <div class="p-3 rounded shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
              <small class="text-dark fw-semibold d-block mb-1">
                <i class="bx bx-send me-1"></i> Total de Envíos
              </small>
              <h4 class="fw-bold text-primary mb-0">${mGeneral.TOTAL_ENVIADOS}</h4>
            </div>
          </div>

          <div class="col">
            <div class="p-3 rounded shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
              <small class="text-dark fw-semibold d-block mb-1">
                <i class="bx bx-show me-1"></i> Tasa de Apertura
              </small>
              <h4 class="fw-bold text-success mb-0">${mGeneral.TOTAL_ABIERTOS}</h4>
            </div>
          </div>

          <div class="col">
            <div class="p-3 rounded shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
              <small class="text-dark fw-semibold d-block mb-1">
                <i class="bx bx-mouse me-1"></i> Tasa de Clics
              </small>
              <h4 class="fw-bold text-info mb-0">${mGeneral.TOTAL_CLICKS}</h4>
            </div>
          </div>

          <div class="col">
            <div class="p-3 rounded shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
              <small class="text-dark fw-semibold d-block mb-1">
                <i class="bx bx-user-x me-1"></i> Desuscripciones
              </small>
              <h4 class="fw-bold text-danger mb-0">${mGeneral.TOTAL_EVENTOS}</h4>
            </div>
          </div>

        </div>
      `;

        $("#metricasGeneral").html(g);

        // Destruir si ya existe (para evitar errores)
        if ($.fn.DataTable.isDataTable('#tablaMetricas')) {
          $('#tablaMetricas').DataTable().clear().destroy();
        }

        $('#tablaMetricas').DataTable({
          data: mDetalle,
          columns: [
            { data: "DESTINATARIO", title: "Destinatario" },
            { data: "ENVIADOS", title: "Enviado" },
            { data: "ABIERTOS", title: "Abierto" },
            { data: "CLICKS", title: "Click" },
            { data: "TOTAL_EVENTOS", title: "Eventos" }
          ],
          pageLength: 10,
          lengthChange: false,
          searching: false,
          info: true,
          ordering: false
        });

        $("#modalMetricas").modal("show");
      }

    },
  };

  const mailCaroCrud = {
    plantillaRendered: false,

    init: async () => {
      mailCaroCrud.eventos.cargarPlantilla1();
    },

    globales: async () => {
      let enviandoMailing = false;

      $("#btnAddMailing").off('click').on('click', async function (e) {
        e.preventDefault();
        if (enviandoMailing) return;
        enviandoMailing = true;

        try {
          let html = await mailCaroCrud.eventos.generarHTML_Plantilla1(true);
          await mailCaroCrud.eventos.sendMailing(html);
        } finally {
          enviandoMailing = false; // libera bloqueo
        }
      });

    },

    eventos: {
      // === PLANTILLA 1 ===
      cargarPlantilla1: async () => {

        $('#formularioContainer').html(`
    <div id="formPlantilla1" class="p-3 border rounded-3 bg-white shadow-sm">

      <!-- Correo de Envío -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Correo de Envío <span class="text-danger">*</span></label>
        <select id="GDCRROENV" name="GDCRROENV" class="form-select">
          <option value="">Seleccione un correo</option>
        </select>
      </div>

      <!-- Placeholder de Correo -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Placeholder de Correo <span class="text-danger">*</span></label>
        <input type="text" id="PLACEHOLDER" name="PLACEHOLDER" class="form-control" placeholder="Placeholder de correo" />
      </div>

      <!-- Asunto -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Asunto <span class="text-danger">*</span></label>
        <input type="text" id="asunto1" class="form-control" placeholder="Asunto del correo" required />
      </div>

      <!-- Contactos -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Contactos</label>
        <div class="d-flex gap-2 align-items-start">
          <div class="flex-grow-1">
            <select id="contactos1" class="form-select" multiple></select>
          </div>
          <button type="button" id="btnReloadContactos" class="btn btn-outline-secondary" title="Recargar contactos">
            <i class="bx bx-refresh"></i>
          </button>
        </div>
      </div>

      <!-- Leyendas de reemplazo -->
      <div class="mb-3">
        <div class="alert-info-preview py-2">
          <strong>Si desea reemplazar valores:</strong>
          <ul class="mb-0 mt-2 small">
            <li><strong>Nombre:</strong> colocar <code>#V_NOMBRE</code></li>
            <li><strong>Apellidos:</strong> colocar <code>#V_APELLIDO</code></li>
            <li><strong>Cliente:</strong> colocar <code>#V_CLIENTE</code></li>
            <li><strong>Email:</strong> colocar <code>#V_EMAIL</code></li>
            <li><strong>Nombres completos:</strong> colocar <code>#V_NCOMPLETO</code></li>
            <li><strong>Sr. o Srta.:</strong> colocar <code>#V_SRN</code></li>
            <li><strong>Estimado o Estimada:</strong> colocar <code>#V_GDEST</code></li>
          </ul>
        </div>
      </div>

      <!-- Mensaje -->
      <div class="mb-4">
        <label class="form-label fw-semibold">Mensaje</label>
        <div class="border rounded-3 quill-container bg-white">
          <div id="mensaje1" class="quill-editor" style="min-height:150px;"></div>
        </div>
      </div>

      <!-- Opción de correo normal -->
      <div class="mb-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="chkCorreoNormal">
          <label class="form-check-label" for="chkCorreoNormal">
            <strong>Correo Normal</strong> (contenido a ancho completo sin límite de 600px)
          </label>
        </div>
      </div>

      <!-- CONTENEDOR DE ITEMS -->
      <div class="d-flex gap-2 mb-3">
        <button type="button" id="btnEnviarCorreo" class="btn btn-primary btn-sm">
          <i class="bx bx-send"></i> Enviar Correo
        </button>
        <button type="button" id="btnBorrarTodo" class="btn btn-outline-danger btn-sm">
          <i class="bx bx-trash"></i> Borrar Todo
        </button>
      </div>

      <!-- CONTENEDOR CAMPO FECHA PARA PROGRAMAR -->
      <div id="programarEnvioContainer" class="mb-3">
        <label class="form-label fw-semibold">Fecha y hora de envío</label>
        <input type="datetime-local" id="fechaProgramada" class="form-control" />
        <span class="form-text">Llene este campo solo si desea programar el envío para una fecha futura.</span>
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold">Contenido dinámico</label>
        
        <div id="itemsContainer"></div>

        <div class="d-flex gap-2 mt-3">

          <button type="button" id="btnAddImagen" class="btn btn-outline-primary btn-sm">
            <i class="bx bx-image-add"></i> Agregar Imagen
          </button>

          <button id="btnAddImagenFila" class="btn btn-primary">
              Agregar fila de imágenes
          </button>


        </div>

      </div>

    </div>
  `);


        // --- QUILL ---
        const quill = new Quill('#mensaje1', {
          theme: 'snow',
          placeholder: 'Escribe...',
          modules: {
            toolbar: [['bold', 'italic'], ['link'], [{ list: 'ordered' }, { list: 'bullet' }]]
          }
        });

        // ======================================================
        //      ➕ AGREGAR IMAGEN
        // ======================================================
        $(document).off("click", "#btnAddImagen").on("click", "#btnAddImagen", function () {
          const randomId = 'img_' + Date.now() + Math.random().toString(36).substr(2, 9);

          $("#itemsContainer").append(`
              <div class="itemElemento border rounded-3 p-3 mb-3 bg-light" data-tipo="imagen">

                <div class="d-flex justify-content-between mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary btnToggleCollapse" type="button" data-bs-toggle="collapse" data-bs-target="#${randomId}">
                      <i class="bx bx-chevron-down"></i>
                    </button>
                    <span class="fw-semibold">Imagen</span>
                  </div>
                  <button class="btn btn-sm btn-danger btnEliminarItem">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>

                <div class="collapse show" id="${randomId}">
                  <input type="file" class="itemImagen form-control mb-2" accept="image/*" />
                  <input type="url" class="itemEnlace form-control mb-2" placeholder="Enlace de la imagen" />

                <!-- Tamaño -->
                <div class="mb-2">
                  <input type="number" class="itemWidth form-control" placeholder="Ancho (px)" value="600" min="50" max="800" />
                </div>

                <!-- Alineación -->
                <div class="mb-2">
                  <label class="form-label small">Alineación</label>
                  <select class="itemImageAlign form-select form-select-sm">
                    <option value="center">Centro</option>
                    <option value="left">Izquierda</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>

                  <!-- Márgenes dinámicos -->
                  <div class="d-flex gap-2">
                    <input type="number" class="itemMT form-control" placeholder="Margin Top" value="2" min="0" />
                    <input type="number" class="itemMB form-control" placeholder="Margin Bottom" value="2" min="0" />
                    <input type="number" class="itemML form-control" placeholder="Margin Left" value="0" min="0" />
                    <input type="number" class="itemMR form-control" placeholder="Margin Right" value="0" min="0" />
                  </div>
                </div>

              </div>
            `);



          actualizarPreview();
        });

        $(document).off("click", "#btnAddImagenFila").on("click", "#btnAddImagenFila", function () {
          const randomId = 'fila_' + Date.now() + Math.random().toString(36).substr(2, 9);

          let filaHTML = `
            <div class="itemElemento border rounded-3 p-3 mb-3 bg-light" data-tipo="imagen-fila">
              <div class="d-flex justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <button class="btn btn-sm btn-outline-secondary btnToggleCollapse" type="button" data-bs-toggle="collapse" data-bs-target="#${randomId}">
                    <i class="bx bx-chevron-down"></i>
                  </button>
                  <span class="fw-semibold">Fila de Imágenes</span>
                </div>
                <button class="btn btn-sm btn-danger btnEliminarItem">  
                  <i class="bx bx-trash"></i> 
                </button>
              </div>
              
              <div class="collapse show" id="${randomId}">
              <!-- Alineación -->
              <div class="mb-3">
                <label class="form-label fw-semibold small">Alineación</label>
                <select class="itemAlign form-select form-select-sm">
                  <option value="left">Izquierda</option>
                  <option value="center" selected>Centro</option>
                  <option value="right">Derecha</option>
                  <option value="justify">Justificado</option>
                  <option value="space-between">Space Between</option>
                  <option value="edges">Lados (1° izq, último der, resto centro)</option>
                </select>
              </div>
              
              <!-- Márgenes globales para la fila -->
              <div class="d-flex gap-2 mb-3">
                <input type="number" class="itemMT form-control" placeholder="Margin Top" value="2" min="0" />
                <input type="number" class="itemMB form-control" placeholder="Margin Bottom" value="2" min="0" />
                <input type="number" class="itemML form-control" placeholder="Margin Left" value="0" min="0" />
                <input type="number" class="itemMR form-control" placeholder="Margin Right" value="0" min="0" />
              </div>
              
              <!-- Contenedor de imágenes -->
              <div class="imagenes-fila-container">
                <div class="imagen-item border rounded p-2 mb-3 bg-white">
                  <div class="d-flex justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-1">
                      <button class="btn btn-sm btn-outline-secondary btnToggleImagenItem" type="button" data-bs-toggle="collapse" data-bs-target="#img_${randomId}_1">
                        <i class="bx bx-chevron-down" style="font-size: 12px;"></i>
                      </button>
                      <small class="fw-semibold">Imagen 1</small>
                    </div>
                    <button class="btn btn-sm btn-danger btnEliminarImagenFila">
                      <i class="bx bx-x"></i>
                    </button>
                  </div>
                  <div class="collapse show" id="img_${randomId}_1">
                    <input type="file" class="itemImagen form-control mb-2" accept="image/*" />
                    <input type="url" class="itemEnlace form-control mb-2" placeholder="Enlace de la imagen" />
                    <div class="mb-2">
                      <input type="number" class="itemWidth form-control form-control-sm" placeholder="Ancho (px)" value="100" min="50" max="400" />
                    </div>
                    <div class="row g-1">
                      <div class="col-6">
                        <input type="number" class="itemImgMT form-control form-control-sm" placeholder="MT" value="0" min="0" />
                      </div>
                      <div class="col-6">
                        <input type="number" class="itemImgMB form-control form-control-sm" placeholder="MB" value="0" min="0" />
                      </div>
                      <div class="col-6">
                        <input type="number" class="itemImgML form-control form-control-sm" placeholder="ML" value="5" min="0" />
                      </div>
                      <div class="col-6">
                        <input type="number" class="itemImgMR form-control form-control-sm" placeholder="MR" value="5" min="0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Botón agregar nueva imagen -->
              <button class="btn btn-sm btn-outline-primary btnAgregarImagenFila w-100">
                <i class="bx bx-plus"></i> Agregar Imagen
              </button>
              </div>
            </div>
          `;

          $("#itemsContainer").append(filaHTML);
          actualizarPreview();
        });

        // ======================================================
        //  🔽 TOGGLE COLLAPSE ICON
        // ======================================================
        $(document).off("click", ".btnToggleCollapse").on("click", ".btnToggleCollapse", function () {
          const icon = $(this).find('i');
          const target = $(this).attr('data-bs-target');

          $(target).on('shown.bs.collapse', function () {
            icon.removeClass('bx-chevron-down').addClass('bx-chevron-up');
          });

          $(target).on('hidden.bs.collapse', function () {
            icon.removeClass('bx-chevron-up').addClass('bx-chevron-down');
          });
        });

        // ======================================================
        //  🔽 TOGGLE COLLAPSE ICON - IMAGEN ITEM
        // ======================================================
        $(document).off("click", ".btnToggleImagenItem").on("click", ".btnToggleImagenItem", function () {
          const icon = $(this).find('i');
          const target = $(this).attr('data-bs-target');

          $(target).on('shown.bs.collapse', function () {
            icon.removeClass('bx-chevron-down').addClass('bx-chevron-up');
          });

          $(target).on('hidden.bs.collapse', function () {
            icon.removeClass('bx-chevron-up').addClass('bx-chevron-down');
          });
        });

        // ======================================================
        //  ➕ AGREGAR NUEVA IMAGEN A FILA
        // ======================================================
        $(document).off("click", ".btnAgregarImagenFila").on("click", ".btnAgregarImagenFila", function () {
          const container = $(this).siblings('.imagenes-fila-container');
          const numActual = container.find('.imagen-item').length + 1;
          const parentId = $(this).closest('.itemElemento').find('.collapse').first().attr('id');
          const imgItemId = `img_${parentId}_${numActual}`;

          const nuevaImagen = `
            <div class="imagen-item border rounded p-2 mb-3 bg-white">
              <div class="d-flex justify-content-between mb-2">
                <div class="d-flex align-items-center gap-1">
                  <button class="btn btn-sm btn-outline-secondary btnToggleImagenItem" type="button" data-bs-toggle="collapse" data-bs-target="#${imgItemId}">
                    <i class="bx bx-chevron-down" style="font-size: 12px;"></i>
                  </button>
                  <small class="fw-semibold">Imagen ${numActual}</small>
                </div>
                <button class="btn btn-sm btn-danger btnEliminarImagenFila">
                  <i class="bx bx-x"></i>
                </button>
              </div>
              <div class="collapse show" id="${imgItemId}">
                <input type="file" class="itemImagen form-control mb-2" accept="image/*" />
                <input type="url" class="itemEnlace form-control mb-2" placeholder="Enlace de la imagen" />
                <div class="mb-2">
                  <input type="number" class="itemWidth form-control form-control-sm" placeholder="Ancho (px)" value="100" min="50" max="400" />
                </div>
                <div class="row g-1">
                  <div class="col-6">
                    <input type="number" class="itemImgMT form-control form-control-sm" placeholder="MT" value="0" min="0" />
                  </div>
                  <div class="col-6">
                    <input type="number" class="itemImgMB form-control form-control-sm" placeholder="MB" value="0" min="0" />
                  </div>
                  <div class="col-6">
                    <input type="number" class="itemImgML form-control form-control-sm" placeholder="ML" value="5" min="0" />
                  </div>
                  <div class="col-6">
                    <input type="number" class="itemImgMR form-control form-control-sm" placeholder="MR" value="5" min="0" />
                  </div>
                </div>
              </div>
            </div>
          `;

          container.append(nuevaImagen);
          actualizarPreview();
        });

        // ======================================================
        //  ❌ ELIMINAR IMAGEN INDIVIDUAL DE FILA
        // ======================================================
        $(document).off("click", ".btnEliminarImagenFila").on("click", ".btnEliminarImagenFila", function () {
          $(this).closest('.imagen-item').remove();
          actualizarPreview();
        });

        // ======================================================
        //  🔄 CAMBIO DE ALINEACIÓN
        // ======================================================
        $(document).off("change", ".itemAlign").on("change", ".itemAlign", function () {
          actualizarPreview();
        });


        // ======================================================
        //  ❌ ELIMINAR ITEM
        // ======================================================
        $(document).off("click", ".btnEliminarItem").on("click", ".btnEliminarItem", function () {
          $(this).closest('.itemElemento').remove();
          actualizarPreview();
        });

        // ======================================================
        //  📌 CAPTURAR IMAGENES Y GUARDAR BASE64 PARA EL PREVIEW
        // ======================================================
        $(document).off("change", ".itemImagen").on("change", ".itemImagen", function () {

          const inputFile = this;
          const itemElemento = $(this).closest('.itemElemento');
          const tipo = itemElemento.data("tipo");
          const files = inputFile.files;

          if (files && files[0]) {
            // Validar tipo de archivo
            const fileType = files[0].type;
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];

            if (!validTypes.includes(fileType)) {
              swalFire.error('Solo se permiten imágenes PNG o JPG');
              inputFile.value = ''; // Limpiar el input
              return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
              if (tipo === "imagen-fila") {
                $(inputFile).closest('.imagen-item').attr("data-base64", e.target.result);
              } else {
                $(inputFile).closest('.itemElemento').attr("data-base64", e.target.result);
              }
              actualizarPreview();
            };
            reader.readAsDataURL(files[0]);
          }

        });



        // ======================================================
        // PREVIEW AUTOMÁTICO
        // ======================================================
        const actualizarPreview = async () => {
          const html = await mailCaroCrud.eventos.generarHTML_Plantilla1(false);
          $('#previewContainer').html(html);
        };

        $('#asunto1').off('input').on('input', actualizarPreview);
        $('#contactos1').off('change').on('change', actualizarPreview);
        quill.on('text-change', actualizarPreview);
        $('#chkCorreoNormal').off('change').on('change', actualizarPreview);

        $(document).off('change input', '#itemsContainer input, #itemsContainer select')
          .on('change input', '#itemsContainer input, #itemsContainer select', actualizarPreview);

        // Evento específico para inputs dentro de imagen-item
        $(document).off('change input', '.imagen-item input')
          .on('change input', '.imagen-item input', actualizarPreview);

        $('#btnEnviarCorreo').off('click').on('click', async () => {
          const html = await mailCaroCrud.eventos.generarHTML_Plantilla1(true);
          await mailCaroCrud.eventos.sendMailing(html);
        });

        $('#btnBorrarTodo').off('click').on('click', () => {
          swalFire.confirmar('¿Está seguro de borrar todo el contenido?', {
            1: () => {
              // Limpiar asunto
              $('#asunto1').val('');

              // Limpiar contactos
              $('#contactos1').multipleSelect('uncheckAll');

              // Limpiar mensaje Quill
              const quill = Quill.find(document.querySelector('#mensaje1'));
              quill.setContents([]);

              // Limpiar fecha programada
              $('#fechaProgramada').val('');

              // Limpiar todos los items
              $('#itemsContainer').empty();

              // Actualizar preview
              actualizarPreview();

              swalFire.success('Todo el contenido ha sido borrado');
            }
          });
        });

        $('#btnReloadContactos').off('click').on('click', async () => {
          swalFire.cargando(['Espere un momento', 'Recargando contactos...']);
          await mailCaroCrud.eventos.actualizarContactosSelect();
          swalFire.cerrar();
        });

        actualizarPreview();
        await mailCaroCrud.eventos.actualizarContactosSelect();

      },
      generarHTML_Plantilla1: async (isEnvio = false) => {

        const asunto = $('#asunto1').val().trim();
        if (!asunto && isEnvio) return swalFire.warning('El asunto es obligatorio');

        const contactosUnicos = $('#contactos1').multipleSelect('getSelects') || [];
        const contactos = [...new Set(contactosUnicos)];

        const quill = Quill.find(document.querySelector('#mensaje1'));
        const mensajeHTML = quill.root.innerHTML;

        // Verificar si está marcado correo normal
        const esCorreoNormal = $('#chkCorreoNormal').is(':checked');

        // Validar si el mensaje tiene contenido real (no solo tags vacíos de Quill)
        const mensajeTexto = quill.getText().trim();
        const tieneMensaje = mensajeTexto.length > 0;

        // Mostrar solo 4 contactos
        const visible = contactos.slice(0, 4);
        const restantes = contactos.length > 4 ? ` ... y ${contactos.length - 4} más` : '';
        const contactosMostrar = visible.join(', ') + restantes;

        // -----------------------------------------
        // 📌 LEER ITEMS INSERTADOS EN itemsContainer
        // -----------------------------------------
        let itemsHTML = "";

        $('#itemsContainer .itemElemento').each(function (index) {

          const tipo = $(this).data("tipo");

          // Márgenes dinámicos
          const mt = $(this).find('.itemMT').val() || 2;
          const mb = $(this).find('.itemMB').val() || 2;
          const ml = $(this).find('.itemML').val() || 0;
          const mr = $(this).find('.itemMR').val() || 0;

          // ---------------------------
          // 📌 IMAGEN
          // ---------------------------
          if (tipo === "imagen") {

            const link = $(this).find('.itemEnlace').val()?.trim() || "#";
            const base64 = $(this).attr("data-base64") || "";
            const width = $(this).find('.itemWidth').val() || 600;
            const imageAlign = $(this).find('.itemImageAlign').val() || 'center';

            if (!base64) return;

            // Si es correo normal, usar tamaño configurado con alineación seleccionada
            const imgWidth = esCorreoNormal ? width : width;
            const imgStyle = esCorreoNormal
              ? `width:${width}px; max-width:100%; height:auto; display:block; border:0;`
              : "max-width:100%; width:100%; height:auto; display:block; border:0;";
            const tdAlign = esCorreoNormal ? imageAlign : 'center';

            const imgTag = `<img src="${!isEnvio ? base64 : (index + 1)}" width="${imgWidth}" style="${imgStyle}" alt="Imagen" />`;
            const linkTag = `<a href="${isEnvio ? `replace_uri_${index + 1}&link=${encodeURIComponent(link)}&index=${index + 1}` : link}" target="_blank" style="display:block; text-decoration:none;">${imgTag}</a>`;

            itemsHTML += `
              <!-- Imagen Individual -->
              <table border="0" cellspacing="0" cellpadding="0" width="100%" style="border-collapse:collapse; margin-top:${mt}px; margin-bottom:${mb}px;">
                <tr>
                  <td align="${tdAlign}" style="padding-left:${ml}px; padding-right:${mr}px;">
                    ${linkTag}
                  </td>
                </tr>
              </table>
            `;
          }

          // ---------------------------
          // 📌 FILA DE IMÁGENES
          // ---------------------------
          if (tipo === "imagen-fila") {
            const align = $(this).find('.itemAlign').val() || 'center';
            const imagenes = $(this).find('.imagen-item');
            const totalImagenes = imagenes.length;

            // Tabla contenedora de la fila
            let filaHTML = `
              <!-- Fila de Imágenes -->
              <table border="0" cellspacing="0" cellpadding="0" width="100%" style="border-collapse:collapse; margin-top:${mt}px; margin-bottom:${mb}px;">
                <tr>
                  <td align="center" style="padding-left:${ml}px; padding-right:${mr}px;">
                    
                    <!-- Tabla interna para las imágenes -->
                    <table border="0" cellspacing="0" cellpadding="0" align="${align === 'edges' ? 'center' : align}" style="border-collapse:collapse;${align === 'edges' ? ' width:100%;' : ''}">
                      <tr>
            `;

            imagenes.each(function (colIndex) {
              const link = $(this).find('.itemEnlace').val()?.trim() || "#";
              const base64 = $(this).attr("data-base64") || "";
              const width = $(this).find('.itemWidth').val() || 100;

              // Márgenes individuales de cada imagen
              const imgMT = $(this).find('.itemImgMT').val() || 0;
              const imgMB = $(this).find('.itemImgMB').val() || 0;
              const imgML = $(this).find('.itemImgML').val() || 0;
              const imgMR = $(this).find('.itemImgMR').val() || 0;

              if (!base64) return;

              // Determinar alineación de cada celda según el modo 'edges'
              let cellAlign = 'center';
              let cellWidth = '';

              if (align === 'edges') {
                if (colIndex === 0) {
                  cellAlign = 'left';
                } else if (colIndex === totalImagenes - 1) {
                  cellAlign = 'right';
                } else {
                  cellAlign = 'center';
                }
                cellWidth = ' width="33.33%"';
              }

              const imgTag = `<img src="${!isEnvio ? base64 : (index + 1 + '_' + (colIndex + 1))}" width="${width}" style="max-width:100%; width:100%; height:auto; display:block; border:0;" alt="Imagen" />`;
              const linkTag = `<a href="${isEnvio ? `replace_uri_${index + 1}_${colIndex + 1}&link=${encodeURIComponent(link)}&index=${index + 1}_${colIndex + 1}` : link}" target="_blank" style="display:block; text-decoration:none;">${imgTag}</a>`;

              filaHTML += `
                        <td align="${cellAlign}" valign="top"${cellWidth} style="padding-top:${imgMT}px; padding-bottom:${imgMB}px; padding-left:${imgML}px; padding-right:${imgMR}px;">
                          ${linkTag}
                        </td>
              `;
            });

            filaHTML += `
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            `;
            itemsHTML += filaHTML;
          }


        });

        // -----------------------------
        // 📌 PLANTILLA HTML COMPLETA
        // -----------------------------
        const containerWidth = esCorreoNormal ? '100%' : '600';
        const containerMaxWidth = esCorreoNormal ? '100%' : '600px';
        const contentPadding = esCorreoNormal ? '0' : '20px';

        return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${asunto}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#ffffff;">
        <!-- Wrapper Table -->
        <table border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color:#ffffff;">
          <tr>
            <td align="center" style="padding:20px 0;">
              
              <!-- Main Container -->
              <table border="0" cellspacing="0" cellpadding="0" width="${containerWidth}" style="background-color:#ffffff; max-width:${containerMaxWidth};" class="wrapper">
                <tr>
                  <td align="center" style="padding:0;">

                    <!-- Content Table -->
                    <table border="0" cellspacing="0" cellpadding="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:${contentPadding}; color:#333333; font-size:14px; font-family:Arial, sans-serif; line-height:1.5;">

                          ${!isEnvio ? `
                            <!-- CONTACTOS -->
                            <table border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom:10px;">
                              <tr>
                                <td style="color:#555555; font-size:14px; font-family:Arial, sans-serif;">
                                  <strong>Para:</strong> ${contactosMostrar}
                                </td>
                              </tr>
                            </table>

                            <!-- ASUNTO -->
                            <table border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom:20px;">
                              <tr>
                                <td style="color:#222222; font-size:20px; font-family:Arial, sans-serif; font-weight:bold;">
                                  ${asunto}
                                </td>
                              </tr>
                            </table>
                          ` : ""}

                          <!-- MENSAJE PRINCIPAL -->
                          ${tieneMensaje ? `<table border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom:20px;">
                            <tr>
                              <td style="font-size:15px; line-height:1.5; color:#333333; font-family:Arial, sans-serif;">
                                ${mensajeHTML}
                              </td>
                            </tr>
                          </table>` : ''}

                          <!-- ITEMS (IMÁGENES) -->
                          ${itemsHTML}

                          <!-- TRACKING PIXEL -->
                          <table border="0" cellspacing="0" cellpadding="0" width="100%">
                            <tr>
                              <td>
                                <img src="mailing_tracking" width="1" height="1" style="display:block; border:0;" alt="" />
                              </td>
                            </tr>
                          </table>

                          <!-- FOOTER -->
                          <table border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-top:30px;">
                            <tr>
                              <td align="center" style="font-size:12px; color:#777777; line-height:1.5; font-family:Helvetica, Arial, sans-serif;">
                                
                                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                                  
                                  <!-- Línea separadora -->
                                  <tr>
                                    <td style="padding:15px 0;">
                                      <table border="0" cellspacing="0" cellpadding="0" width="100%">
                                        <tr>
                                          <td style="border-top:1px solid #dddddd;"></td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  
                                  <tr>
                                    <td align="center" style="padding-bottom:8px; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#777777;">
                                      Este correo electrónico fue enviado a <strong>mailing@mailing</strong>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td align="center" style="padding-bottom:8px; font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#777777; word-wrap:break-word;">
                                      Caro &amp; Asociados &middot; Av. Víctor Andrés Belaunde N°370 San Isidro &middot; Lima 27, Perú &middot; Lima 15000
                                    </td>
                                  </tr>
                                  <tr>
                                    <td align="center" style="padding-top:5px; padding-bottom:15px; font-family:Helvetica, Arial, sans-serif;">
                                      <a href="unsubscribe_link" style="color:#555555; text-decoration:underline; font-size:12px; font-family:Helvetica, Arial, sans-serif;" target="_blank">
                                        <strong>Cancelar suscripción</strong>
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td align="center" style="padding-top:10px;">
                                      <a href="https://ccfirma.com/" target="_blank">
                                        <img src="https://aicompliance.es/wp-content/uploads/2024/06/B6.png" alt="Logo" width="120" style="max-width:120px; height:auto; display:block; margin:0 auto; border:0;" />
                                      </a>
                                    </td>
                                  </tr>
                                </table>

                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
      },
      // ================== ENVIAR
      sendMailing: (htmlContent, plantilla = 1) => {
        const asunto = $(`#asunto1`).val().trim();
        const fechaProgramada = $('#fechaProgramada').val();
        const mensajeQuil = Quill.find(document.querySelector('#mensaje1'));
        const contactosUnicos = $(`#contactos1`).multipleSelect('getSelects') || [];
        const contactos = [...new Set(contactosUnicos)];

        // Obtener datos completos de contactos seleccionados
        const contactosData = [];
        for (const rubroKey in contactosPorRubro) {
          const r = contactosPorRubro[rubroKey];
          r.contactos.forEach(c => {
            if (contactos.includes(c.eml)) {
              contactosData.push({
                V_EMAIL: c.eml,
                V_NOMBRE: c.nmbrs,
                V_APELLIDO: c.apllds,
                V_CLIENTE: c.cliente || '',
                V_NOMBRES: c.nmbrs + ' ' + c.apllds,
                V_GDSEXO: c.gdsexo || '',
              });
            }
          });
        }

        if (!$('#GDCRROENV').val()) return swalFire.warning('Campo obligatorio', 'El correo de envío es obligatorio');
        if (!$("#PLACEHOLDER").val()) return swalFire.warning('Campo obligatorio', 'El placeholder es obligatorio');
        if (!asunto) return swalFire.warning('Campo obligatorio', 'El asunto es obligatorio');
        if (!contactos.length) return swalFire.warning('Campo obligatorio', 'Selecciona al menos un contacto');

        // Validar que exista al menos una imagen
        const items = $('#itemsContainer .itemElemento');
        let tieneImagenes = false;

        items.each((i, el) => {
          const tipo = $(el).data("tipo");
          if (tipo === "imagen") {
            const file = $(el).find('.itemImagen')[0].files[0];
            if (file) tieneImagenes = true;
          } else if (tipo === "imagen-fila") {
            $(el).find('.imagen-item').each((colIndex, imgItem) => {
              const file = $(imgItem).find('.itemImagen')[0].files[0];
              if (file) tieneImagenes = true;
            });
          }
        });

        if (!tieneImagenes) return swal('Atención', 'Debes agregar al menos una imagen para enviar el correo', 'warning');

        const formData = new FormData();
        formData.append('ASNTO', asunto);
        formData.append('IDMRCA', func.IDEMPRESA());
        contactos.forEach((c, index) =>
          formData.append("CNTCTS[" + index + "]", c)
        ); 
        formData.append('MSJE', htmlContent);
        formData.append('MENSAJE', mensajeQuil.root.innerHTML);
        formData.append('FPROGRAMADA', fechaProgramada || '');
        formData.append('CORREOSEND', $('#GDCRROENV').val() || '');
        formData.append('PLACEHOLDER', $("#PLACEHOLDER").val() || '');

        contactosData.forEach((c, index) => {
          formData.append(`CONTACTOS_DATA[${index}].V_EMAIL`, c.V_EMAIL);
          formData.append(`CONTACTOS_DATA[${index}].V_NOMBRE`, c.V_NOMBRE);
          formData.append(`CONTACTOS_DATA[${index}].V_APELLIDO`, c.V_APELLIDO);
          formData.append(`CONTACTOS_DATA[${index}].V_CLIENTE`, c.V_CLIENTE);
          formData.append(`CONTACTOS_DATA[${index}].V_NOMBRES`, c.V_NOMBRES);
          formData.append(`CONTACTOS_DATA[${index}].V_GDSEXO`, c.V_GDSEXO);
        });

        let dataIndex = 0;
        items.each((i, el) => {
          const tipo = $(el).data("tipo");

          if (tipo === "imagen") {
            const file = $(el).find('.itemImagen')[0].files[0];
            const link = $(el).find('.itemEnlace').val();
            if (file) {
              formData.append(`DATA[${dataIndex}].TYPE`, 'imagen');
              formData.append(`DATA[${dataIndex}].INDEX`, i + 1);
              formData.append(`DATA[${dataIndex}].URL`, link || '');
              formData.append(`DATA[${dataIndex}].FILE`, file);
              dataIndex++;
            }
          }

          if (tipo === "imagen-fila") {
            const imagenes = $(el).find('.imagen-item');
            imagenes.each((colIndex, imgItem) => {
              const file = $(imgItem).find('.itemImagen')[0].files[0];
              const link = $(imgItem).find('.itemEnlace').val();
              if (file) {
                formData.append(`DATA[${dataIndex}].TYPE`, 'imagen-fila');
                formData.append(`DATA[${dataIndex}].INDEX`, `${i + 1}_${colIndex + 1}`);
                formData.append(`DATA[${dataIndex}].URL`, link || '');
                formData.append(`DATA[${dataIndex}].FILE`, file);
                dataIndex++;
              }
            });
          }
        });

        swalFire.cargando(['Espere un momento', 'Estamos enviando el correo']);
        $.ajax({
          url: uisApis.API + '=SendMailing',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: function (response) {
            if (response?.success) {
              swalFire.success(response?.message || 'Correo enviado correctamente');

              return;
            }
            swalFire.error(response.message);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al enviar el correo')
        });
      },
      obtenerContactos: async (IDMRCA) => {
        await $.ajax({
          url: uisApis.API + '=Buscar&IDMRCA=' + IDMRCA + '&CESTDO=A&length=10000&start=0',
          type: 'GET',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          success: function (response) {
            let contactos = response?.data || [];

            // Filtramos los rubros
            let GDRBROC_GROUPS = grupoDatos.filter(gd => gd.gdpdre === 'GDRBROC');

            // Objeto para agrupar contactos por rubro
            contactosPorRubro = {};

            contactos.forEach(c => {
              if (c.gdrbroc) {
                c.gdrbroc.split(',').forEach(g => {
                  let rubroVal = g.trim();
                  if (rubroVal) {
                    let rubro = GDRBROC_GROUPS.find(gr => gr.vlR1 === rubroVal);
                    let rubroNombre = rubro ? rubro.dtlle : 'Desconocido';

                    if (!contactosPorRubro[rubroVal]) {
                      contactosPorRubro[rubroVal] = {
                        nombre: rubroNombre,
                        contactos: []
                      };
                    }
                    contactosPorRubro[rubroVal].contactos.push(c);
                  }
                });
              } else {
                // Contactos sin rubro → grupo único "Sin Grupo"
                const keySinGrupo = 'sin_grupo';
                if (!contactosPorRubro[keySinGrupo]) {
                  contactosPorRubro[keySinGrupo] = {
                    nombre: 'Sin Grupo',
                    contactos: []
                  };
                }
                contactosPorRubro[keySinGrupo].contactos.push(c);
              }
            });

            // y un grupo único "Sin Grupo" para los que no tienen rubro.
          },
          error: (jqXHR, textStatus, errorThrown) => console.error('Ocurrió un error al obtener los contactos')
        });
      },
      actualizarContactosSelect: async () => {
        // Actualizar solo el select de contactos sin re-renderizar toda la plantilla
        let $select = $('#contactos1');
        if ($select.length === 0) return;

        // Obtener contactos actualizados desde el servidor
        await mailCaroCrud.eventos.obtenerContactos(func.IDEMPRESA());
        let dataMS = [];

        for (const rubroKey in contactosPorRubro) {
          let r = contactosPorRubro[rubroKey];
          dataMS.push({
            type: 'optgroup',
            label: r.nombre,
            children: r.contactos
              .map(c => {
                const clienteText = c?.cliente ? ` (${c.cliente})` : '';
                return {
                  text: `${c.nmbrs} ${c.apllds} ${clienteText}`,
                  cliente: c.cliente,
                  gdsexo: c.gdsexo,
                  value: c.eml
                };
              })
              .filter(x => x.value)
          });
        }

        // Destruir y recrear el multipleSelect
        $select.multipleSelect('destroy');
        $select.multipleSelect({
          data: dataMS,
          width: '100%',
          placeholder: 'Selecciona contactos',
          selectAll: true,
          filter: true,
          filterGroup: true,
          filterPlaceholder: 'Buscar contactos...',
          textTemplate: function(data) {
            return data.text;
          },
          labelTemplate: function(data) {
            return data.text;
          }
        });

        $('#contactos1').siblings('div.ms-parent').css('padding', '0');

        // filtrar grupo dato con GDCRROENV y llenar select
        let correosEnvio = grupoDatos.filter(gd => gd.gdpdre === 'GDCRROENV');
        let $selectCorreoEnvio = $('#GDCRROENV');
        $selectCorreoEnvio.empty();
        $selectCorreoEnvio.append('<option value="">Seleccione un correo</option>');
        correosEnvio.forEach(correo => {
          $selectCorreoEnvio.append(`<option value="${correo.vlR1}">${correo.dtlle}</option>`);
        });
      }
    }
  };

  const globalCrud = {
    init: async () => {
      await globalCrud.eventos.selects();
    },
    eventos: {
      selects: async () => {
        await Promise.all([
          $.ajax({
            url: uisApis.GD + '=ObtenerAll',
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET',
            data: {
              GDTOS: 'GDRBROC,GDCRGOC,GDSEXO,GDCRROENV'
            }
          }),
          $.ajax({
            url: `${uisApis.MR}=Obtener&start=0&length=100`,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET'
          })
        ])
          .then(([responseGD, responseMR]) => {
            if (responseGD?.data) {
              grupoDatos = responseGD.data;
              let selects = document.querySelectorAll('#EditContacto select, #AddContacto select');
              selects = Array.from(selects).filter(select => select.getAttribute('name') != 'CESTDO');

              selects.forEach(select => {
                const name = select.getAttribute('name');
                const data = responseGD.data.filter(d => d.gdpdre == name);
                if (data.length > 0) {
                  if (!select.classList.contains('select2')) {
                    select.innerHTML = `<option value="">-- Seleccione --</option>`;
                  }
                  data.forEach(d => {
                    select.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
                  });
                }
              });
            }

            let selectsMR = document.querySelectorAll('#AddContacto #IDMRCA, #EditContacto #IDMRCA');
            marcasGD = responseMR.data;
            selectsMR.forEach(select => {
              select.innerHTML = '';
              responseMR.data.forEach(d => {
                select.innerHTML += `<option value="${d.id}">${d.mrca}</option>`;
              });
            });
          })
          .catch(error => swalFire.error('Ocurrió un error al cargar los módulos y marcas'));
      }
    }
  };

  return {
    init: async () => {
      await func.select2Multiple();
      await globalCrud.init();
      contactosCrud.globales();
      mailCaroCrud.globales();
      mailingsCrud.globales();
      contactosCrud.init();

      var myTabs = document.querySelectorAll('.erp-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');
          if (tabPane === '#navs-email') {
            mailCaroCrud.init();
          }

          if (tabPane === '#navs-add-contacto') {
            contactosCrud.eventos.TABLACONTACTOS();
          }

          if (tabPane === '#navs-email-send') {
            mailingsCrud.init();
          }
        });
      });

      $("#condominio-actual_select").on("change", async function () {
        redirect(1, "navs-add-contacto", 1);
      })
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
