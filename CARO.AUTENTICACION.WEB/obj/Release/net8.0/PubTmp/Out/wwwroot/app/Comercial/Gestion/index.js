/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    let IDEMPRSA = null;
    const uisApis = {
        CLIENTES: '/Comercial/Gestion/Index?handler=Clients',
        CASOS: '/Comercial/Gestion/Index?handler=Cases',
        EQUIPOS: '/Comercial/Gestion/Index?handler=Equipment',
        ABOGADOS: '/Legal/Abogados/Index?handler=',
        GRUPODATOS: '/Seguridad/GrupoDato/Index?handler=',
        COMENTARIOS: '/Comercial/Gestion/Index?handler=Coments',
        HONORARIOS: '/Comercial/Gestion/Index?handler=Honorarios',
        CONTACTOS: '/Comercial/Gestion/Index?handler=Contacts'
    };

    let SELECTS_LIST = {};

    // * VARIABLES
    let navsCasos = 'navs-casos';
    let casosTable = 'casosTable';
    let CcasosTable = null;

    let navsClientes = 'navs-clientes';
    let clientesTable = 'clientesTable';
    let CclientesTable = null;

    let navsEquipos = 'navs-equipos';
    let equiposTable = 'equiposTable';
    let CequiposTable = null;

    let comentariosTable = 'casoComentarioTable';
    let CcomentariosTable = null;

    let casoHonorarioTable = 'casoHonorarioTable';
    let CcasoHonorarioTable = null;

    let contactosTable = 'contactosTable';
    let CcontactosTable = null;
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
                $('#AddCaso #divComentariosCotizacion').addClass('d-none');
                $('#AddCaso #divComentariosCotizacion #CMNTRS').val('');

                configFormVal("AddCaso",
                    casosCrud.validaciones.INSERT, () => casosCrud.eventos.INSERT());

                // DEJAR SOLAMETE UN REPEAT
                let divHonorarios = $('#divHonorariosList');
                if (divHonorarios.length > 0) {
                    divHonorarios.find('[data-repeater-item]').not(':first').remove();
                }
                let divComentarios = $('#divComentariosList');
                if (divComentarios.length > 0) {
                    divComentarios.find('[data-repeater-item]').not(':first').remove();
                }

            });

            $("#modalEditCaso").on('shown.bs.modal', function () {
                $('#AddCaso #divComentariosCotizacion').addClass('d-none');
                $('#AddCaso #divComentariosCotizacion #CMNTRS').val('');

                configFormVal('EditCaso', casosCrud.validaciones.EDITAR, () => casosCrud.eventos.EDITAR());
                func.actualizarForm('EditCaso', { ...casosCrud.variables.rowEdit, idcliente: casosCrud.variables.rowEdit.idclente });

                if (casosCrud.variables.rowEdit.gdaccnscmrcls == "4") {
                    $('#EditCaso #divComentariosCotizacion').removeClass('d-none');
                }

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

                // HISTORIAL DE COTIZACIONES - BOTÓN Y TABLA
                let historial = [];
                try {
                    if (casosCrud.variables.rowEdit.comentarioS_COTIZA) {
                        historial = JSON.parse(casosCrud.variables.rowEdit.comentarioS_COTIZA);
                    }
                } catch (e) { historial = []; }

                let $btn = $('#EditCaso #btnToggleHistorialCotizaciones');
                let $collapse = $('#EditCaso #historialCotizacionesCollapse');
                let $list = $('#EditCaso #historialCotizacionesList');
                $collapse.hide();
                $list.empty();
                if (Array.isArray(historial) && historial.length > 0) {
                    historial.forEach(function (item) {
                        let comentario = item.CMNTRS || '';
                        let fecha = '';
                        if (item.FCRCN) {
                            let d = new Date(item.FCRCN);
                            let pad = n => n < 10 ? '0' + n : n;
                            fecha = pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
                        }
                        $list.append(`
                            <div class="cotizacion-item">
                                <span class="cotizacion-icon"><i class="bx bx-message-square-dots"></i></span>
                                <div class="cotizacion-content">
                                    <div class="cotizacion-label">COMENTARIO: <span class="fw-normal">${comentario}</span></div>
                                    <div class="cotizacion-date">FECHA: ${fecha}</div>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    $list.append('<div class="text-center text-muted">Sin historial</div>');
                }
                $btn.off('click').on('click', function () {
                    $collapse.toggle();
                });
            });

            $("#AddCaso #GDACCNSCMRCLS").on('change', function () {
                if ($(this).val() == "4") {
                    $('#AddCaso #divComentariosCotizacion').removeClass('d-none');
                } else {
                    $('#AddCaso #divComentariosCotizacion').addClass('d-none');
                    $('#AddCaso #CMNTRS').val('');
                }
            });

            $("#EditCaso #GDACCNSCMRCLS").on('change', function () {
                if ($(this).val() == "4") {
                    $('#EditCaso #divComentariosCotizacion').removeClass('d-none');
                } else {
                    $('#EditCaso #divComentariosCotizacion').addClass('d-none');
                    $('#EditCaso #CMNTRS').val('');
                }
            });

            $("#modalAddCaso").on('hidden.bs.modal', function () {
                func.selects2("navs-casos-filtros");
            });

            // * MODAL - COMENTARIOS X CASO
            $("#modalAddCasoComentario").on('shown.bs.modal', function () {
                // OCULTAR 
                $("#modalAddCasoComentario #divEditarComentario").addClass('d-none');
                $("#modalAddCasoComentario #divVisualizarComentario").addClass('d-none');
                $("#modalAddCasoComentario #btnAgregarComentario").removeClass('d-none');
                $('#AddCasoComentario #COMNTRS').val('').prop('readonly', false);
                casosCrud.eventos.TABLE_COMENTARIOS();
            });

            $("#modalAddCasoHonorario").on('shown.bs.modal', function () {
                $("#modalAddCasoHonorario #divEditarHonorario").addClass('d-none');
                $("#modalAddCasoHonorario #divVisualizarHonorario").addClass('d-none');
                $("#modalAddCasoHonorario #btnAgregarHonorario").removeClass('d-none');
                $('#small_file_honorario').addClass('d-none');
                $('#AddCasoHonorario #NMBRE').val('').prop('readonly', false);
                $('#AddCasoHonorario #COMNTRS').val('').prop('readonly', false);
                $('#AddCasoHonorario #FILE').val('').prop('readonly', false);
                casosCrud.eventos.TABLE_HONORARIOS();
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
                    '&IDCLENTE=' + $(`#${navsCasos}-filtros #IDCLIENTE`).val() +
                    '&IDEQPO=' + $(`#${navsCasos}-filtros #IDEQPO`).val() +
                    '&GDAREACSO=' + $(`#${navsCasos}-filtros #GDAREACSO`).val() +
                    '&GDESTDOPRCSL=' + $(`#${navsCasos}-filtros #GDESTDOPRCSL`).val() +
                    '&GDRSLTDOCSO=' + $(`#${navsCasos}-filtros #GDRSLTDOCSO`).val() +
                    '&GDACCNSCMRCLS=' + $(`#${navsCasos}-filtros #GDACCNSCMRCLS`).val() +
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

            // * FORM - REPEATER
            let divHonorarios = $('#divHonorariosList');
            if (divHonorarios.length > 0) {
                divHonorarios.on('submit', function (e) {
                    e.preventDefault();
                });
                divHonorarios.repeater({
                    show: function () {
                        $(this).slideDown();
                    },
                    hide: function (deleteElement) {
                        if (confirm('¿Deseas eliminar este honorario?')) {
                            $(this).slideUp(deleteElement);
                        }
                    }
                })
            }

            let divComentarios = $('#divComentariosList');
            if (divComentarios.length > 0) {
                divComentarios.on('submit', function (e) {
                    e.preventDefault();
                });
                divComentarios.repeater({
                    show: function () {
                        $(this).slideDown();
                    },
                    hide: function (deleteElement) {
                        if (confirm('¿Deseas eliminar este comentario?')) {
                            $(this).slideUp(deleteElement);
                        }
                    }
                })
            }

            // * TABLA CASOS - EDITAR
            $(`#${casosTable}`).on('click', '.edit-row', async function () {
                let data = $(`#${casosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                casosCrud.variables.rowEdit = { ...data, abogdos: data.abogdos || '' };
                // NO setear los tags aquí, se hará en el evento shown.bs.modal
                $('#modalEditCaso').modal('show');
            });

            $(`#${casosTable}`).on('click', '.history-row', function () {
                let data = $(`#${casosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                casosCrud.eventos.HISTORYCASE(data.id);
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

            // * TABLA CASOS - COMENTARIO
            $(`#${casosTable}`).on('click', '.comment-row', function () {
                let data = $(`#${casosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                casosCrud.variables.rowEdit = data;
                $('#modalAddCasoComentario').modal('show');
            });

            // * TABLA CASOS - HONORARIO
            $(`#${casosTable}`).on('click', '.fee-row', function () {
                let data = $(`#${casosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                casosCrud.variables.rowEdit = data;
                $('#modalAddCasoHonorario').modal('show');
            });

            // * BOTON - AGREGAR COMENTARIO
            $('#modalAddCasoComentario #btnAgregarComentario').on('click', () => {
                let comentario = $('#AddCasoComentario #COMNTRS').val();
                if (!comentario || comentario.trim() === '') {
                    return swalFire.warning('Debe ingresar un comentario antes de continuar');
                }

                casosCrud.eventos.INSERT_COMENTARIO();
            });

            $("#modalAddCasoComentario #btnCancelarEdicionComentario").on('click', () => {
                // OCULTAR BOTONES DE EDICION
                $("#modalAddCasoComentario #divEditarComentario").addClass('d-none');
                $("#modalAddCasoComentario #btnAgregarComentario").removeClass('d-none');
                // LIMPIAR FORMULARIO
                $('#AddCasoComentario #COMNTRS').val('');
            });

            // * BOTON - EDITAR COMENTARIO
            $('#modalAddCasoComentario #btnEditarComentario').on('click', () => {
                let comentario = $('#AddCasoComentario #COMNTRS').val();
                if (!comentario || comentario.trim() === '') {
                    return swalFire.warning('Debe ingresar un comentario antes de continuar');
                }
                let data = casosCrud.variables.rowEditComentario;
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                swalFire.confirmar('¿Está seguro de editar el comentario?', {
                    1: () => {
                        casosCrud.variables.rowEditComentario.comntrs = comentario;
                        casosCrud.eventos.UPDATE_COMENTARIO();
                    }
                });
            });

            // * BOTON - AGREGAR HONORARIO
            $('#modalAddCasoHonorario #btnAgregarHonorario').on('click', () => {
                let nombre = $('#AddCasoHonorario #NMBRE').val();
                if (!nombre || nombre.trim() === '') {
                    return swalFire.warning('Debe ingresar el nombre del honorario antes de continuar');
                }
                casosCrud.eventos.INSERT_HONORARIO();
            });

            // * BOTON - CANCELAR EDICION HONORARIO
            $("#modalAddCasoHonorario #btnCancelarEdicionHonorario").on('click', () => {
                // OCULTAR BOTONES DE EDICION
                $("#modalAddCasoHonorario #divEditarHonorario").addClass('d-none');
                $("#modalAddCasoHonorario #btnAgregarHonorario").removeClass('d-none');
                // LIMPIAR FORMULARIO
                $('#AddCasoHonorario #NMBRE').val('').prop('readonly', false);
                $('#AddCasoHonorario #COMNTRS').val('').prop('readonly', false);
                $('#AddCasoHonorario #FILE').val('').prop('readonly', false);
                $('#small_file_honorario').addClass('d-none');
            });

            // * BOTON - CANCELAR VISUALIZACION HONORARIO
            $("#modalAddCasoHonorario #btnCancelarVisualizacion").on('click', () => {
                // OCULTAR MODO VISUALIZACION
                $("#modalAddCasoHonorario #divVisualizarHonorario").addClass('d-none');
                $("#modalAddCasoHonorario #btnAgregarHonorario").removeClass('d-none');
                // LIMPIAR FORMULARIO Y QUITAR READONLY
                $('#AddCasoHonorario #NMBRE').val('').prop('readonly', false);
                $('#AddCasoHonorario #COMNTRS').val('').prop('readonly', false);
                $('#AddCasoHonorario #FILE').val('').prop('readonly', false);
                $('#small_file_honorario').addClass('d-none');
            });

            // * BOTON - CANCELAR VISUALIZACION COMENTARIO
            $("#modalAddCasoComentario #btnCancelarVisualizacion").on('click', () => {
                // OCULTAR MODO VISUALIZACION
                $("#modalAddCasoComentario #divVisualizarComentario").addClass('d-none');
                $("#modalAddCasoComentario #btnAgregarComentario").removeClass('d-none');
                // LIMPIAR FORMULARIO Y QUITAR READONLY
                $('#AddCasoComentario #COMNTRS').val('').prop('readonly', false);
            });

            // * BOTON - EDITAR HONORARIO
            $('#modalAddCasoHonorario #btnEditarHonorario').on('click', () => {
                let nombre = $('#AddCasoHonorario #NMBRE').val();
                if (!nombre || nombre.trim() === '') {
                    return swalFire.warning('Debe ingresar el nombre del honorario antes de continuar');
                }
                let data = casosCrud.variables.rowEditHonorario;
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                swalFire.confirmar('¿Está seguro de editar el honorario?', {
                    1: () => {
                        casosCrud.variables.rowEditHonorario.nmbre = nombre;
                        casosCrud.variables.rowEditHonorario.comntrs = $('#AddCasoHonorario #COMNTRS').val();
                        casosCrud.eventos.UPDATE_HONORARIO();
                    }
                });
            });

            // * BTN ELIMINAR HONORARIO
            $(`#${casoHonorarioTable}`).on('click', '.delete-row', function (e) {
                e.preventDefault();
                let data = $(`#${casoHonorarioTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                swalFire.confirmar('¿Está seguro de eliminar el honorario?', {
                    1: () => casosCrud.eventos.DELETE_HONORARIO(data.id, data.urlhnrrio)
                });
            });

            // * BTN EDITAR HONORARIO
            $(`#${casoHonorarioTable}`).on('click', '.edit-row', function (e) {
                e.preventDefault();
                let data = $(`#${casoHonorarioTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                casosCrud.variables.rowEditHonorario = data;
                // OCULTAR MODO VISUALIZACION
                $("#modalAddCasoHonorario #divVisualizarHonorario").addClass('d-none');
                // MOSTRAR BOTONES DE EDICION
                $("#modalAddCasoHonorario #divEditarHonorario").removeClass('d-none');
                $("#modalAddCasoHonorario #btnAgregarHonorario").addClass('d-none');
                // CARGAR DATOS EN EL FORMULARIO Y QUITAR READONLY
                $('#AddCasoHonorario #NMBRE').val(data.nmbre).prop('readonly', false);
                $('#AddCasoHonorario #COMNTRS').val(data.comntrs).prop('readonly', false);
                $('#AddCasoHonorario #FILE').val(data.urlhnrrio).prop('readonly', false);
                if (data.urlhnrrio) {
                    $('#small_file_honorario').removeClass('d-none');
                } else {
                    $('#small_file_honorario').addClass('d-none');
                }
            });

            // ! BTN ELIMINAR COMENTARIO
            $(`#${comentariosTable}`).on('click', '.delete-row', function (e) {
                e.preventDefault();
                let data = $(`#${comentariosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                swalFire.confirmar('¿Está seguro de eliminar el comentario?', {
                    1: () => casosCrud.eventos.DELETE_COMENTARIO(data.id)
                });
            });

            // * VISUALIZAR COMENTARIO AL HACER CLIC EN LA FILA
            $(`#${comentariosTable}`).on('click', 'tbody tr', function (e) {
                // Ignorar si el clic fue en un botón de acción
                if ($(e.target).closest('.edit-row, .delete-row, .auditoria-row').length > 0) {
                    return;
                }
                
                let data = $(`#${comentariosTable}`).DataTable().row(this).data();
                if (!data?.id || data.id <= 0) return;
                
                // Cargar datos en el formulario en modo visualización
                $('#AddCasoComentario #COMNTRS').val(data.comntrs || '').prop('readonly', true);
                
                // Ocultar todos los botones de acción y mostrar solo visualización
                $('#modalAddCasoComentario #btnAgregarComentario').addClass('d-none');
                $('#modalAddCasoComentario #divEditarComentario').addClass('d-none');
                $('#modalAddCasoComentario #divVisualizarComentario').removeClass('d-none');
            });

            $(`#${comentariosTable}`).on('click', '.edit-row', function (e) {
                e.preventDefault();
                let data = $(`#${comentariosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                casosCrud.variables.rowEditComentario = data;
                // OCULTAR MODO VISUALIZACION
                $("#modalAddCasoComentario #divVisualizarComentario").addClass('d-none');
                // MOSTRAR BOTONES DE EDICION
                $("#modalAddCasoComentario #divEditarComentario").removeClass('d-none');
                $("#modalAddCasoComentario #btnAgregarComentario").addClass('d-none');
                // CARGAR DATOS EN EL FORMULARIO Y QUITAR READONLY
                $('#AddCasoComentario #COMNTRS').val(data.comntrs).prop('readonly', false);

            });

            // ! BTN DESCARGAR HONORARIO
            $(`#${casoHonorarioTable}`).on('click', '.download-row', function (e) {
                e.preventDefault();
                let data = $(`#${casoHonorarioTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                if (!data.urlhnrrio) return swalFire.error('No hay archivo para descargar');
                window.open(data.urlhnrrio, '_blank');
            });

            // * VISUALIZAR HONORARIO AL HACER CLIC EN LA FILA
            $(`#${casoHonorarioTable}`).on('click', 'tbody tr', function (e) {
                // Ignorar si el clic fue en un botón de acción
                if ($(e.target).closest('.edit-row, .delete-row, .download-row, .auditoria-row').length > 0) {
                    return;
                }
                
                let data = $(`#${casoHonorarioTable}`).DataTable().row(this).data();
                if (!data?.id || data.id <= 0) return;
                
                // Cargar datos en el formulario en modo visualización
                $('#AddCasoHonorario #NMBRE').val(data.nmbre || '').prop('readonly', true);
                $('#AddCasoHonorario #COMNTRS').val(data.comntrs || '').prop('readonly', true);
                $('#AddCasoHonorario #FILE').val(data.urlhnrrio || '').prop('readonly', true);
                
                if (data.urlhnrrio) {
                    $('#small_file_honorario').removeClass('d-none');
                } else {
                    $('#small_file_honorario').addClass('d-none');
                }
                
                // Ocultar todos los botones de acción y mostrar solo visualización
                $('#modalAddCasoHonorario #btnAgregarHonorario').addClass('d-none');
                $('#modalAddCasoHonorario #divEditarHonorario').addClass('d-none');
                $('#modalAddCasoHonorario #divVisualizarHonorario').removeClass('d-none');
            });

            // * exportar PDF - EXCEL
            $(`#${casosTable}`).on('click', '.excel-row', function () {
                let data = $(`#${casosTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                // Crear copia profunda del objeto para no alterar el original
                casosCrud.eventos.EXPORTAR._EXCEL([JSON.parse(JSON.stringify(data))]);
            })

            $(`#${casosTable}`).on('click', '.print-row', function () {
                swalFire.info('Próximamente podrás exportar el caso a PDF', 'Funcionalidad en desarrollo');
            });
        },
        variables: {
            rowEdit: {},
            rowEditComentario: {}
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
                                d.IDCLENTE = $(`#${navsCasos}-filtros #IDCLIENTE`).val();
                                d.IDEQPO = $(`#${navsCasos}-filtros #IDEQPO`).val();
                                d.GDAREACSO = $(`#${navsCasos}-filtros #GDAREACSO`).val();
                                d.GDESTDOPRCSL = $(`#${navsCasos}-filtros #GDESTDOPRCSL`).val();
                                d.GDRSLTDOCSO = $(`#${navsCasos}-filtros #GDRSLTDOCSO`).val();
                                d.GDACCNSCMRCLS = $(`#${navsCasos}-filtros #GDACCNSCMRCLS`).val();
                                // ABOGDOS FILTER: [{"value":"25","name":"Miguel Francisco, Ávalos Alva","avatar":"
                                let abogadosSelected = $(`#${navsCasos}-filtros #ABOGDOS`).val();
                                try {
                                    abogadosSelected = JSON.parse(abogadosSelected);
                                } catch (e) {
                                    abogadosSelected = [];
                                }
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
                                    // Mostrar el número de fila y la flecha juntos
                                    return `
                                        <div style="display:flex;align-items:center;justify-content:center;gap:4px;">
                                            <button class='btn btn-sm btn-icon auditoria-row' title='Ver auditoría' tabindex="-1"><i class='bx bx-chevron-right'></i></button>
                                            <span style="min-width:22px;display:inline-block;">${data.rn || meta.row + 1}</span>
                                        </div>
                                    `;
                                }
                            },
                            { data: 'didclente', title: 'Cliente' },
                            { data: 'caso', title: 'Caso' },
                            { data: 'dgdareacso', title: 'Área' },
                            { data: 'dideqpo', title: 'Equipo' },
                            { data: 'dgdaccnscmrcls', title: 'A. Comerciales' },
                            // { data: 'dgdestdoprcsl', title: 'Est. Procesal' },
                            {
                                data: null,
                                title: '',
                                width: '120px',
                                className: 'text-center',
                                orderable: false,
                                render: data => {
                                    return `<div class="d-flex justify-content-center align-items-center gap-1">
                                            <button name="HISTORIAL" class="btn btn-sm btn-icon history-row" title="Ver historial"><i class="bx bx-history"></i></button>
                                            <button name="EDITAR" class="btn btn-sm btn-icon edit-row" title="Editar"><i class="bx bx-edit"></i></button>
                                            <div class="btn-group">
                                                <button type="button" class="btn btn-sm btn-icon dropdown-toggle dropdown-toggle-no-caret" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i class="bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                <ul class="dropdown-menu dropdown-menu-end">
                                                    <li><button class="dropdown-item comment-row"><i class="bx bx-plus-circle me-2"></i>Comentario</button></li>
                                                    <li><button class="dropdown-item fee-row"><i class="bx bx-plus-circle me-2"></i>Honorario</button></li>
                                                    <li><button class="dropdown-item print-row"><i class="bx bx-printer me-2"></i>PDF</button></li>
                                                    <li><button class="dropdown-item excel-row"><i class="bx bx-file me-2"></i>Excel</button></li>
                                                </ul>
                                            </div>
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
            TABLE_COMENTARIOS: () => {
                if (!CcomentariosTable) {
                    CcomentariosTable = $(`#${comentariosTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.COMENTARIOS + 'All',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.IDCASO = casosCrud.variables.rowEdit.id;
                                d.CESTDO = 'A';
                                d.TIPO = 2; // Comentarios
                            }
                        },
                        columns: [
                            {
                                data: null,
                                title: '',
                                width: '80px',
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
                                data: 'comntrs',
                                title: 'Comentario',
                                className: 'text-break',
                                render: (data, type, row) => {
                                    if (!data) return '';
                                    const maxLength = 150;
                                    if (data.length > maxLength) {
                                        const textoSeguro = data.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                                        const textoCorto = data.substring(0, maxLength);
                                        return `<div style="width: 100%; word-wrap: break-word; white-space: normal;" title="${textoSeguro}">${textoCorto}...</div>`;
                                    }
                                    return `<div style="width: 100%; word-wrap: break-word; white-space: normal;">${data}</div>`;
                                }
                            },
                            {
                                data: null,
                                title: '',
                                className: 'text-center',
                                width: '100px',
                                render: data => {
                                    return `<div class="d-flex justify-content-center align-items-center flex-nowrap m-0 p-0 gap-1">
                                        <button name="EDITAR" class="btn btn-sm btn-icon p-1  edit-row" title="Editar"><i class="bx bx-edit"></i></button>
                                        <button name="ELIMINAR" class="btn btn-sm btn-icon p-1 delete-row" title="Eliminar"><i class="bx bx-trash"></i></button>
                                     </div>`;
                                }
                            }
                        ],
                        initComplete: function (settings, json) {
                            $(`#${comentariosTable}_filter`).hide();
                        },
                        drawCallback: function (settings) {
                            $(`#${comentariosTable}_filter`).hide();
                            $(`#${comentariosTable}_wrapper > div:first-child`).removeClass('py-4');
                        },
                        columnDefs: [],
                        buttons: (() => {
                            return [];
                        })()
                    });
                } else {
                    CcomentariosTable.ajax.reload();
                }

            },
            TABLE_HONORARIOS: () => {
                if (!CcasoHonorarioTable) {
                    CcasoHonorarioTable = $(`#${casoHonorarioTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.HONORARIOS + 'All',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.IDCASO = casosCrud.variables.rowEdit.id;
                                d.CESTDO = 'A';
                                d.TIPO = 1; // Honorarios
                            }
                        },
                        columns: [
                            {
                                data: null,
                                title: '',
                                orderable: false,
                                width: '80px',
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
                            { data: 'nmbre', title: 'Nombre Honorario', width: '35%' },
                            {
                                data: 'comntrs',
                                title: 'Comentario',
                                width: '45%',
                                className: 'text-break',
                                render: (data, type, row) => {
                                    if (!data) return '';
                                    const textoSeguro = data.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                                    if (type === 'display' && data.length > 100) {
                                        return `<span class="d-inline-block text-truncate" style="max-width: 100%; word-break: break-word;" title="${textoSeguro}">${data}</span>`;
                                    }
                                    return `<span class="d-inline-block" style="max-width: 100%; word-break: break-word; overflow-wrap: break-word;">${data}</span>`;
                                }
                            },
                            {
                                data: null, title: '',
                                width: '20%',
                                className: 'text-center',
                                orderable: false,
                                render: data => {
                                    return `<div class="d-flex justify-content-center align-items-center flex-nowrap m-0 p-0 gap-1">` +
                                        `<button name="EDITAR" class="btn btn-sm btn-icon p-1 edit-row" title="Editar"><i class="bx bx-edit"></i></button>` +
                                        `<button name="ELIMINAR" class= "btn btn-sm btn-icon p-1 delete-row" title="Eliminar"><i class="bx bx-trash"></i></button>` +
                                        `<button name="DESCARGAR" class="btn btn-sm btn-icon p-1 download-row" title="Ir a honorario"><i class="bx bx-link-external"></i></button>` +
                                        `</div>`;
                                }
                            }
                        ],
                        initComplete: function (settings, json) {
                            $(`#${casoHonorarioTable}_filter`).hide();
                        },
                        drawCallback: function (settings) {
                            $(`#${casoHonorarioTable}_filter`).hide();
                            $(`#${casoHonorarioTable}_wrapper > div:first-child`).removeClass('py-4');
                        },
                        columnDefs: [],
                        buttons: (() => {
                            return [];
                        })()
                    });
                } else {
                    CcasoHonorarioTable.ajax.reload();
                }

            },
            INSERT: () => {
                let formData = new FormData();
                formData.append('IDEMPRSA', IDEMPRSA);
                formData.append('CASO', $('#AddCaso #CASO').val());
                formData.append('IDCLIENTE', $('#AddCaso #IDCLIENTE').val());
                formData.append('NAMECLIENTE', $('#AddCaso #IDCLIENTE option:selected').text());
                formData.append('IDEQPO', $('#AddCaso #IDEQPO').val());
                formData.append('GDRSLTDOCSO', $('#AddCaso #GDRSLTDOCSO').val());
                formData.append('GDACCNSCMRCLS', $('#AddCaso #GDACCNSCMRCLS').val());
                formData.append('CMNTRS', $('#AddCaso #CMNTRS').val());

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
                formData.append('GDAREACSO', $('#AddCaso #GDAREACSO').val());
                formData.append('GDESTDOPRCSL', $('#AddCaso #GDESTDOPRCSL').val());

                // Obtener honorarios del repeater
                $('#divHonorarios [data-repeater-item]').each(function (index) {
                    let nombre = $(this).find(`input[name="honorarios[${index}][NMBRE]"]`).val();
                    let comments = $(this).find(`textarea[name="honorarios[${index}][COMNTRS]`).val();
                    // let archivo = $(this).find('input[name="honorarios[' + index + '][FILE]"]')[0].files[0];
                    let archivo = $(this).find('input[name="honorarios[' + index + '][FILE]"]').val();

                    if (nombre || archivo) {
                        formData.append(`HONORARIOS[${index}].FILE`, archivo);
                        formData.append(`HONORARIOS[${index}].NMBRE`, nombre || '');
                        formData.append(`HONORARIOS[${index}].COMNTRS`, comments || '');
                        formData.append(`HONORARIOS[${index}].TIPO`, 1);
                    }
                });

                // Obtener comentarios del repeater
                $('#divComentarios [data-repeater-item]').each(function (index) {
                    let comentario = $(this).find('textarea[name="comentarios[' + index + '][COMNTRS]"]').val();

                    if (comentario) {
                        formData.append(`COMENTARIOS[${index}].COMNTRS`, comentario);
                        formData.append(`COMENTARIOS[${index}].TIPO`, 2);
                    }
                });

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
                formData.append('IDCLIENTE', $('#EditCaso #IDCLIENTE').val());
                formData.append('NAMECLIENTE', $('#EditCaso #IDCLIENTE option:selected').text());
                formData.append('IDEQPO', $('#EditCaso #IDEQPO').val());
                formData.append('GDRSLTDOCSO', $('#EditCaso #GDRSLTDOCSO').val());
                formData.append('GDACCNSCMRCLS', $('#EditCaso #GDACCNSCMRCLS').val());
                formData.append('GDACCNSCMRCLSANT', casosCrud.variables.rowEdit.gdaccnscmrcls);
                formData.append('CMNTRS', $('#EditCaso #CMNTRS').val());

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
                formData.append('GDAREACSO', $('#EditCaso #GDAREACSO').val());
                formData.append('GDESTDOPRCSL', $('#EditCaso #GDESTDOPRCSL').val());
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
            // * COMENTARIOS
            INSERT_COMENTARIO: () => {
                let formData = new FormData();
                formData.append('IDCASO', casosCrud.variables.rowEdit.id);
                formData.append('COMNTRS', $('#AddCasoComentario #COMNTRS').val());
                formData.append('TIPO', 2); // 

                swalFire.cargando(['Espere un momento', 'Estamos guardando el comentario.']);
                $.ajax({
                    url: uisApis.COMENTARIOS + 'Add',
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
                                    // LIMPIAR FORMULARIO
                                    $('#AddCasoComentario #COMNTRS').val('');
                                    CcomentariosTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al procesar la solicitud')
                });
            },
            DELETE_COMENTARIO: (ID) => {
                let formData = new FormData();
                formData.append('ID', ID);

                swalFire.cargando(['Espere un momento', 'Estamos eliminando el comentario.']);
                $.ajax({
                    url: uisApis.COMENTARIOS + 'Delete',
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
                                    CcomentariosTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al procesar la solicitud')
                });
            },
            UPDATE_COMENTARIO: () => {
                let formData = new FormData();
                formData.append('ID', casosCrud.variables.rowEditComentario.id);
                formData.append('COMNTRS', casosCrud.variables.rowEditComentario.comntrs);
                swalFire.cargando(['Espere un momento', 'Estamos actualizando el comentario.']);
                $.ajax({
                    url: uisApis.COMENTARIOS + 'Update',
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
                                    // OCULTAR BOTONES DE EDICION
                                    $("#modalAddCasoComentario #divEditarComentario").addClass('d-none');
                                    $("#modalAddCasoComentario #btnAgregarComentario").removeClass('d-none');
                                    // LIMPIAR FORMULARIO
                                    $('#AddCasoComentario #COMNTRS').val('');
                                    // LIMPIAR VARIABLE row
                                    casosCrud.variables.rowEditComentario = {};
                                    CcomentariosTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al procesar la solicitud')
                });
            },
            // * HONORARIOS
            INSERT_HONORARIO: () => {
                let formData = new FormData();
                formData.append('IDCASO', casosCrud.variables.rowEdit.id);
                formData.append('NMBRE', $('#AddCasoHonorario #NMBRE').val());
                formData.append('COMNTRS', $('#AddCasoHonorario #COMNTRS').val());
                formData.append('FILE', $('#AddCasoHonorario #FILE').val());
                formData.append('URLHNRRIO', $('#AddCasoHonorario #FILE').val());
                // let file = $('#AddCasoHonorario #FILE')[0].files[0];
                // if (file) {
                //     formData.append('FILE', file);
                // }
                formData.append('TIPO', 1); // Honorarios
                swalFire.cargando(['Espere un momento', 'Estamos guardando el honorario.']);
                $.ajax({
                    url: uisApis.HONORARIOS + 'Add',
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
                                    // LIMPIAR FORMULARIO
                                    $('#AddCasoHonorario #NMBRE').val('');
                                    $('#AddCasoHonorario #COMNTRS').val('');
                                    $('#AddCasoHonorario #FILE').val('');
                                    CcasoHonorarioTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al procesar la solicitud')
                });
            },
            DELETE_HONORARIO: (ID, urlhnrrio) => {
                let formData = new FormData();
                formData.append('ID', ID);
                formData.append('URLHNRRIO', urlhnrrio);

                swalFire.cargando(['Espere un momento', 'Estamos eliminando el honorario.']);
                $.ajax({
                    url: uisApis.HONORARIOS + 'Delete',
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
                                    CcasoHonorarioTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al procesar la solicitud')
                });
            },
            UPDATE_HONORARIO: () => {
                let formData = new FormData();
                formData.append('ID', casosCrud.variables.rowEditHonorario.id);
                formData.append('NMBRE', casosCrud.variables.rowEditHonorario.nmbre);
                formData.append('COMNTRS', casosCrud.variables.rowEditHonorario.comntrs);
                formData.append('TIPO', 1); // Honorarios
                formData.append('URLHNRRIO', $('#AddCasoHonorario #FILE').val());
                formData.append('FILE', $('#AddCasoHonorario #FILE').val());
                // let fileInput = $('#AddCasoHonorario #FILE')[0];
                // let file = fileInput.files[0];
                // if (file) {
                //     formData.append('FILE', file);
                // }

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el honorario.']);
                $.ajax({
                    url: uisApis.HONORARIOS + 'Update',
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
                                    // OCULTAR BOTONES DE EDICION
                                    $("#modalAddCasoHonorario #divEditarHonorario").addClass('d-none');
                                    $("#modalAddCasoHonorario #btnAgregarHonorario").removeClass('d-none');
                                    // LIMPIAR FORMULARIO
                                    $('#AddCasoHonorario #NMBRE').val('');
                                    $('#AddCasoHonorario #COMNTRS').val('');
                                    $('#AddCasoHonorario #FILE').val('');
                                    // OCULTAR NOMBRE DEL ARCHIVO
                                    $('#small_file_honorario').addClass('d-none');
                                    // LIMPIAR VARIABLE row
                                    casosCrud.variables.rowEditHonorario = {};
                                    CcasoHonorarioTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al procesar la solicitud')
                });
            },
            EXPORTAR: {
                _EXCEL: (arrayData) => {
                    swalFire.cargando(['Generando reporte...', 'Por favor espere mientras se genera el archivo Excel.']);

                    // Agrupar por dideqpo (Equipo)
                    const equiposMap = {};
                    arrayData.forEach(item => {
                        const equipo = item.dideqpo || 'Sin equipo';
                        if (!equiposMap[equipo]) equiposMap[equipo] = [];
                        equiposMap[equipo].push(item);
                    });

                    // Función para limpiar el nombre de la hoja (reemplaza caracteres inválidos por '-')
                    const sanitizeSheetName = (name) => {
                        // Reemplazar caracteres inválidos: * ? : \ / [ ] por '-'
                        return (name || 'Hoja').replace(/[\*\?\:\\\/\[\]]/g, '-').substring(0, 31) || 'Hoja';
                    };

                    const workbook = new ExcelJS.Workbook();
                    let columnas = ['N°', 'Cliente', 'Caso', 'Área', 'Resultado', 'Estado Procesal', 'Acción Comercial', 'Honorarios', 'Comentarios', 'F. Creación', 'F. Edición'];

                    Object.entries(equiposMap).forEach(([equipo, dataEquipo]) => {
                        let safeSheetName = sanitizeSheetName(equipo);
                        let worksheet = workbook.addWorksheet(safeSheetName); // Excel limita nombre hoja a 31 caracteres y sin caracteres inválidos

                        // Agregar título
                        worksheet.mergeCells('B2:L2');
                        const titleCell = worksheet.getCell('B2');
                        titleCell.value = `REPORTE DE CASOS - EQUIPO: ${equipo}`;
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
                                fgColor: { argb: 'FFFF6600' } // Naranja
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
                            data.honorarios = JSON.parse(data.honorarios || '[]');
                            data.comentarios = JSON.parse(data.comentarios || '[]');

                            // Formatear honorarios: cada uno en una línea con fecha
                            let honorariosText = data.honorarios.map((h, idx) => {
                                let texto = `${idx + 1}. Nombre: ${h.NMBRE}`;
                                if (h.COMNTRS) {
                                    texto += `\nComentarios: ${h.COMNTRS}`;
                                }
                                if (h.FCRCN) {
                                    texto += `\nFecha: ${func.formatFecha(h.FCRCN, 'DD-MM-YYYY HH:mm')}`;
                                }

                                if(h.URLHNRRIO){
                                    texto += `\nArchivo: ${h.URLHNRRIO}`;
                                }
                                return texto;
                            }).join('\n\n');

                            // Formatear comentarios: cada uno en una línea con fecha
                            let comentariosText = data.comentarios.map((c, idx) => {
                                let texto = `${idx + 1}. ${c.COMNTRS}`;
                                if (c.FCRCN) {
                                    texto += `\nFecha: ${func.formatFecha(c.FCRCN, 'DD-MM-YYYY HH:mm')}`;
                                }
                                return texto;
                            }).join('\n\n');

                            worksheet.getCell(`B${fila}`).value = index + 1;
                            worksheet.getCell(`C${fila}`).value = data.didclente;
                            worksheet.getCell(`D${fila}`).value = data.caso;
                            worksheet.getCell(`E${fila}`).value = data.dgdareacso;
                            worksheet.getCell(`F${fila}`).value = data.dgdrsltdocso || '-';
                            worksheet.getCell(`G${fila}`).value = data.dgdestdoprcsl;
                            worksheet.getCell(`H${fila}`).value = data.dgdaccnscmrcls || '-';
                            worksheet.getCell(`I${fila}`).value = honorariosText || '-';
                            worksheet.getCell(`J${fila}`).value = comentariosText || '-';
                            worksheet.getCell(`K${fila}`).value = func.formatFecha(data.fcrcn, 'DD-MM-YYYY HH:mm');
                            worksheet.getCell(`L${fila}`).value = func.formatFecha(data.fedcn, 'DD-MM-YYYY HH:mm');

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
                            if (index === 0) col.width = 5; // Número
                            else if (index === 7 || index === 8) col.width = 80; // Honorarios y Comentarios (doble ancho)
                            else if (index === 9 || index === 10) col.width = 18; // Fechas
                            else col.width = maxLength < 15 ? 15 : (maxLength > 30 ? 30 : maxLength);
                        });

                        // Aplicar filas alternas de color (estilo de tabla)
                        const lastRow = fila - 1;
                        for (let i = 6; i <= lastRow; i++) {
                            const isEven = (i - 6) % 2 === 0;
                            const fillColor = isEven ? 'FFF5F5F5' : 'FFFFFFFF'; // Gris claro / Blanco

                            for (let j = 0; j < columnas.length; j++) {
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
                    // Validar y limpiar datos
                    const trimOrEmpty = v => (typeof v === 'string' ? v.trim() : '');
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
                            formData.append('IDCLIENTE', SELECTS_LIST['CLIENTES'].find(c => trimOrEmpty(c.rznscl) == trimOrEmpty(row["CLIENTE"]))?.id || '');
                            formData.append('NAMECLIENTE', trimOrEmpty(row["CLIENTE"]));
                            formData.append('IDEQPO', SELECTS_LIST['EQUIPOS'].find(e => trimOrEmpty(e.nmbreequpo) == trimOrEmpty(row["EQUIPO"]))?.id || '');
                            formData.append('GDACCNSCMRCLS', SELECTS_LIST['GDACCNSCMRCLS'].find(a => trimOrEmpty(a.dtlle) == trimOrEmpty(row["ACCION COMERCIAL"]))?.vlR1 || '');
                            formData.append('GDAREACSO', SELECTS_LIST['GDAREACSO'].find(a => trimOrEmpty(a.dtlle) == trimOrEmpty(row["AREA"]))?.vlR1 || '');
                            formData.append('GDESTDOPRCSL', SELECTS_LIST['GDESTDOPRCSL'].find(e => trimOrEmpty(e.dtlle) == trimOrEmpty(row["ESTADO PROCESAL"]))?.vlR1 || '');
                            formData.append("GDRSLTDOCSO", SELECTS_LIST['GDRSLTDOCSO'].find(d => trimOrEmpty(d.dtlle) == trimOrEmpty(row["Resultado Caso"]))?.vlR1 || '');
                            formData.append('ABOGDOS', trimOrEmpty(row["COMPARTIDO"]));

                            // Honorarios
                            let honorariosArray = row["PROPUESTA DE HONORARIOS"] ? trimOrEmpty(row["PROPUESTA DE HONORARIOS"]).split('|') : [];
                            for (let index = 0; index < honorariosArray.length; index++) {

                                let jsonProperties = [];
                                try {                
                                    jsonProperties = honorariosArray[index].split('--').map(item => item ? item.trim() : '');


                                } catch (err) {
                                    console.warn('Error al parsear honorarios:', err);
                                }

                                formData.append(`HONORARIOS[${index}].FILE`, jsonProperties[2] && jsonProperties[2] ? jsonProperties[2] : '');
                                formData.append(`HONORARIOS[${index}].NMBRE`, jsonProperties[1] && jsonProperties[1] ? jsonProperties[1] : '');
                                formData.append(`HONORARIOS[${index}].COMNTRS`, jsonProperties[3] && jsonProperties[3] ? jsonProperties[3] : '');
                                formData.append(`HONORARIOS[${index}].FCHA`, jsonProperties[0] && jsonProperties[0] ? jsonProperties[0] : '');
                                formData.append(`HONORARIOS[${index}].TIPO`, 1);
                            }

                            // Comentarios
                            let comentariosArray = row["COMENTARIOS"] ? trimOrEmpty(row["COMENTARIOS"]).split('|') : [];
                            for (let index = 0; index < comentariosArray.length; index++) {
                                formData.append(`COMENTARIOS[${index}].COMNTRS`, trimOrEmpty(comentariosArray[index]));
                                formData.append(`COMENTARIOS[${index}].TIPO`, 2);
                            }

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

            HISTORYCASE: (IDCASO) => {
                swalFire.cargando(['Cargando historial...', 'Por favor espere.']);
                $.ajax({
                    url: uisApis.CASOS + 'AllHistory&start=0&length=10000&IDCASO=' + IDCASO,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                    },
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        // data.data puede ser un array de objetos
                        let rows = Array.isArray(data.data) ? data.data : [];
                        if (rows.length === 0) {
                            swalFire.info('Sin historial', 'No se encontraron registros de historial para este caso.');
                            return;
                        }
                        // Formatear cada registro: mostrar descp y fcrcn
                        let html = '<div style="max-height:350px;overflow-y:auto;text-align:left" id="historial-caso-list">';
                        rows.forEach(item => {
                            let fecha = item.fcrcn ? func.formatFecha(item.fcrcn, 'DD-MM-YYYY HH:mm') : '-';
                            html += `<div style=\"margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #eee\">
                                                                <div><b>Descripción:</b> ${item.descp || '-'}<\/div>
                                                                <div><b>Fecha:</b> ${fecha}<\/div>
                                                        <\/div>`;
                        });
                        html += '</div>';
                        swalFire.information(
                            'Historial del caso',
                            html,
                            {},
                            {
                                text: 'Exportar Excel',
                                onClick: function () {
                                    const workbook = new ExcelJS.Workbook();
                                    const worksheet = workbook.addWorksheet('Historial Caso');
                                    worksheet.columns = [
                                        { header: 'Descripción', key: 'descp', width: 80 },
                                        { header: 'Fecha', key: 'fcrcn', width: 25 }
                                    ];
                                    rows.forEach(item => {
                                        worksheet.addRow({
                                            descp: item.descp || '-',
                                            fcrcn: item.fcrcn ? func.formatFecha(item.fcrcn, 'DD-MM-YYYY HH:mm') : '-'
                                        });
                                    });
                                    worksheet.getRow(1).font = { bold: true };
                                    worksheet.columns.forEach(col => { col.alignment = { vertical: 'top', wrapText: true }; });
                                    workbook.xlsx.writeBuffer().then(buffer => {
                                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(blob);
                                        link.download = `Historial_Caso_${func.formatFecha(new Date(), 'YYYY-MM-DD_HH-mm')}.xlsx`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }).catch(error => {
                                        swalFire.error('Error al exportar el historial');
                                    });
                                }
                            }
                        );
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al obtener el historial del caso')
                });
            }
        },
        validaciones: {
            INSERT: {
                CASO: agregarValidaciones({
                    required: true
                }),
                IDCLIENTE: agregarValidaciones({
                    required: true
                }),
                IDEQPO: agregarValidaciones({
                    required: true
                }),
                GDAREACSO: agregarValidaciones({
                    required: true
                })
            },
            EDITAR: {
                CASO: agregarValidaciones({
                    required: true
                }),
                IDCLIENTE: agregarValidaciones({
                    required: true
                }),
                IDEQPO: agregarValidaciones({
                    required: true
                }),
                GDAREACSO: agregarValidaciones({
                    required: true
                })
            },
            INSERT_COMENTARIO: {
                COMNTRS: agregarValidaciones({
                    required: true,
                    maxlength: 5000
                })
            }
        }
    };

    const clientesCrud = {
        init: () => {
            $(`#${navsClientes}-filtros input, #${navsClientes}-filtros select`).val('');
            clientesCrud.eventos.TABLE();
        },
        globales: () => {
            // * MODALES
            $("#modalAddCliente").on('shown.bs.modal', function () {
                configFormVal("AddCliente",
                    clientesCrud.validaciones.INSERT, () => clientesCrud.eventos.INSERT());
            });

            $("#modalEditCliente").on('shown.bs.modal', function () {
                configFormVal('EditCliente', clientesCrud.validaciones.UPDATE, () => clientesCrud.eventos.UPDATE());
                func.actualizarForm('EditCliente', clientesCrud.variables.rowEdit);
            });

            $("#modalAddContacto").on('shown.bs.modal', function () {
                $("#modalAddContacto #divEditarContacto").addClass('d-none');
                $("#modalAddContacto #divVisualizarContacto").addClass('d-none');
                $("#modalAddContacto #btnAgregarContacto").removeClass('d-none');
                $('#AddContacto #NMBRS').val('').prop('readonly', false);
                $('#AddContacto #APLLIDS').val('').prop('readonly', false);
                $('#AddContacto #GDEMPRSA').val('').trigger('change').prop('disabled', false);
                $('#AddContacto #CCRPRTVO').val('').prop('readonly', false);
                $('#AddContacto #CRRSCNDRIO').val('').prop('readonly', false);
                func.selects2('AddContacto')
                clientesCrud.eventos.TABLE_CONTACTS();
            });


            // * BOTONES
            $(`#${navsClientes}-filtros-buscar`).on('click', () => clientesCrud.eventos.TABLE());

            $(`#${navsClientes}-filtros-agregar`).on('click', (E) => {
                $('#modalAddCliente').modal('show');
            });

            // navs-clientes-filtros-agregar-masivo
            $(`#${navsClientes}-filtros-agregar-masivo`).on('click', (e) => {
                e.preventDefault();

                // HTML con input file oculto y label estilizado como botón
                const html = `
                    <label for="excelFileInput" class="custom-file-upload">
                        <i class="bx bx-upload"></i> Seleccionar archivo Excel
                    </label>
                    <input id="excelFileInput" type="file" accept=".xlsx,.xls" />
                    <div class="file-name-preview" id="fileNamePreview">Ningún archivo seleccionado</div>
                    <small style="color:#888;">Solo se permiten archivos Excel</small>
                `;

                Swal.fire({
                    title: 'Importar clientes',
                    html: html,
                    showCancelButton: true,
                    confirmButtonText: 'Subir',
                    cancelButtonText: 'Cancelar',
                    focusConfirm: false,
                    didOpen: () => {
                        // Mostrar nombre del archivo seleccionado
                        const fileInput = Swal.getPopup().querySelector('#excelFileInput');
                        const fileNamePreview = Swal.getPopup().querySelector('#fileNamePreview');
                        fileInput.addEventListener('change', function () {
                            if (fileInput.files && fileInput.files.length > 0) {
                                fileNamePreview.textContent = fileInput.files[0].name;
                            } else {
                                fileNamePreview.textContent = 'Ningún archivo seleccionado';
                            }
                        });
                    },
                    preConfirm: () => {
                        const fileInput = Swal.getPopup().querySelector('#excelFileInput');
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
                                        // Si es un objeto con 'text', usar solo el texto
                                        if (cellValue && typeof cellValue === 'object' && cellValue.text) {
                                            obj[header] = cellValue.text;
                                        } else if (cellValue == null) {
                                            obj[header] = '';
                                        } else {
                                            obj[header] = cellValue;
                                        }
                                    });

                                    // Utilidad para limpiar espacios y extraer solo texto si es objeto
                                    function cleanStr(val) {
                                        let v = val;
                                        if (v && typeof v === 'object' && v.text) v = v.text;
                                        if (typeof v === 'string') return v.trim();
                                        return v || '';
                                    }

                                    rows.push({
                                        IDEMPRSA: IDEMPRSA,
                                        RUC: cleanStr(obj['DOI'] || ''),
                                        RZNSCL: cleanStr(obj['RAZON SOCIAL'] || cleanStr(obj['NOMBRE COMERCIAL']) || ''),
                                        NMBRECMRCL: cleanStr(obj['NOMBRE COMERCIAL'] || ''),
                                        RPRSNTNTE: '',
                                        GDTMPOEMPRESA: SELECTS_LIST['GDTMPOEMPRESA'].find(item => item.dtlle.toLowerCase() === (cleanStr(obj['Tamaño de empresa'].toLowerCase() || '').toLowerCase()))?.vlR1 || '',
                                        GDTIPOPRSNA: SELECTS_LIST['GDTIPOPRSNA'].find(item => item.vlR2.toLowerCase() === (cleanStr(obj['Tipo de Persona']).toLowerCase()))?.vlR1 || '',
                                        GDSCTRINDSTRIA: SELECTS_LIST['GDSCTRINDSTRIA'].find(item => item.dtlle.toLowerCase() === (cleanStr(obj['Sector/ Industria'] || '').toLowerCase()))?.vlR1 || '',
                                        DRCCN: '',
                                        TLFNO: '',
                                        CDSDE: '',
                                        GDEMPRSA: SELECTS_LIST['GDEMPRSA'].find(item => item.dtlle.toLowerCase() === (cleanStr(obj['Cargo en la empresa'].toLowerCase() || '').toLowerCase()))?.vlR1 || '',
                                        CRREO: cleanStr(obj['Correo Corporativo'] || ''),
                                        NMBRS: cleanStr(obj['Nombres'] || ''),
                                        APLLIDS: cleanStr(obj['Apellidos'] || ''),
                                        CCRPRTVO: cleanStr(obj['Correo Corporativo'] || ''),
                                        CRRSCNDRIO: cleanStr(obj['Correo Secundario'] || '')
                                    });
                                });

                                if (!rows.length) {
                                    swalFire.warning('El archivo Excel no contiene datos.');
                                    return;
                                }

                                // filtrar si RZNSCL es igual a Cliente
                                rows = rows.filter(r => r.RZNSCL != 'RAZON SOCIAL');
                                // AGRUPAR ROWS A PERSONAS JURIDICAS EN VARIABLES .CONTACTOS, BUSCANDO SOLAMENTE NOMBRE IDENTIFCO
                                let registros = [];
                                rows.forEach(r => {

                                    let existente = registros.find(reg => reg.RZNSCL === r.RZNSCL);
                                    if (existente) {
                                        // AGREGAR CONTACTO
                                        if (!existente.CONTACTOS) existente.CONTACTOS = [];
                                        existente.CONTACTOS.push({
                                            NMBRS: r.NMBRS,
                                            APLLIDS: r.APLLIDS,
                                            GDEMPRSA: r.GDEMPRSA,
                                            CCRPRTVO: r.CCRPRTVO,
                                            CRRSCNDRIO: r.CRRSCNDRIO
                                        });
                                    } else {
                                        // NUEVA PERSONA JURIDICA
                                        let nuevaEmpresa = { ...r, NMBRS: '', APLLIDS: '', CRREO: '', CCRPRTVO: '', CRRSCNDRIO: '', GDEMPRSA: '' };
                                        nuevaEmpresa.CONTACTOS = [
                                            {
                                                NMBRS: r.NMBRS,
                                                APLLIDS: r.APLLIDS,
                                                GDEMPRSA: r.GDEMPRSA,
                                                CCRPRTVO: r.CCRPRTVO,
                                                CRRSCNDRIO: r.CRRSCNDRIO
                                            }
                                        ];
                                        registros.push(nuevaEmpresa);
                                    }

                                });

                                swalFire.cargando(['Espere un momento', 'Insertando registros...']);
                                const insertPromises = registros.map(row => clientesCrud.eventos.INSERT_ASYNC(row));
                                Promise.all(insertPromises)
                                    .then(() => {
                                        clientesCrud.eventos.TABLE();
                                        swalFire.success('Todos los registros fueron insertados correctamente.');
                                    })
                                    .catch((err) => {
                                        swalFire.error('Ocurrió un error al insertar algunos registros.');
                                    });
                            };
                            reader.onerror = function () {
                                swalFire.error('Error al leer el archivo Excel.');
                            };
                            reader.readAsArrayBuffer(file);
                        } catch (err) {
                            swalFire.error('Error al procesar el archivo Excel.');
                        }
                    }
                })
            });

            // * TABLA CLIENTES - EDITAR
            $(`#${clientesTable}`).on('click', '.edit-row', function () {
                let data = $(`#${clientesTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                clientesCrud.variables.rowEdit = data;
                $('#modalEditCliente').modal('show');
            });

            // * TABLA CLIENTES - ELIMINAR
            $(`#${clientesTable}`).on('click', '.delete-row', function () {
                let data = $(`#${clientesTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                swalFire.confirmar('¿Está seguro de eliminar la empresa?', {
                    1: () => clientesCrud.eventos.DELETE(data.id)
                });
            });

            // * TABLA CLIENTES - CONTACTO
            $(`#${clientesTable}`).on('click', '.contacto-row', function () {
                let data = $(`#${clientesTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                clientesCrud.variables.rowEdit = data;
                $('#modalAddContacto').modal('show');
            });

            // * MODAL CONTACTOS - BOTONES
            $(`#${clientesTable}`).on('click', '.agregar-masivo-contactos-row', function () {
                let data = $(`#${clientesTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                clientesCrud.variables.rowEdit = data;

                // HTML con input file oculto y label estilizado como botón
                const html = `
                    <label for="excelFileInput" class="custom-file-upload">
                        <i class="bx bx-upload"></i> Seleccionar archivo Excel
                    </label>
                    <input id="excelFileInput" type="file" accept=".xlsx,.xls" />
                    <div class="file-name-preview" id="fileNamePreview">Ningún archivo seleccionado</div>
                    <small style="color:#888;">Solo se permiten archivos Excel</small>
                `;

                Swal.fire({
                    title: 'Importar contactos masivo',
                    html: html,
                    showCancelButton: true,
                    confirmButtonText: 'Subir',
                    cancelButtonText: 'Cancelar',
                    focusConfirm: false,
                    didOpen: () => {
                        // Mostrar nombre del archivo seleccionado
                        const fileInput = Swal.getPopup().querySelector('#excelFileInput');
                        const fileNamePreview = Swal.getPopup().querySelector('#fileNamePreview');
                        fileInput.addEventListener('change', function () {
                            if (fileInput.files && fileInput.files.length > 0) {
                                fileNamePreview.textContent = fileInput.files[0].name;
                            } else {
                                fileNamePreview.textContent = 'Ningún archivo seleccionado';
                            }
                        });
                    },
                    preConfirm: () => {
                        const fileInput = Swal.getPopup().querySelector('#excelFileInput');
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
                                const rows = [];
                                const headerRow = worksheet.getRow(1);
                                const headers = headerRow.values.slice(1); // El primer valor es null
                                worksheet.eachRow((row, rowNumber) => {
                                    if (rowNumber === 1) return; // Saltar cabecera
                                    const obj = {};
                                    headers.forEach((header, i) => {
                                        let cellValue = row.getCell(i + 1).value;
                                        // Si es un objeto con 'text', usar solo el texto
                                        if (cellValue && typeof cellValue === 'object' && cellValue.text) {
                                            obj[header] = cellValue.text;
                                        } else if (cellValue == null) {
                                            obj[header] = '';
                                        } else {
                                            obj[header] = cellValue;
                                        }
                                    });

                                    // Utilidad para limpiar espacios y extraer solo texto si es objeto
                                    function cleanStr(val) {
                                        let v = val;
                                        if (v && typeof v === 'object' && v.text) v = v.text;
                                        if (typeof v === 'string') return v.trim();
                                        return v || '';
                                    }

                                    rows.push({
                                        IDCLNTE: data.id,
                                        NMBRS: cleanStr(obj['Nombres']),
                                        APLLIDS: cleanStr(obj['Apellidos']),
                                        GDEMPRSA: cleanStr(obj['Cargo en la empresa']),
                                        GDEMPRSA: SELECTS_LIST['GDEMPRSA'].find(gde => gde.dtlle === cleanStr(obj['Cargo en la empresa']))?.vlR1 || null,
                                        CCRPRTVO: cleanStr(obj['Correo Corporativo']),
                                        CRRSCNDRIO: cleanStr(obj['Correo Secundario']),
                                        CESTDO: 'A' // Activo por defecto
                                    });
                                });

                                if (!rows.length) {
                                    swalFire.warning('El archivo Excel no contiene datos.');
                                    return;
                                }

                                clientesCrud.eventos.INSERT_CONTACTO(rows);
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
            });


            $(`#modalAddContacto #btnAgregarContacto`).on('click', (e) => {
                e.preventDefault();
                let NMBRS = $("#modalAddContacto #NMBRS").val();
                if (!NMBRS || NMBRS.trim() === '') return swalFire.warning('Debe ingresar el nombre del contacto antes de agregarlo.');

                clientesCrud.eventos.INSERT_CONTACTO([], true);
            });

            $(`#modalAddContacto #btnEditarContacto`).on('click', (e) => {
                e.preventDefault();
                let NMBRS = $("#modalAddContacto #NMBRS").val();
                if (!NMBRS || NMBRS.trim() === '') return swalFire.warning('Debe ingresar el nombre del contacto antes de actualizarlo.');
                if (!clientesCrud.variables.rowEdit?.id || clientesCrud.variables.rowEdit.id <= 0)
                    return swalFire.error('No se ha podido obtener el identificador del contacto a editar.');

                swalFire.confirmar('¿Está seguro de actualizar el contacto?', {
                    1: () => clientesCrud.eventos.UPDATE_CONTACTO()
                });
            });

            $(`#modalAddContacto #btnCancelarEdicionContacto`).on('click', (e) => {
                e.preventDefault();
                // OCULTAR BOTONES DE EDICION
                $("#modalAddContacto #divEditarContacto").addClass('d-none');
                $("#modalAddContacto #btnAgregarContacto").removeClass('d-none');
                // LIMPIAR FORMULARIO Y QUITAR READONLY
                $('#modalAddContacto #NMBRS').val('').prop('readonly', false);
                $('#modalAddContacto #APLLIDS').val('').prop('readonly', false);
                $('#modalAddContacto #GDEMPRSA').val('').trigger('change').prop('disabled', false);
                $('#modalAddContacto #CCRPRTVO').val('').prop('readonly', false);
                $('#modalAddContacto #CRRSCNDRIO').val('').prop('readonly', false);
                // LIMPIAR VARIABLE row
                clientesCrud.variables.rowEditContacto = {};
            });

            $(`#modalAddContacto #btnCancelarVisualizacionContacto`).on('click', (e) => {
                e.preventDefault();
                // OCULTAR MODO VISUALIZACION
                $("#modalAddContacto #divVisualizarContacto").addClass('d-none');
                $("#modalAddContacto #btnAgregarContacto").removeClass('d-none');
                // LIMPIAR FORMULARIO Y QUITAR READONLY
                $('#modalAddContacto #NMBRS').val('').prop('readonly', false);
                $('#modalAddContacto #APLLIDS').val('').prop('readonly', false);
                $('#modalAddContacto #GDEMPRSA').val('').trigger('change').prop('disabled', false);
                $('#modalAddContacto #CCRPRTVO').val('').prop('readonly', false);
                $('#modalAddContacto #CRRSCNDRIO').val('').prop('readonly', false);
            });

            // * TABLA CONTACTOS - ELIMINAR
            $(`#modalAddContacto`).on('click', '.delete-contacto-row', function (e) {
                e.preventDefault();
                let data = CcontactosTable.row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                swalFire.confirmar('¿Está seguro de eliminar el contacto?', {
                    1: () => clientesCrud.eventos.DELETE_CONTACTO(data.id)
                });
            });

            // * VISUALIZAR CONTACTO AL HACER CLIC EN LA FILA
            $(`#${contactosTable}`).on('click', 'tbody tr', function (e) {
                // Ignorar si el clic fue en un botón de acción
                if ($(e.target).closest('.edit-contacto-row, .delete-contacto-row, .auditoria-row').length > 0) {
                    return;
                }
                
                let data = CcontactosTable.row(this).data();
                if (!data?.id || data.id <= 0) return;
                
                // Cargar datos en el formulario en modo visualización
                $('#AddContacto #NMBRS').val(data.nmbrs || '').prop('readonly', true);
                $('#AddContacto #APLLIDS').val(data.apllids || '').prop('readonly', true);
                $('#AddContacto #GDEMPRSA').val(data.gdemprsa || '').trigger('change').prop('disabled', true);
                $('#AddContacto #CCRPRTVO').val(data.ccrprtvo || '').prop('readonly', true);
                $('#AddContacto #CRRSCNDRIO').val(data.crrscndrio || '').prop('readonly', true);
                
                // Ocultar todos los botones de acción y mostrar solo visualización
                $('#modalAddContacto #btnAgregarContacto').addClass('d-none');
                $('#modalAddContacto #divEditarContacto').addClass('d-none');
                $('#modalAddContacto #divVisualizarContacto').removeClass('d-none');
            });

            $(`#modalAddContacto`).on('click', '.edit-contacto-row', function (e) {
                e.preventDefault();
                let data = CcontactosTable.row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                clientesCrud.variables.rowEditContacto = data;
                // OCULTAR MODO VISUALIZACION
                $("#modalAddContacto #divVisualizarContacto").addClass('d-none');
                // MOSTRAR BOTONES DE EDICION
                $("#modalAddContacto #divEditarContacto").removeClass('d-none');
                $("#modalAddContacto #btnAgregarContacto").addClass('d-none');
                // CARGAR DATOS EN EL FORMULARIO Y QUITAR READONLY
                $('#modalAddContacto #NMBRS').val(data.nmbrs).prop('readonly', false);
                $('#modalAddContacto #APLLIDS').val(data.apllids).prop('readonly', false);
                $('#modalAddContacto #GDEMPRSA').val(data.gdemprsa).trigger('change').prop('disabled', false);
                $('#modalAddContacto #CCRPRTVO').val(data.ccrprtvo).prop('readonly', false);
                $('#modalAddContacto #CRRSCNDRIO').val(data.crrscndrio).prop('readonly', false);
            });
        },
        variables: {
            rowEdit: {},
            rowEditContacto: {},
        },
        eventos: {
            TABLE: () => {
                if (!CclientesTable) {
                    CclientesTable = $(`#${clientesTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.CLIENTES + 'All',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.IDEMPRSA = IDEMPRSA;
                                d.RUC = $(`#${navsClientes}-filtros #RUC`).val();
                                d.RZNSCL = $(`#${navsClientes}-filtros #RZNSCL`).val();
                                d.GDTIPOPRSNA = $(`#${navsClientes}-filtros #GDTIPOPRSNA`).val();
                                d.CESTDO = func.obtenerCESTDO(clientesTable);
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
                                    return `<div class="d-flex justify-content-center align-items-center flex-nowrap m-0 p-0 gap-1">
                                            <button class='btn btn-sm btn-icon auditoria-row' title='Ver auditoría' tabindex="-1"><i class='bx bx-chevron-right'></i></button>
                                            <span style="min-width:22px;display:inline-block;">${data.rn || meta.row + 1}</span>
                                        </div>
                                    `;
                                }
                            },
                            {
                                data: null,
                                title: 'Empresa / Cliente',
                                render: data => {
                                    return "<div class='d-flex flex-column'>" +
                                        `<span><strong>${data.ruc}</strong></span>` +
                                        `<span>${data.rznscl}</span>` +
                                        `</div>`;
                                }
                            },
                            { data: 'crreo', title: 'Correo' },
                            { data: null, title: "Cliente Desde", render: data => func.formatFecha(data.cdsde, 'DD-MM-YYYY') },
                            {
                                data: null,
                                title: 'Estado',
                                className: 'text-center',
                                render: data => {
                                    return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'}></i></span>`;
                                }
                            },
                            {
                                data: null,
                                title: '',
                                className: 'text-center',
                                render: data => {
                                    // <button name="AGREGAR_CONTACTOS" class="btn btn-sm btn-icon agregar-masivo-contactos-row" title="Agregar contactos masivo"><i class="bx bx-user-plus"></i></button>
                                    return `
                                        <div class="d-flex justify-content-center align-items-center gap-1">
                                            <button name="CONTACTO" class="btn btn-sm btn-icon contacto-row" title="Contacto"><i class="bx bx-user"></i></button>
                                            <button name="EDITAR" class="btn btn-sm btn-icon edit-row" title="Editar"><i class="bx bx-edit"></i></button>
                                            <button name="ELIMINAR" class="btn btn-sm btn-icon delete-row" title="Eliminar"><i class="bx bx-trash"></i></button>
                                        </div>
                                    `;
                                }
                            }
                        ],
                        initComplete: function (settings, json) {
                            $(`#${clientesTable}_filter`).hide();
                        },
                        drawCallback: function (settings) {
                            $(`#${clientesTable}_filter`).hide();
                            $(`#${clientesTable}_wrapper > div:first-child`).removeClass('py-4');
                        },
                        columnDefs: [],
                        buttons: (() => {
                            let buttons = [];

                            return buttons;
                        })()
                    });
                } else {
                    CclientesTable.ajax.reload();
                }
            },
            TABLE_CONTACTS: (IDCLIENTE) => {
                if (!CcontactosTable) {
                    CcontactosTable = $(`#${contactosTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.CONTACTOS + 'all',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.IDCLNTE = clientesCrud.variables.rowEdit.id;
                                d.CESTDO = 'A'
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
                                    return `<div class="d-flex justify-content-center align-items-center flex-nowrap m-0 p-0 gap-1">
                                            <button class='btn btn-sm btn-icon auditoria-row' title='Ver auditoría' tabindex="-1"><i class='bx bx-chevron-right'></i></button>
                                            <span style="min-width:22px;display:inline-block;">${data.rn || meta.row + 1}</span>
                                        </div>
                                    `;
                                }
                            },
                            {
                                data: null, title: 'Nombres',
                                render: data => {
                                    return `<div>${data.nmbrs || ''} ${data.apllids || ''}</div>`;
                                }
                            },
                            { data: 'ccrprtvo', title: 'Email' },
                            {
                                data: null,
                                title: 'Cargo',
                                render: data => {
                                    let cargo = data.dgdemprsa || '';
                                    if (cargo.length > 30) {
                                        cargo = cargo.substring(0, 30) + '...';
                                    }
                                    return `<div title='${data.dgdemprsa || ''}'>${cargo}</div>`;
                                }
                            },
                            {
                                data: null,
                                title: 'Estado',
                                className: 'text-center',
                                render: data => {
                                    return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'}></i></span>`;
                                }
                            },
                            {
                                data: null,
                                title: '',
                                className: 'text-center',
                                orderable: false,
                                render: data => {
                                    // Si hay más de dos acciones, usar dropdown, si no, mostrar botones directos
                                    let actions = [
                                        `<button name="EDITAR" class="btn btn-sm btn-icon p-1 edit-contacto-row" title="Editar"><i class="bx bx-edit"></i></button>`,
                                        `<button name="ELIMINAR" class="btn btn-sm btn-icon p-1 delete-contacto-row" title="Eliminar"><i class="bx bx-trash"></i></button>`
                                    ];
                                    // Si en el futuro hay más de dos acciones, usar dropdown
                                    if (actions.length > 2) {
                                        return `
                                            <div class="dropdown d-flex justify-content-center m-0 p-0">
                                                <button class="btn btn-sm btn-icon dropdown-toggle dropdown-toggle-no-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Acciones">
                                                    <i class="bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                <ul class="dropdown-menu dropdown-menu-end">
                                                    <li>${actions[0]}</li>
                                                    <li>${actions[1]}</li>
                                                    <!-- Agrega más acciones aquí si es necesario -->
                                                </ul>
                                            </div>
                                        `;
                                    } else {
                                        return `<div class="d-flex justify-content-center m-0 p-0">${actions.join('')}</div>`;
                                    }
                                }
                            }
                        ],
                        initComplete: function (settings, json) {
                            $(`#${contactosTable}_filter`).hide();
                        },
                        drawCallback: function (settings) {
                            $(`#${contactosTable}_filter`).hide();
                            $(`#${contactosTable}_wrapper > div:first-child`).removeClass('py-4');
                        },
                        columnDefs: [],
                        buttons: (() => {
                            let buttons = [];
                            return buttons;
                        })()
                    });
                } else {
                    CcontactosTable.ajax.reload();
                }
            },
            INSERT: () => {
                if (!IDEMPRSA || IDEMPRSA <= 0)
                    return swalFire.error('No se ha podido obtener la empresa. Por favor, recargue la página e intente nuevamente.');

                let formData = new FormData();
                formData.append('IDEMPRSA', IDEMPRSA);
                formData.append('RUC', $('#AddCliente #RUC').val());
                formData.append('RZNSCL', $('#AddCliente #RZNSCL').val());
                formData.append('RPRSNTNTE', $('#AddCliente #RPRSNTNTE').val());
                formData.append('NMBRECMRCL', $('#AddCliente #NMBRECMRCL').val());
                formData.append('GDTMPOEMPRESA', $('#AddCliente #GDTMPOEMPRESA').val());
                formData.append('GDTIPOPRSNA', $('#AddCliente #GDTIPOPRSNA').val());
                formData.append('GDSCTRINDSTRIA', $('#AddCliente #GDSCTRINDSTRIA').val());
                formData.append('DRCCN', $('#AddCliente #DRCCN').val());
                formData.append('TLFNO', $('#AddCliente #TLFNO').val());
                formData.append('CDSDE', $('#AddCliente #CDSDE').val());
                formData.append('GDEMPRSA', $('#AddCliente #GDEMPRSA').val());
                formData.append('CRREO', $('#AddCliente #CRREO').val());
                formData.append('CESTDO', $('#AddCliente #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos guardando el registro.']);
                $.ajax({
                    url: uisApis.CLIENTES + 'Add',
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
                                    $('#modalAddCliente').modal('hide');
                                    CclientesTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al guardar el registro')
                });
            },

            // Versión asíncrona para carga masiva desde Excel
            INSERT_ASYNC: (rowObj) => {
                return new Promise((resolve, reject) => {
                    if (!IDEMPRSA || IDEMPRSA <= 0)
                        return reject('No se ha podido obtener la empresa. Por favor, recargue la página e intente nuevamente.');

                    let formData = new FormData();
                    formData.append('IDEMPRSA', IDEMPRSA);
                    formData.append('RUC', rowObj.RUC || '');
                    formData.append('RZNSCL', rowObj.RZNSCL || '');
                    formData.append('RPRSNTNTE', rowObj.RPRSNTNTE || '');
                    formData.append('NMBRECMRCL', rowObj.NMBRECMRCL || '');
                    formData.append('GDTMPOEMPRESA', rowObj.GDTMPOEMPRESA || '');
                    formData.append('GDTIPOPRSNA', rowObj.GDTIPOPRSNA || '');
                    formData.append('GDSCTRINDSTRIA', rowObj.GDSCTRINDSTRIA || '');
                    formData.append('DRCCN', rowObj.DRCCN || '');
                    formData.append('TLFNO', rowObj.TLFNO || '');
                    formData.append('CDSDE', rowObj.CDSDE || '');
                    formData.append('GDEMPRSA', rowObj.GDEMPRSA || '');
                    formData.append('CRREO', rowObj.CRREO || '');
                    formData.append('CESTDO', rowObj.CESTDO || 'A');

                    $.ajax({
                        url: uisApis.CLIENTES + 'Add',
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
                                // si fue exitoso y persona es de tipo JURIDICA ... 
                                // iterar rowObj.CONTACTOS si existe y agregar contactos
                                if (Array.isArray(rowObj.CONTACTOS)) {
                                    const contactosData = rowObj.CONTACTOS.map(contacto => ({
                                        IDCLNTE: data.retorno, // id del cliente recien creado
                                        NMBRS: contacto.NMBRS || '',
                                        APLLIDS: contacto.APLLIDS || '',
                                        GDEMPRSA: contacto.GDEMPRSA || '',
                                        CCRPRTVO: contacto.CCRPRTVO || '',
                                        CRRSCNDRIO: contacto.CRRSCNDRIO || '',
                                        CESTDO: contacto.CESTDO || 'A'
                                    }));
                                    clientesCrud.eventos.INSERT_CONTACTO(contactosData)
                                        .then(() => resolve(data))
                                        .catch(err => reject('Error al insertar contactos: ' + err));
                                } else {
                                    resolve(data);
                                }

                            } else {
                                console.error('Error en INSERT_ASYNC:', data);
                                reject(data?.message || 'Ocurrió un error al procesar la solicitud');
                            }
                        },
                        error: (jqXHR, textStatus, errorThrown) =>
                            console.error('Error AJAX INSERT_ASYNC:', errorThrown) ||
                            reject('Ocurrió un error al guardar el registro')
                    });
                });
            },
            UPDATE: () => {
                let formData = new FormData();
                formData.append('ID', clientesCrud.variables.rowEdit.id);
                formData.append('RUC', $('#EditCliente #RUC').val());
                formData.append('RZNSCL', $('#EditCliente #RZNSCL').val());
                formData.append('RPRSNTNTE', $('#EditCliente #RPRSNTNTE').val());
                formData.append('NMBRECMRCL', $('#EditCliente #NMBRECMRCL').val());
                formData.append('GDTMPOEMPRESA', $('#EditCliente #GDTMPOEMPRESA').val());
                formData.append('GDTIPOPRSNA', $('#EditCliente #GDTIPOPRSNA').val());
                formData.append('GDSCTRINDSTRIA', $('#EditCliente #GDSCTRINDSTRIA').val());
                formData.append('DRCCN', $('#EditCliente #DRCCN').val());
                formData.append('TLFNO', $('#EditCliente #TLFNO').val());
                formData.append('CDSDE', $('#EditCliente #CDSDE').val());
                formData.append('GDEMPRSA', $('#EditCliente #GDEMPRSA').val());
                formData.append('CRREO', $('#EditCliente #CRREO').val());
                formData.append('CESTDO', $('#EditCliente #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el registro.']);
                $.ajax({
                    url: uisApis.CLIENTES + 'Update',
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
                                    $('#modalEditCliente').modal('hide');
                                    CclientesTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al actualizar el registro')
                });
            },
            DELETE: id => {
                let formData = new FormData();
                formData.append('ID', id);

                swalFire.cargando(['Espere un momento', 'Estamos cambiando el estado del registro']);
                $.ajax({
                    url: uisApis.CLIENTES + 'Delete',
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
                                1: () => $(`#${clientesTable}`).DataTable().ajax.reload()
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al cambiar el estado del registro')
                });
            },
            INSERT_CONTACTO: (data = [], reloadChange = false) => {
                return new Promise((resolve, reject) => {
                    let idCliente = clientesCrud.variables.rowEdit?.id;
                    // Permitir pasar el id directamente en los datos (para uso desde INSERT_ASYNC)
                    if ((!idCliente || idCliente <= 0) && data.length > 0 && data[0].IDCLNTE) {
                        idCliente = data[0].IDCLNTE;
                    }
                    if (!idCliente || idCliente <= 0)
                        return reject('No se ha podido obtener el cliente. Por favor, recargue la página e intente nuevamente.');

                    let arrayObjectos = [];
                    if (data.length > 0) {
                        arrayObjectos = data;
                    } else {
                        arrayObjectos.push({
                            IDCLNTE: idCliente,
                            NMBRS: $('#AddContacto #NMBRS').val(),
                            APLLIDS: $('#AddContacto #APLLIDS').val(),
                            GDEMPRSA: $('#AddContacto #GDEMPRSA').val(),
                            CCRPRTVO: $('#AddContacto #CCRPRTVO').val(),
                            CRRSCNDRIO: $('#AddContacto #CRRSCNDRIO').val(),
                            CESTDO: $('#AddContacto #CESTDO').val()
                        });
                    }

                    let formData = new FormData();
                    formData.append('LISTCONTACTOS', JSON.stringify(arrayObjectos));

                    if (reloadChange) {
                        swalFire.cargando(['Espere un momento', 'Estamos guardando el contacto.']);
                    }
                    $.ajax({
                        url: uisApis.CONTACTOS + 'Add',
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
                                if (reloadChange) {
                                    swalFire.success(data?.message || 'Proceso realizado correctamente', '', {
                                        1: () => {
                                            $('#AddContacto #NMBRS').val('');
                                            $('#AddContacto #APLLIDS').val('');
                                            $('#AddContacto #GDEMPRSA').val('').trigger('change');
                                            $('#AddContacto #CCRPRTVO').val('');
                                            $('#AddContacto #CRRSCNDRIO').val('');
                                            if (reloadChange) {
                                                CcontactosTable.ajax.reload();
                                            }
                                        }
                                    });
                                }
                                resolve(data);
                            } else {
                                reject(data?.message || 'Ocurrió un error al procesar la solicitud');
                            }
                        },
                        error: (jqXHR, textStatus, errorThrown) => {
                            swalFire.error('Ocurrió un error al guardar el contacto');
                            reject('Ocurrió un error al guardar el contacto');
                        }
                    });
                });
            },
            UPDATE_CONTACTO: () => {
                if (!clientesCrud.variables.rowEditContacto?.id || clientesCrud.variables.rowEditContacto.id <= 0)
                    return swalFire.error('No se ha podido obtener el contacto. Por favor, recargue la página e intente nuevamente.');

                let formData = new FormData();
                formData.append('ID', clientesCrud.variables.rowEditContacto.id);
                formData.append('NMBRS', $('#AddContacto #NMBRS').val());
                formData.append('APLLIDS', $('#AddContacto #APLLIDS').val());
                formData.append('GDEMPRSA', $('#AddContacto #GDEMPRSA').val());
                formData.append('CCRPRTVO', $('#AddContacto #CCRPRTVO').val());
                formData.append('CRRSCNDRIO', $('#AddContacto #CRRSCNDRIO').val());
                formData.append('CESTDO', $('#AddContacto #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el contacto.']);
                $.ajax({
                    url: uisApis.CONTACTOS + 'Update',
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
                                    $("#modalAddContacto #divEditarContacto").addClass('d-none');
                                    $("#modalAddContacto #btnAgregarContacto").removeClass('d-none');
                                    $('#AddContacto #NMBRS').val('');
                                    $('#AddContacto #APLLIDS').val('');
                                    $('#AddContacto #GDEMPRSA').val('').trigger('change');
                                    $('#AddContacto #CCRPRTVO').val('');
                                    $('#AddContacto #CRRSCNDRIO').val('');
                                    clientesCrud.variables.rowEditContacto = {};
                                    CcontactosTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al actualizar el contacto')
                });
            },
            DELETE_CONTACTO: id => {
                let formData = new FormData();
                formData.append('ID', id);

                swalFire.cargando(['Espere un momento', 'Estamos eliminando el contacto.']);
                $.ajax({
                    url: uisApis.CONTACTOS + 'Delete',
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
                                1: () => CcontactosTable.ajax.reload()
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el contacto')
                });
            }
        },
        formularios: {},
        validaciones: {
            INSERT: {
                RZNSCL: agregarValidaciones({
                    required: true
                })
            },
            UPDATE: {
                RZNSCL: agregarValidaciones({
                    required: true
                })
            }
        }
    };

    const equiposCrud = {
        init: () => {
            $(`#${navsEquipos}-filtros input, #${navsEquipos}-filtros select`).val('');
            equiposCrud.eventos.TABLE();
        },
        globales: () => {
            // * MODALES
            $("#modalAddEquipo").on('shown.bs.modal', function () {
                configFormVal("AddEquipo",
                    equiposCrud.validaciones.INSERT, () => equiposCrud.eventos.INSERT());
            });

            $("#modalEditEquipo").on('shown.bs.modal', function () {
                configFormVal('EditEquipo', equiposCrud.validaciones.UPDATE, () => equiposCrud.eventos.UPDATE());
                func.actualizarForm('EditEquipo', equiposCrud.variables.rowEdit);

                $('#EditEquipo #ABOGDOS')[0].__tagify.removeAllTags();
                $('#EditEquipo #ABOGDOS')[0].__tagify.addTags(
                    usersList.filter(u => equiposCrud.variables.rowEdit.abogdos.split(',').includes(u.value.toString()))
                );
            });

            // * BOTONES
            $(`#${navsEquipos}-filtros-buscar`).on('click', () => equiposCrud.eventos.TABLE());

            $(`#${navsEquipos}-filtros-agregar`).on('click', (E) => {
                $('#modalAddEquipo').modal('show');
            });

            // * TABLA EQUIPOS - EDITAR
            $(`#${equiposTable}`).on('click', '.edit-row', function () {
                let data = $(`#${equiposTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se ha podido obtener el identificador del registro');
                equiposCrud.variables.rowEdit = data;
                $('#EditEquipo #ABOGDOS')[0].__tagify.removeAllTags();
                $('#EditEquipo #ABOGDOS')[0].__tagify.addTags(
                    usersList.filter(u => equiposCrud.variables.rowEdit.abogdos.split(',').includes(u.value.toString()))
                );
                $('#modalEditEquipo').modal('show');
            });

            // * TABLA EQUIPOS - ELIMINAR
            $(`#${equiposTable}`).on('click', '.delete-row', function () {
                let data = $(`#${equiposTable}`).DataTable().row($(this).parents('tr')).data();
                if (!data?.id || data.id <= 0) return swalFire.error('No se ha podido obtener el identificador del registro');
                swalFire.confirmar('¿Está seguro de cambiar el estado del equipo?', {
                    1: () => equiposCrud.eventos.DELETE(data.id)
                });
            });
        },
        variables: {
            rowEdit: {},
        },
        eventos: {
            TABLE: () => {
                if (!CequiposTable) {
                    CequiposTable = $(`#${equiposTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.EQUIPOS + 'All',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.IDEMPRSA = IDEMPRSA;
                                d.NMBREEQUPO = $(`#${navsEquipos}-filtros #NMBREEQUPO`).val();
                                d.ABOGDOS = JSON.parse($(`#${navsEquipos}-filtros #ABOGDOS`).val() || '[]').map(abogado => abogado.value).join(',');
                                d.CESTDO = func.obtenerCESTDO(equiposTable);
                            }
                        },
                        columns: [
                            {
                                data: null,
                                title: '',
                                orderable: false,
                                className: 'text-center',
                                render: function (data, type, row, meta) {
                                    return `
                                        <div style="display:flex;align-items:center;justify-content:center;gap:4px;">
                                            <button class='btn btn-sm btn-icon auditoria-row' title='Ver auditoría' tabindex="-1"><i class='bx bx-chevron-right'></i></button>
                                            <span style="min-width:22px;display:inline-block;">${data.rn || meta.row + 1}</span>
                                        </div>
                                    `;
                                }
                            },
                            { data: 'nmbreequpo', title: 'Nombre del Equipo' },
                            {
                                data: null, title: "Cantidad Abogados",
                                className: 'text-center',
                                render: data => data.abogdos ? data.abogdos.split(',').length : 0
                            },
                            {
                                data: null,
                                title: 'Estado',
                                className: 'text-center',
                                render: data => {
                                    return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'}></i></span>`;
                                }
                            },
                            {
                                data: null,
                                title: '',
                                className: 'text-center',
                                orderable: false,
                                render: data => {
                                    let actions = [
                                        `<button name="EDITAR" class="btn btn-sm btn-icon edit-row" title="Editar"><i class="bx bx-edit"></i></button>`,
                                        `<button name="ELIMINAR" class="btn btn-sm btn-icon delete-row" title="Eliminar"><i class="bx bx-trash"></i></button>`
                                    ];
                                    if (actions.length > 2) {
                                        return `
                                            <div class="dropdown d-flex justify-content-center m-0 p-0">
                                                <button class="btn btn-sm btn-icon dropdown-toggle dropdown-toggle-no-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Acciones">
                                                    <i class="bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                <ul class="dropdown-menu dropdown-menu-end">
                                                    <li>${actions[0]}</li>
                                                    <li>${actions[1]}</li>
                                                </ul>
                                            </div>
                                        `;
                                    } else {
                                        return `<div class="d-flex justify-content-center m-0 p-0">${actions.join('')}</div>`;
                                    }
                                }
                            }
                        ],
                        initComplete: function (settings, json) {
                            $(`#${equiposTable}_filter`).hide();
                        },
                        drawCallback: function (settings) {
                            $(`#${equiposTable}_filter`).hide();
                            $(`#${equiposTable}_wrapper > div:first-child`).removeClass('py-4');
                        },
                        columnDefs: [],
                        buttons: (() => {
                            let buttons = [];
                            return buttons;
                        })()
                    });
                } else {
                    CequiposTable.ajax.reload();
                }
            },
            INSERT: () => {
                let abogdosRaw = $('#AddEquipo #ABOGDOS').val();
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

                let formData = new FormData();
                formData.append('IDEMPRSA', IDEMPRSA);
                formData.append('NMBREEQUPO', $('#AddEquipo #NMBREEQUPO').val());
                formData.append('ABOGDOS', ABOGDOS);

                swalFire.cargando(['Espere un momento', 'Estamos guardando el registro.']);
                $.ajax({
                    url: uisApis.EQUIPOS + 'Add',
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
                                1: () => {
                                    $('#modalAddEquipo').modal('hide');
                                    CequiposTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al cambiar el estado del registro')
                });
            },
            UPDATE: () => {
                let abogdosRaw = $('#EditEquipo #ABOGDOS').val();
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
                let formData = new FormData();
                formData.append('ID', equiposCrud.variables.rowEdit.id);
                formData.append('NMBREEQUPO', $('#EditEquipo #NMBREEQUPO').val());
                formData.append('ABOGDOS', ABOGDOS);

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el registro.']);
                $.ajax({
                    url: uisApis.EQUIPOS + 'Update',
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
                                1: () => {
                                    $('#modalEditEquipo').modal('hide');
                                    CequiposTable.ajax.reload();
                                }
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al cambiar el estado del registro')
                });
            },
            DELETE: id => {
                let formData = new FormData();
                formData.append('ID', id);
                swalFire.cargando(['Espere un momento', 'Estamos cambiando el estado del registro']);
                $.ajax({
                    url: uisApis.EQUIPOS + 'Delete',
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
                                1: () => $(`#${equiposTable}`).DataTable().ajax.reload()
                            });
                        }
                        if (data?.codEstado <= 0) swalFire.error('Ocurrió un error al procesar la solicitud');
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al cambiar el estado del registro')
                });
            }
        },
        formularios: {
        },
        validaciones: {
            INSERT: {
                NMBREEQUPO: agregarValidaciones({
                    required: true
                }),
                ABOGDOS: agregarValidaciones({
                    required: true
                }),
            },
            UPDATE: {
                NMBREEQUPO: agregarValidaciones({
                    required: true
                }),
                ABOGDOS: agregarValidaciones({
                    required: true
                }),
            }
        }
    }

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
                    const [grupoDatosRes, abogadosRes, equiposRes, clientesRes] = await Promise.all([
                        // 1. Grupo de datos (Áreas y Estados)
                        $.ajax({
                            url: uisApis.GRUPODATOS + 'ObtenerAll',
                            type: 'GET',
                            beforeSend: xhr => xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken')),
                            data: { GDTOS: 'GDAREACSO,GDESTDOPRCSL,GDTMPOEMPRESA,GDTIPOPRSNA,GDSCTRINDSTRIA,GDEMPRSA,GDRSLTDOCSO,GDACCNSCMRCLS' }
                        }),
                        // 2. Abogados
                        $.ajax({
                            url: `${uisApis.ABOGADOS}Buscar&IDEMPRSA=${IDEMPRSA}&start=0&length=1000&CESTDO=A`,
                            type: 'GET',
                            beforeSend: xhr => xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null))
                        }),
                        // 3. Equipos
                        $.ajax({
                            url: `${uisApis.EQUIPOS}All&start=0&length=10000&CESTDO=A&IDEMPRSA=${IDEMPRSA}`,
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
                        ['GDAREACSO', 'GDESTDOPRCSL', 'GDTMPOEMPRESA', 'GDTIPOPRSNA', 'GDSCTRINDSTRIA', 'GDEMPRSA', 'GDRSLTDOCSO', 'GDACCNSCMRCLS'].forEach(grupo => {
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

                    // * Procesar Equipos
                    if (equiposRes?.data) {
                        SELECTS_LIST['EQUIPOS'] = equiposRes.data;
                        globalCrud.eventos.llenarSelect(
                            ['IDEQPO'],
                            equiposRes.data.map(e => ({ id: e.id, text: e.nmbreequpo }))
                        );
                    }

                    // * Procesar Clientes
                    if (clientesRes?.data) {
                        SELECTS_LIST['CLIENTES'] = clientesRes.data;
                        globalCrud.eventos.llenarSelect(
                            ['IDCLIENTE'],
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
            clientesCrud.globales();
            equiposCrud.globales();


            var myTabs = document.querySelectorAll('.erp-tabs button');
            myTabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    const tabPane = tab.getAttribute('data-bs-target');

                    if (tabPane === '#navs-casos') {
                        casosCrud.init();
                    }

                    if (tabPane === '#navs-clientes') {
                        clientesCrud.init();
                    }

                    if (tabPane === '#navs-equipos') {
                        equiposCrud.init();
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
