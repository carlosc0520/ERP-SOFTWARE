/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    let IDEMPRSA = null;
    const uisApis = {
        CLIENTES: '/Comercial/Gestion/Index?handler=Clients',
        EQUIPOS: '/Comercial/Gestion/Index?handler=Equipment',
        ABOGADOS: '/Legal/Abogados/Index?handler=',
        CONTACTOS: '/Comercial/Gestion/Index?handler=Contacts',
        GRUPODATOS: '/Seguridad/GrupoDato/Index?handler=',
        CASOS: '/Comercial/Casos/Index?handler=Cases',
    };

    let SELECTS_LIST = {};

    // * VARIABLES
    let navsCasos = 'navs-casos';
    let casosTable = 'casosTable';
    let CcasosTable = null;

    let comentariosTable = 'casoComentarioTable';
    let CcomentariosTable = null;

    let casoHonorarioTable = 'casoHonorarioTable';
    let CcasoHonorarioTable = null;

    let usersList = [];

    // * TABLAS
    const casosCrud = {
        init: () => {
            $(`#${navsCasos}-filtros input, #${navsCasos}-filtros select`).val('');
            casosCrud.eventos.TABLE();
        },
        globales: () => {
            // * MODALES
            $("#modalAddCaso").on('shown.bs.modal', function () {
                configFormVal("AddCaso",
                    casosCrud.validaciones.INSERT, () => casosCrud.eventos.INSERT());
            });

            $("#modalEditCaso").on('shown.bs.modal', function () {
                // Mostrar u ocultar botón de guardar según el modo
                if (casosCrud.variables.modoSoloLectura) {
                    $('#btnEditCaso').hide();
                    // Cambiar título del modal
                    $('#modalEditCaso .text-center h3').text('Ver Caso');
                    // Bloquear todos los campos del formulario
                    $('#EditCaso input, #EditCaso textarea, #EditCaso select').prop('disabled', true);
                    $('#EditCaso .select2').addClass('disabled');
                    // Deshabilitar Tagify si existe
                    const tagifyElement = $('#EditCaso #ABOGDOS')[0];
                    if (tagifyElement && tagifyElement.__tagify) {
                        tagifyElement.__tagify.setReadonly(true);
                    }
                } else {
                    $('#btnEditCaso').show();
                    // Cambiar título del modal
                    $('#modalEditCaso .text-center h3').text('Editar Caso');
                    // Habilitar todos los campos del formulario
                    $('#EditCaso input, #EditCaso textarea, #EditCaso select').prop('disabled', false);
                    $('#EditCaso .select2').removeClass('disabled');
                    // Habilitar Tagify si existe
                    const tagifyElement = $('#EditCaso #ABOGDOS')[0];
                    if (tagifyElement && tagifyElement.__tagify) {
                        tagifyElement.__tagify.setReadonly(false);
                    }
                }

                configFormVal('EditCaso', casosCrud.validaciones.EDITAR, () => casosCrud.eventos.EDITAR());
                func.actualizarForm('EditCaso', { ...casosCrud.variables.rowEdit });

                // Setear abogados con verificación de Tagify
                const tagifyElement = $('#EditCaso #ABOGDOS')[0];
                if (tagifyElement && tagifyElement.__tagify) {
                    // Esperar un momento para asegurar que Tagify esté completamente renderizado
                    setTimeout(() => {
                        try {
                            const tagifyInstance = tagifyElement.__tagify;

                            tagifyInstance.removeAllTags();

                            let abogadosIds = (casosCrud.variables.rowEdit.abogdos || '').split(',').filter(id => id && id.trim() !== '');

                            if (abogadosIds.length > 0) {
                                // Primero actualizar el whitelist con usersList actual
                                tagifyInstance.whitelist = [...usersList];

                                let abogadosToAdd = [];
                                abogadosIds.forEach(id => {
                                    let found = usersList.find(u => u.value.toString() === id.toString());
                                    if (found) {
                                        abogadosToAdd.push(found);
                                    } else {
                                        console.warn('Abogado no encontrado ID:', id);
                                        let placeholder = {
                                            value: id.toString(),
                                            name: `Usuario ID ${id} (No encontrado)`,
                                            avatar: ''
                                        };
                                        tagifyInstance.whitelist.push(placeholder);
                                        abogadosToAdd.push(placeholder);
                                    }
                                });

                                if (abogadosToAdd.length > 0) {
                                    // Desactivar enforceWhitelist temporalmente
                                    const originalEnforce = tagifyInstance.settings.enforceWhitelist;
                                    const originalSkipInvalid = tagifyInstance.settings.skipInvalid;
                                    tagifyInstance.settings.enforceWhitelist = false;
                                    tagifyInstance.settings.skipInvalid = false;

                                    // Agregar los tags
                                    tagifyInstance.addTags(abogadosToAdd);


                                    // Restaurar configuración
                                    tagifyInstance.settings.enforceWhitelist = originalEnforce;
                                    tagifyInstance.settings.skipInvalid = originalSkipInvalid;
                                }
                            }
                        } catch (error) {
                            console.error('Error al setear tags de abogados:', error, error.stack);
                        }
                    }, 150);
                }
            });

            $("#modalAddCaso").on('hidden.bs.modal', function () {
                func.selects2("navs-casos-filtros");
            });

            // * BOTONES
            $(`#${navsCasos}-filtros-buscar`).on('click', () => casosCrud.eventos.TABLE());

            $(`#${navsCasos}-filtros-agregar`).on('click', (E) => {
                $('#modalAddCaso').modal('show');
            });

            $(`#${navsCasos}-filtros-limpiar`).on('click', () => {
                $(`#${navsCasos}-filtros input, #${navsCasos}-filtros select`).val('');
                $(`#${navsCasos}-filtros select`).trigger('change');
                casosCrud.eventos.TABLE();
            });

            $(`#${navsCasos}-filtros-exportar`).on('click', () => {
                // consultar todos los registros segun filtros
                swalFire.cargando(['Esperando...', 'Consultando registros para exportar. Esto puede tardar unos minutos.']);

                // Procesar ABOGDOS igual que en la tabla
                let abogadosSelected = $(`#${navsCasos}-filtros #ABOGDOS`).val();
                try {
                    abogadosSelected = JSON.parse(abogadosSelected);
                } catch (e) {
                    abogadosSelected = [];
                }
                let ABOGDOS = abogadosSelected.map(a => a.value).filter(v => v && v.trim() !== '').join(',');

                let urlQuerry = uisApis.CASOS + 'All&start=0&length=10000&IDEMPRSA=' + IDEMPRSA + '' +
                    '&CASO=' + $(`#${navsCasos}-filtros #CASO`).val() +
                    '&IDCLNTE=' + $(`#${navsCasos}-filtros #IDCLNTE`).val() +
                    '&GDSMFROCSO=' + $(`#${navsCasos}-filtros #GDSMFROCSO`).val() +
                    '&GDESTDOCSO=' + $(`#${navsCasos}-filtros #GDESTDOCSO`).val() +
                    '&FINI=' + $(`#${navsCasos}-filtros #FINI`).val() +
                    '&FFIN=' + $(`#${navsCasos}-filtros #FFIN`).val() +
                    '&ABOGDOS=' + ABOGDOS +
                    '&CESTDO=' + func.obtenerCESTDO(casosTable);

                $.ajax({
                    url: urlQuerry,
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                    },
                    success: function (response) {
                        swalFire.cerrar();
                        if (response.data && response.data.length > 0) {
                            casosCrud.eventos.EXPORTAR._EXCEL(response.data);
                        } else {
                            swalFire.info('No se encontraron registros para exportar con los filtros seleccionados.');
                        }
                    },
                    error: function (xhr, status, error) {
                        swalFire.cerrar();
                        swalFire.error('Error al consultar los registros para exportar: ' + error);
                    }
                });

            });

            // * TABLA CASOS - CLICK EN FILA (solo lectura)
            $(`#${casosTable} tbody`).on('click', 'tr', async function (e) {
                // Ignorar si se hizo click en botones o elementos interactivos
                if ($(e.target).closest('button, a, .edit-row, .delete-row, .excel-row, .auditoria-row').length > 0) {
                    return;
                }

                let data = $(`#${casosTable}`).DataTable().row(this).data();
                if (!data || !data.id) return;

                casosCrud.variables.rowEdit = { ...data, abogdos: data.abogdos || '' };
                casosCrud.variables.modoSoloLectura = true; // Indicar que viene de click en fila
                $('#modalEditCaso').modal('show');
            });

            // * TABLA CASOS - EDITAR (modo edición)
            $(`#${casosTable}`).on('click', '.edit-row', async function (e) {
                e.stopPropagation(); // Prevenir que se dispare el evento de la fila
                let data = $(`#${casosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                casosCrud.variables.rowEdit = { ...data, abogdos: data.abogdos || '' };
                casosCrud.variables.modoSoloLectura = false; // Indicar que viene del botón editar
                // NO setear los tags aquí, se hará en el evento shown.bs.modal
                $('#modalEditCaso').modal('show');
            });

            $(`#${navsCasos}-filtros-agregar-masivo`).on('click', (e) => {
                e.preventDefault();
                const html = `
                    <label for="excelFileInputCasos" class="custom-file-upload" style="display:inline-block;padding:8px 18px;border:1px solid #ccc;border-radius:6px;cursor:pointer;font-weight:500;margin-bottom:8px;">
                        <i class="bx bx-upload"></i> Seleccionar archivo Excel
                    </label>
                    <input id="excelFileInputCasos" type="file" accept=".xlsx,.xls" style="display:none;" />
                    <div class="file-name-preview" id="fileNamePreviewCasos" style="margin-top:4px;font-size:0.95em;color:#888;">Ningún archivo seleccionado</div>
                    <small style="color:#888;">Solo se permiten archivos Excel</small>
                `;

                Swal.fire({
                    title: 'Importar casos',
                    html: html,
                    showCancelButton: true,
                    confirmButtonText: 'Subir',
                    cancelButtonText: 'Cancelar',
                    focusConfirm: false,
                    didOpen: () => {
                        const fileInput = Swal.getPopup().querySelector('#excelFileInputCasos');
                        const fileNamePreview = Swal.getPopup().querySelector('#fileNamePreviewCasos');
                        const customLabel = Swal.getPopup().querySelector('.custom-file-upload');
                        // Evitar doble apertura: quitar el foco después del click
                        customLabel.addEventListener('click', function (ev) {
                            fileInput.click();
                            // Quitar el foco del label para evitar doble trigger
                            customLabel.blur && customLabel.blur();
                            ev.preventDefault();
                            return false;
                        });
                        fileInput.addEventListener('change', function () {
                            if (fileInput.files && fileInput.files.length > 0) {
                                fileNamePreview.textContent = fileInput.files[0].name;
                            } else {
                                fileNamePreview.textContent = 'Ningún archivo seleccionado';
                            }
                        });
                    },
                    preConfirm: () => {
                        const fileInput = Swal.getPopup().querySelector('#excelFileInputCasos');
                        if (!fileInput.files || fileInput.files.length === 0) {
                            Swal.showValidationMessage('Debe seleccionar un archivo Excel');
                            return false;
                        }
                        const file = fileInput.files[0];
                        const allowedTypes = [
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'application/vnd.ms-excel'
                        ];
                        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
                            Swal.showValidationMessage('El archivo debe ser un Excel (.xlsx, .xls)');
                            return false;
                        }
                        return file;
                    }
                }).then(async (result) => {
                    if (result.isConfirmed && result.value) {
                        const file = result.value;
                        try {
                            const reader = new FileReader();
                            reader.onload = async function (e) {
                                if (typeof ExcelJS === 'undefined') {
                                    swalFire.error('No se encontró la librería ExcelJS.');
                                    return;
                                }
                                const buffer = e.target.result;
                                const workbook = new ExcelJS.Workbook();
                                await workbook.xlsx.load(buffer);
                                const worksheet = workbook.worksheets[0];
                                if (!worksheet) {
                                    swalFire.warning('El archivo Excel no contiene hojas.');
                                    return;
                                }
                                // Convertir filas a objetos usando la cabecera
                                let rows = [];
                                const headerRow = worksheet.getRow(1);
                                const headers = headerRow.values.slice(1); // El primer valor es null

                                worksheet.eachRow((row, rowNumber) => {
                                    if (rowNumber === 1) return; // Saltar cabecera
                                    const obj = {};
                                    headers.forEach((header, i) => {
                                        let cellValue = row.getCell(i + 1).value;
                                        if (cellValue && typeof cellValue === 'object' && cellValue.text) {
                                            obj[header] = cellValue.text;
                                        } else if (cellValue == null) {
                                            obj[header] = '';
                                        } else {
                                            obj[header] = cellValue;
                                        }
                                    });
                                    rows.push(obj);
                                });

                                if (!rows.length) {
                                    swalFire.warning('El archivo Excel no contiene datos.');
                                    return;
                                }

                                casosCrud.eventos.EXPORTAR._IMPORTAR_CASOS(rows);
                            };
                            reader.onerror = function () {
                                swalFire.error('Error al leer el archivo Excel.');
                            };
                            reader.readAsArrayBuffer(file);
                        } catch (err) {
                            swalFire.error('Error al procesar el archivo Excel.');
                        }
                    }
                });
            })

            // * exportar PDF - EXCEL
            $(`#${casosTable}`).on('click', '.excel-row', function () {
                let data = $(`#${casosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                // Crear copia profunda del objeto para no alterar el original
                casosCrud.eventos.EXPORTAR._EXCEL([JSON.parse(JSON.stringify(data))]);
            })

            $(`#${casosTable}`).on('click', '.delete-row', function () {
                let data = $(`#${casosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                swalFire.confirmar('¿Está seguro de eliminar el caso?', {
                    1: () => casosCrud.eventos.DELETE(data.id)
                });
            });


        },
        variables: {
            rowEdit: {},
            rowEditComentario: {},
            modoSoloLectura: false
        },
        eventos: {
            TABLE: () => {
                if (!CcasosTable) {
                    CcasosTable = $(`#${casosTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.CASOS + 'All',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.IDEMPRSA = IDEMPRSA;
                                d.CASO = $(`#${navsCasos}-filtros #CASO`).val();
                                d.IDCLNTE = $(`#${navsCasos}-filtros #IDCLNTE`).val();
                                d.GDSMFROCSO = $(`#${navsCasos}-filtros #GDSMFROCSO`).val();
                                d.GDESTDOCSO = $(`#${navsCasos}-filtros #GDESTDOCSO`).val();
                                let abogadosSelected = $(`#${navsCasos}-filtros #ABOGDOS`).val();
                                try {
                                    abogadosSelected = JSON.parse(abogadosSelected);
                                } catch (e) {
                                    abogadosSelected = [];
                                }
                                d.FINI = $(`#${navsCasos}-filtros #FINI`).val();
                                d.FFIN = $(`#${navsCasos}-filtros #FFIN`).val();
                                d.ABOGDOS = abogadosSelected.map(a => a.value).filter(v => v && v.trim() !== '').join(',');
                                d.CESTDO = func.obtenerCESTDO(casosTable);
                            }
                        },
                        columns: [
                            {
                                data: null,
                                title: '',
                                orderable: false,
                                className: 'text-center',
                                render: function (data, type, row, meta) {
                                    console.log(data)
                                    return `
                                        <div style="display:flex;align-items:center;justify-content:center;gap:4px;">
                                            <button class='btn btn-sm btn-icon auditoria-row' title='Ver auditoría' tabindex="-1"><i class='bx bx-chevron-right'></i></button>
                                            <span style="min-width:22px;display:inline-block;">${data.rn || meta.row + 1}</span>
                                        </div>
                                    `;
                                }
                            },
                            { data: 'didclnte', title: 'Cliente' },
                            { data: 'caso', title: 'Caso' },
                            { data: 'dgdareacso', title: 'Área' },
                            { data: 'dgdestdocso', title: 'Estado' },
                            {
                                data: null, title: 'Semaforo',
                                className: 'text-center',
                                render: data => {
                                    let color = '#FFFFFF';
                                    switch (data.gdsmfrocso) {
                                        case '1':
                                            color = '#C6E0B4';
                                            break;
                                        case '2':
                                            color = '#FFFF00';
                                            break;
                                        case '3':
                                            color = '#FFC000';
                                            break;
                                        case '4':
                                            color = '#FF9999';
                                            break;
                                    }
                                    return `<span style="padding:4px 8px;border-radius:4px;background-color:${color};font-weight:500;">${data.dgdsmfrocso || ''}</span>`;
                                }
                            },
                            {
                                data: null,
                                title: '',
                                width: '120px',
                                className: 'text-center',
                                orderable: false,
                                render: data => {
                                    return `<div class="d-flex justify-content-center align-items-center gap-1">
                                            <button name="EDITAR" class="btn btn-sm btn-icon edit-row" title="Editar"><i class="bx bx-edit"></i></button>
                                            <button name="ELIMINAR" class="btn btn-sm btn-icon delete-row" title="Eliminar"><i class="bx bx-trash"></i></button>
                                        </div>`;
                                }
                            }
                        ],
                        initComplete: function (settings, json) {
                            $(`#${casosTable}_filter`).hide();
                        },
                        drawCallback: function (settings) {
                            $(`#${casosTable}_filter`).hide();
                            $(`#${casosTable}_wrapper > div:first-child`).removeClass('py-4');
                        },
                        columnDefs: [],
                        buttons: (() => {
                            return [];
                        })()
                    });
                } else {
                    CcasosTable.ajax.reload();
                }
            },
            INSERT: () => {
                let formData = new FormData();
                formData.append('IDEMPRSA', IDEMPRSA);
                formData.append('CASO', $('#AddCaso #CASO').val());
                formData.append('IDCLNTE', $('#AddCaso #IDCLNTE').val());
                formData.append('GDAREACSO', $('#AddCaso #GDAREACSO').val());
                let abogdosRaw = $('#AddCaso #ABOGDOS').val();
                let abogadosSplit = [];
                if (abogdosRaw && abogdosRaw.trim() !== '') {
                    try {
                        const parsed = JSON.parse(abogdosRaw);
                        abogadosSplit = Array.isArray(parsed) ? parsed : [];
                    } catch (e) {
                        console.warn('ABOGDOS no es JSON válido', e);
                        abogadosSplit = [];
                    }
                }
                let ABOGDOS = abogadosSplit.map(abogado => abogado.value).filter(Boolean).join(',');
                formData.append('ABOGDOS', ABOGDOS);
                formData.append('HNRRIO', $('#AddCaso #HNRRIO').val());

                // Normalizar valores decimales (reemplazar punto por coma para cultura española)
                const normalizarDecimal = (valor) => {
                    if (!valor || valor.trim() === '') return '';
                    // Reemplazar punto por coma (formato español)
                    return valor.replace(/\./g, ',');
                };

                formData.append('HINICIAL', normalizarDecimal($('#AddCaso #HINICIAL').val()));
                formData.append('HEXITO', normalizarDecimal($('#AddCaso #HEXITO').val()));
                formData.append('HUNICO', normalizarDecimal($('#AddCaso #HUNICO').val()));
                formData.append('HAUDIENCIA', normalizarDecimal($('#AddCaso #HAUDIENCIA').val()));
                formData.append('HDIA', normalizarDecimal($('#AddCaso #HDIA').val()));
                formData.append('HHORA', normalizarDecimal($('#AddCaso #HHORA').val()));
                formData.append('HMENSUAL', normalizarDecimal($('#AddCaso #HMENSUAL').val()));
                formData.append('HCERTIFICADOS', normalizarDecimal($('#AddCaso #HCERTIFICADOS').val()));
                formData.append('COMNTRIO', $('#AddCaso #COMNTRIO').val());
                formData.append('FENVIO', $('#AddCaso #FENVIO').val());
                formData.append('FULTIMOSEG', $('#AddCaso #FULTIMOSEG').val());
                formData.append('GDESTDOCSO', $('#AddCaso #GDESTDOCSO').val());
                formData.append('GDSMFROCSO', $('#AddCaso #GDSMFROCSO').val());



                swalFire.cargando(['Espere un momento', 'Estamos guardando el caso']);
                $.ajax({
                    url: uisApis.CASOS + 'Add',
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
                            swalFire.success('Caso agregado correctamente', '', {
                                1: () => {
                                    $('#modalAddCaso').modal('hide');
                                    CcasosTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al agregar el caso')
                });

            },
            EDITAR: () => {
                let formData = new FormData();
                formData.append('ID', casosCrud.variables.rowEdit.id);
                formData.append('CASO', $('#EditCaso #CASO').val());
                formData.append('IDCLNTE', $('#EditCaso #IDCLNTE').val());
                formData.append('GDAREACSO', $('#EditCaso #GDAREACSO').val());
                let abogadosRaw = $('#EditCaso #ABOGDOS').val();
                let abogadosSplit = [];

                if (abogadosRaw && abogadosRaw.trim() !== '') {
                    try {
                        abogadosSplit = JSON.parse(abogadosRaw);
                    } catch (e) {
                        console.error('ABOGDOS no es JSON válido', e);
                        abogadosSplit = [];
                    }
                }
                let ABOGDOS = abogadosSplit.map(abogado => abogado.value).join(',');
                formData.append('ABOGDOS', ABOGDOS);
                formData.append('HNRRIO', $('#EditCaso #HNRRIO').val());

                // Normalizar valores decimales (reemplazar punto por coma para cultura española)
                const normalizarDecimal = (valor) => {
                    if (!valor || valor.trim() === '') return '';
                    // Reemplazar punto por coma (formato español)
                    return valor.replace(/\./g, ',');
                };

                formData.append('HINICIAL', normalizarDecimal($('#EditCaso #HINICIAL').val()));
                formData.append('HEXITO', normalizarDecimal($('#EditCaso #HEXITO').val()));
                formData.append('HUNICO', normalizarDecimal($('#EditCaso #HUNICO').val()));
                formData.append('HAUDIENCIA', normalizarDecimal($('#EditCaso #HAUDIENCIA').val()));
                formData.append('HDIA', normalizarDecimal($('#EditCaso #HDIA').val()));
                formData.append('HHORA', normalizarDecimal($('#EditCaso #HHORA').val()));
                formData.append('HMENSUAL', normalizarDecimal($('#EditCaso #HMENSUAL').val()));
                formData.append('HCERTIFICADOS', normalizarDecimal($('#EditCaso #HCERTIFICADOS').val()));
                formData.append('COMNTRIO', $('#EditCaso #COMNTRIO').val());
                formData.append('FENVIO', $('#EditCaso #FENVIO').val());
                formData.append('FULTIMOSEG', $('#EditCaso #FULTIMOSEG').val());
                formData.append('GDESTDOCSO', $('#EditCaso #GDESTDOCSO').val());
                formData.append('GDSMFROCSO', $('#EditCaso #GDSMFROCSO').val());

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el caso']);
                $.ajax({
                    url: uisApis.CASOS + 'Update',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                    },
                    type: 'POST',
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    data: formData,
                    success: function (data) {
                        if (data?.codEstado > 0 && data?.esSatisfactoria) {
                            swalFire.success(data?.message || 'Proceso realizado correctamente', '', {
                                1: () => {
                                    $('#modalEditCaso').modal('hide');
                                    CcasosTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al procesar la solicitud')
                });
            },
            DELETE: (id) => {
                let formData = new FormData();
                formData.append('ID', id);

                swalFire.cargando(['Espere un momento', 'Estamos cambiando el estado del registro']);
                $.ajax({
                    url: uisApis.CASOS + 'Delete',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                    },
                    type: 'POST',
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    data: formData,
                    success: function (data) {
                        if (data?.codEstado > 0 && data?.esSatisfactoria) {
                            swalFire.success(data?.message, '', {
                                1: () => $(`#${casosTable}`).DataTable().ajax.reload()
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al cambiar el estado del registro')
                });
            },
            EXPORTAR: {
                _EXCEL: (arrayData) => {
                    swalFire.cargando(['Generando reporte...', 'Por favor espere mientras se genera el archivo Excel.']);

                    // Agrupar por dideqpo (Equipo)
                    const equiposMap = {};
                    arrayData.forEach(item => {
                        const equipo = 'Casos';
                        if (!equiposMap[equipo]) equiposMap[equipo] = [];
                        equiposMap[equipo].push(item);
                    });

                    // Función para limpiar el nombre de la hoja (reemplaza caracteres inválidos por '-')
                    const sanitizeSheetName = (name) => {
                        // Reemplazar caracteres inválidos: * ? : \ / [ ] por '-'
                        return (name || 'Hoja').replace(/[\*\?\:\\\/\[\]]/g, '-').substring(0, 31) || 'Hoja';
                    };

                    const workbook = new ExcelJS.Workbook();

                    let columnas = ['N°', 'Cliente', 'Caso', 'Área', 'Honorarios', 'Honorario Inicial', 'Honorario de Éxito', 'Honorario Único', 'Honorario por Audiencia', 'Honorario por Día de Viaje', 'Honorario por Hora', 'Honorario Mensual', 'Honorarios por Certificados', 'Comentarios', 'Fecha Envío', 'Último Seguimiento', 'Semáforo', 'Estado'];

                    Object.entries(equiposMap).forEach(([equipo, dataEquipo]) => {
                        let safeSheetName = sanitizeSheetName(equipo);
                        let worksheet = workbook.addWorksheet(safeSheetName);

                        // Agregar título
                        worksheet.mergeCells('B2:S2');
                        const titleCell = worksheet.getCell('B2');
                        titleCell.value = `REPORTE DE CASOS`;
                        titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
                        titleCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF6600' }
                        };
                        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

                        // Establecer cabeceras con estilo (comenzando en B5)
                        for (let i = 0; i < columnas.length; i++) {
                            const cell = worksheet.getCell(`${abecedarioExcel[i + 1]}5`);
                            cell.value = columnas[i];
                            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFF6600' }
                            };
                            cell.alignment = { vertical: 'middle', horizontal: 'center' };
                            cell.border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                        }

                        let fila = 6;
                        dataEquipo.forEach((data, index) => {
                            worksheet.getCell(`B${fila}`).value = index + 1;
                            worksheet.getCell(`C${fila}`).value = data.didclnte || '';
                            worksheet.getCell(`D${fila}`).value = data.caso || '';
                            worksheet.getCell(`E${fila}`).value = data.dgdareacso || '';
                            worksheet.getCell(`F${fila}`).value = data.hnrrio || '';
                            worksheet.getCell(`G${fila}`).value = data.hinicial || '';
                            worksheet.getCell(`H${fila}`).value = data.hexito || '';
                            worksheet.getCell(`I${fila}`).value = data.hunico || '';
                            worksheet.getCell(`J${fila}`).value = data.haudiencia || '';
                            worksheet.getCell(`K${fila}`).value = data.hdia || '';
                            worksheet.getCell(`L${fila}`).value = data.hhora || '';
                            worksheet.getCell(`M${fila}`).value = data.hmensual || '';
                            worksheet.getCell(`N${fila}`).value = data.hcertificados || '';
                            worksheet.getCell(`O${fila}`).value = data.comntrio || '';
                            worksheet.getCell(`P${fila}`).value = data.fenvio ? func.formatFecha(data.fenvio, 'DD-MM-YYYY') : '';
                            worksheet.getCell(`Q${fila}`).value = data.fultimoseg ? func.formatFecha(data.fultimoseg, 'DD-MM-YYYY') : '';
                            worksheet.getCell(`R${fila}`).value = data.dgdsmfrocso || '';
                            worksheet.getCell(`S${fila}`).value = data.dgdestdocso || '';

                            // Pintar celda de semáforo según su valor
                            let colorSemaforo = 'FFFFFFFF'; // Blanco por defecto
                            switch (data.gdsmfrocso) {
                                case '1':
                                    colorSemaforo = 'FFC6E0B4';
                                    break;
                                case '2':
                                    colorSemaforo = 'FFFFFF00';
                                    break;
                                case '3':
                                    colorSemaforo = 'FFFFC000';
                                    break;
                                case '4':
                                    colorSemaforo = 'FFFF9999';
                                    break;
                            }
                            worksheet.getCell(`R${fila}`).fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: colorSemaforo }
                            };
                            worksheet.getCell(`R${fila}`).alignment = { vertical: 'middle', horizontal: 'center' };

                            // Aplicar wrap text y bordes a las celdas de datos
                            for (let i = 0; i < columnas.length; i++) {
                                const cell = worksheet.getCell(`${abecedarioExcel[i + 1]}${fila}`);
                                cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                                cell.border = {
                                    top: { style: 'thin' },
                                    left: { style: 'thin' },
                                    bottom: { style: 'thin' },
                                    right: { style: 'thin' }
                                };
                            }

                            fila++;
                        });

                        // Ajustar anchos de columnas (comenzando desde B)
                        columnas.forEach((columna, index) => {
                            const col = worksheet.getColumn(index + 2);
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
                            if (index === 0) col.width = 5; // N°
                            else if (index === 4) col.width = 40; // Honorarios (descripción)
                            else if (index === 13) col.width = 40; // Comentarios
                            else if (index >= 5 && index <= 12) col.width = 12; // Campos numéricos de honorarios
                            else if (index === 14 || index === 15) col.width = 14; // Fechas
                            else col.width = maxLength < 15 ? 15 : (maxLength > 30 ? 30 : maxLength);
                        });

                        // Aplicar filas alternas de color (estilo de tabla)
                        const lastRow = fila - 1;
                        for (let i = 6; i <= lastRow; i++) {
                            const isEven = (i - 6) % 2 === 0;
                            const fillColor = isEven ? 'FFF5F5F5' : 'FFFFFFFF'; // Gris claro / Blanco

                            for (let j = 0; j < columnas.length; j++) {
                                // Saltar la columna del semáforo (índice 16 = columna R)
                                if (j === 16) continue;
                                
                                const cell = worksheet.getCell(`${abecedarioExcel[j + 1]}${i}`);
                                cell.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: fillColor }
                                };
                            }
                        }
                    });

                    workbook.xlsx.writeBuffer().then((buffer) => {
                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `Reporte_Casos_${func.formatFecha(new Date(), 'YYYY-MM-DD')}.xlsx`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        swalFire.success('Reporte generado correctamente', 'El archivo se ha descargado exitosamente.');
                    }).catch((error) => {
                        console.error('Error al generar el archivo:', error);
                        swalFire.error('Error al generar el reporte', 'No se pudo crear el archivo Excel.');
                    });
                },
                _IMPORTAR_CASOS: async (arrayData) => {
                    console.log('Datos a importar:', arrayData);

                    // Validar y limpiar datos
                    const trimOrEmpty = v => (typeof v === 'string' ? v.trim() : '');

                    // Función para formatear fechas de Excel
                    const formatearFecha = (valor) => {
                        if (!valor) return '';

                        // Si es un objeto Date de JavaScript
                        if (valor instanceof Date) {
                            // Usar métodos UTC para evitar problemas de zona horaria
                            const dia = String(valor.getUTCDate()).padStart(2, '0');
                            const mes = String(valor.getUTCMonth() + 1).padStart(2, '0');
                            const anio = valor.getUTCFullYear();
                            return `${dia}-${mes}-${anio}`;
                        }

                        // Si ya es string, retornar tal cual
                        if (typeof valor === 'string') {
                            return valor.trim();
                        }

                        return '';
                    };

                    // Normalizar valores decimales (reemplazar punto por coma para cultura española)
                    const normalizarDecimal = (valor) => {
                        if (!valor) return '';
                        const strValor = String(valor).trim();
                        if (strValor === '') return '';
                        // Reemplazar punto por coma (formato español)
                        return strValor.replace(/\./g, ',');
                    };

                    const total = arrayData.length;
                    let successCount = 0;
                    let failed = [];
                    let results = [];

                    swalFire.cargando(['Espere un momento', 'Estamos importando los casos...']);

                    // Procesar cada registro de forma secuencial (esperando uno a uno)
                    for (let idx = 0; idx < arrayData.length; idx++) {
                        const row = arrayData[idx];
                        try {
                            let formData = new FormData();
                            formData.append('IDEMPRSA', IDEMPRSA);
                            formData.append('CASO', trimOrEmpty(row["CASO"]));
                            formData.append('IDCLNTE', SELECTS_LIST['CLIENTES'].find(c => trimOrEmpty(c.rznscl) == trimOrEmpty(row["CLIENTE"]))?.id || '');
                            formData.append('NAMECLIENTE', trimOrEmpty(row["CLIENTE"]));
                            formData.append('GDAREACSO', SELECTS_LIST['GDAREACSO'].find(a => trimOrEmpty(a.dtlle) == trimOrEmpty(row["AREA"]))?.vlR1 || '');
                            formData.append('HNRRIO', trimOrEmpty(row["HONORARIOS"]));
                            formData.append('HINICIAL', normalizarDecimal(row["HONORARIO INICIAL"]));
                            formData.append('HEXITO', normalizarDecimal(row["HONORARIO DE EXITO"]));
                            formData.append('HUNICO', normalizarDecimal(row["HONORARIO UNICO"]));
                            formData.append('HAUDIENCIA', normalizarDecimal(row["HONORARIO POR AUDIENCIA"]));
                            formData.append('HDIA', normalizarDecimal(row["HONORARIO POR DIA DE VIAJE"]));
                            formData.append('HHORA', normalizarDecimal(row["HONORARIO POR HORA"]));
                            formData.append('HMENSUAL', normalizarDecimal(row["HONORARIO MENSUAL"]));
                            formData.append('HCERTIFICADOS', normalizarDecimal(row["HONORARIOS POR CERTIFICADOS"]));
                            formData.append('COMNTRIO', trimOrEmpty(row["COMENTARIOS"]));
                            // Formatear fechas correctamente
                            formData.append('FENVIO', formatearFecha(row["FECHA ENVIO"]));
                            formData.append('FULTIMOSEG', formatearFecha(row["ULTIMO SEGUIMIENTO"]));
                            formData.append('GDESTDOCSO', SELECTS_LIST['GDESTDOCSO'].find(e => trimOrEmpty(e.dtlle) == trimOrEmpty(row["ESTADO"]))?.vlR1 || '');
                            formData.append('GDSMFROCSO', SELECTS_LIST['GDSMFROCSO'].find(s => trimOrEmpty(s.dtlle) == trimOrEmpty(row["SEMAFORO"]))?.vlR1 || '');
                            formData.append('ABOGDOS', trimOrEmpty(row["ABOGADO"]));

                            // Enviar AJAX y esperar resultado
                            const res = await new Promise((resolve) => {
                                $.ajax({
                                    url: uisApis.CASOS + 'Add',
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                                    },
                                    type: 'POST',
                                    dataType: 'json',
                                    contentType: false,
                                    processData: false,
                                    data: formData,
                                    success: function (data) {
                                        resolve({ success: data?.codEstado > 0, message: data?.mensaje || '', data });
                                    },
                                    error: function () {
                                        resolve({ success: false, message: 'Error de red o servidor' });
                                    }
                                });
                            });
                            if (res.success) {
                                successCount++;
                            } else {
                                failed.push(trimOrEmpty(row["CASO"]) || `Fila ${idx + 1}`);
                            }
                            results.push(res);
                        } catch (err) {
                            // Error inesperado en la preparación/envío
                            failed.push(trimOrEmpty(row["CASO"]) || `Fila ${idx + 1}`);
                            results.push({ success: false, message: err?.message || 'Error inesperado' });
                        }
                    }

                    // Mostrar resumen
                    let msg = `Se registraron ${successCount} de ${total} registros.`;
                    if (failed.length > 0) {
                        msg += `\nNo se insertaron: ${failed.join(', ')}`;
                    }
                    if (successCount > 0) {
                        swalFire.success('Importación finalizada', msg, {
                            1: () => {
                                casosCrud.eventos.TABLE();
                            }
                        });
                    } else {
                        swalFire.errorMensaje(msg);
                    }
                },
            },
        },
        validaciones: {
            INSERT: {
                CASO: agregarValidaciones({
                    required: true
                })
            },
            EDITAR: {
                CASO: agregarValidaciones({
                    required: true
                })
            }
        }
    };

    const globalCrud = {
        eventos: {
            // Función helper para llenar selects
            llenarSelect: (selectores, datos, valorKey = 'id', textoKey = 'text') => {
                selectores.forEach(selector => {
                    let $selects = $(`[name="${selector}"]`);
                    $selects.each(function () {
                        let $select = $(this);
                        $select.empty().append('<option value="">-- Seleccione --</option>');
                        datos.forEach(item => {
                            $select.append(`<option value="${item[valorKey]}">${item[textoKey]}</option>`);
                        });
                    });
                });
            },
            // Función principal que ejecuta todas las llamadas en paralelo
            selects: async () => {
                try {
                    // * Ejecutar todas las peticiones en paralelo
                    const [grupoDatosRes, abogadosRes, clientesRes] = await Promise.all([
                        // 1. Grupo de datos (Áreas y Estados)
                        $.ajax({
                            url: uisApis.GRUPODATOS + 'ObtenerAll',
                            type: 'GET',
                            beforeSend: xhr => xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken')),
                            data: { GDTOS: 'GDAREACSO,GDESTDOCSO,GDSMFROCSO' }
                        }),
                        // 2. Abogados
                        $.ajax({
                            url: `${uisApis.ABOGADOS}Buscar&IDEMPRSA=${IDEMPRSA}&start=0&length=1000&CESTDO=A`,
                            type: 'GET',
                            beforeSend: xhr => xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null))
                        }),
                        // 4. Clientes
                        $.ajax({
                            url: `${uisApis.CLIENTES}All&start=0&length=10000&CESTDO=A&IDEMPRSA=${IDEMPRSA}`,
                            type: 'GET',
                            beforeSend: xhr => xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null))
                        })
                    ]);

                    // * Procesar Grupo de Datos
                    if (grupoDatosRes?.data) {
                        ['GDAREACSO', 'GDESTDOCSO', 'GDSMFROCSO'].forEach(grupo => {
                            let datosGrupo = grupoDatosRes.data.filter(g => g.gdpdre === grupo);
                            SELECTS_LIST[grupo] = datosGrupo;
                            globalCrud.eventos.llenarSelect([grupo], datosGrupo, 'vlR1', 'dtlle');
                        });
                    }

                    // * Procesar Abogados (Tagify)
                    if (abogadosRes?.data) {
                        SELECTS_LIST['ABOGADOS'] = abogadosRes.data;
                        usersList = abogadosRes.data.map(abogado => ({
                            value: abogado.id,
                            name: abogado.nmbrs,
                            avatar: abogado.rtafto
                        }));

                        ['#navs-equipos #ABOGDOS', '#modalAddEquipo #ABOGDOS', '#modalEditEquipo #ABOGDOS', '#modalAddCaso #ABOGDOS', '#modalEditCaso #ABOGDOS', `#${navsCasos}-filtros #ABOGDOS`].forEach(selector => {
                            const element = document.querySelector(selector);
                            if (element) tagsTagify(element, usersList);
                        });
                    }

                    // * Procesar Clientes
                    if (clientesRes?.data) {
                        SELECTS_LIST['CLIENTES'] = clientesRes.data;
                        globalCrud.eventos.llenarSelect(
                            ['IDCLNTE'],
                            clientesRes.data.map(c => ({ id: c.id, text: c.rznscl }))
                        );
                    }

                    // * Reinicializar select2 una sola vez al final
                    func.selects2("AddCaso");
                    func.selects2("navs-casos-filtros");

                } catch (error) {
                    console.error('Error al cargar datos:', error);
                    swalFire.error('Ocurrió un error al cargar los datos iniciales');
                }
            }
        }
    };


    return {
        init: async () => {
            await func.limitarCaracteres();
            IDEMPRSA = func.IDEMPRESA();
            await globalCrud.eventos.selects();
            casosCrud.init();
            casosCrud.globales();

            var myTabs = document.querySelectorAll('.erp-tabs button');
            myTabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    const tabPane = tab.getAttribute('data-bs-target');
                    if (tabPane === '#navs-casos') {
                        casosCrud.init();
                    }
                });
            });

            var triggerEl = $("#condominio-actual_select");
            if (triggerEl) {
                triggerEl.on('change', function () {
                    IDEMPRSA = func.IDEMPRESA();
                    redirect(true, 'navs-casos', 1);
                });
            }
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
