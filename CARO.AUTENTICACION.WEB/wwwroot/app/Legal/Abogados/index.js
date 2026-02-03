/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    const uisApis = {
        API: '/Legal/Abogados/Index?handler',
        PER: '/Usuarios/Personas/Index?handler',
        GD: '/Seguridad/GrupoDato/Index?handler',
        EQUIPOS: '/Comercial/Gestion/Index?handler=Equipment',
        ABOGADOS: '/Legal/Abogados/Index?handler=',
    };

    // * VARIABLES
    let abogadosTable = 'abogadosTable';
    let CabogadosTable = null;
    let calendar = null;
    let bsAddEventSidebar = null;
    let fechaGlobal = null;
    let diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let coloresBEBE = ['warning', 'danger', 'success', 'info', 'primary', 'secondary'];

    let IDEMPRSA = null;
    let SELECTS_LIST = {};
    let usersList = [];

    let navsEquipos = 'navs-equipos';
    let equiposTable = 'equiposTable';
    let CequiposTable = null;

    // * TABLAS
    const abogadosCrud = {
        init: () => {
            abogadosCrud.eventos.TABLE();
        },
        globales: () => {
            // * MODALES
            $('#modalAddAbogado').on('show.bs.modal', function (e) {
                configFormVal('AddAbogado', abogadosCrud.validaciones.INSERT, () => abogadosCrud.eventos.INSERT());
            });

            $('#modalEditAbogado').on('show.bs.modal', function (e) {
                configFormVal('EditAbogado', abogadosCrud.validaciones.UPDATE, () => abogadosCrud.eventos.UPDATE());
                func.actualizarForm('EditAbogado', abogadosCrud.variables.rolEdit);
                $('#EditAbogado #GDESPCLDD').val(abogadosCrud.variables.rolEdit.gdespcldd ? abogadosCrud.variables.rolEdit.gdespcldd.split(',') : []).trigger('change');
                $('#EditAbogado #GDSCRSLS').val(abogadosCrud.variables.rolEdit.gdscrsls ? abogadosCrud.variables.rolEdit.gdscrsls.split(',') : []).trigger('change');

            });

            // * FORMULARIOS
            $(`#${abogadosTable}`).on('click', '.edit-row-button', function () {
                const data = CabogadosTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                abogadosCrud.variables.rolEdit = data;
                $('#modalEditAbogado').modal('show');
            });

            $(`#${abogadosTable}`).on('click', '.delete-row-button', function () {
                const data = CabogadosTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                swalFire.confirmar('¿Está seguro de eliminar el registro?', {
                    1: () => abogadosCrud.eventos.DELETE(data.id)
                });
            });

            $(`#${abogadosTable}`).on('click', '.view-row-button', function () {
                const data = CabogadosTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                abogadosCrud.variables.rolEdit = data;
                redirect(true, 'navs-horarios', data.id);
            });
        },
        variables: {
            rolEdit: {}
        },
        eventos: {
            TABLE: () => {
                $(`#${abogadosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

                if (!CabogadosTable) {
                    CabogadosTable = $(`#${abogadosTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.API + '=Buscar',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.CESTDO = func.obtenerCESTDO(abogadosTable);
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
                            {
                                data: null,
                                title: 'Abogado',
                                className: 'text-left',
                                render: data => {
                                    const name = data?.nmbrs || '';
                                    const dcumnto = data?.dcumnto || '';
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
                                            <small class="text-muted">${dcumnto}</small>
                                            <span class="fw-medium">${name}</span>
                                          </div>
                                      </div>
                                  `;
                                }
                            },
                            { data: 'dgdespcldd', title: 'Especialidad' },
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
                                        <button name="EDITAR" class="btn btn-sm btn-icon edit-row-button" title="Editar"><i class="bx bx-edit"></i></button>
                                        <button name="ELIMINAR" class="btn btn-sm btn-icon delete-row-button" title="Eliminar"><i class="bx bx-trash"></i></button>
                                        <button name="VER" class="btn btn-sm btn-icon view-row-button" title="Ver"><i class="bx bx-show"></i></button>
                                    </div>`;
                                }
                            }
                        ],
                        initComplete: function (settings, json) {
                            if ($(`#${abogadosTable}`).find('.radio-buttons').length == 0) {
                                $(`#${abogadosTable}_filter`).append(radio_group_estados);

                                $(`#${abogadosTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                                    $(`#${abogadosTable}`).DataTable().ajax.reload();
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
                                    $('#modalAddAbogado').modal('show');
                                }
                            });

                            return buttons;
                        })()
                    });
                } else {
                    CabogadosTable.ajax.reload();
                }
            },
            INSERT: () => {
                let formData = new FormData();
                formData.append('IDPRSNA', $('#AddAbogado #IDPRSNA').val());
                formData.append('NCLGTRA', $('#AddAbogado #NCLGTRA').val());
                formData.append('GDESPCLDD', $('#AddAbogado #GDESPCLDD').val());
                formData.append('NLICNCIA', $('#AddAbogado #NLICNCIA').val());
                formData.append('GDSCRSLS', $('#AddAbogado #GDSCRSLS').val());
                formData.append('CESTDO', $('#AddAbogado #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos registrando el abogado']);
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
                            swalFire.success('Abogado registrado correctamente', '', {
                                1: () => {
                                    $('#modalAddAbogado').modal('hide');
                                    CabogadosTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el registro')
                });
            },
            UPDATE: () => {
                let formData = new FormData();
                formData.append('ID', abogadosCrud.variables.rolEdit.id);
                formData.append('IDPRSNA', $('#EditAbogado #IDPRSNA').val());
                formData.append('NCLGTRA', $('#EditAbogado #NCLGTRA').val());
                formData.append('GDESPCLDD', $('#EditAbogado #GDESPCLDD').val());
                formData.append('NLICNCIA', $('#EditAbogado #NLICNCIA').val());
                formData.append('GDSCRSLS', $('#EditAbogado #GDSCRSLS').val());
                formData.append('CESTDO', $('#EditAbogado #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el registro']);
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
                            swalFire.success('Registro actualizado correctamente', '', {
                                1: () => {
                                    $('#modalEditAbogado').modal('hide');
                                    CabogadosTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el registro')
                });
            },
            DELETE: id => {
                let formData = new FormData();
                formData.append('ID', id);

                swalFire.cargando(['Espere un momento', 'Estamos eliminando el registro']);
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
                            swalFire.success('Registro eliminado correctamente', '', {
                                1: () => $(`#${abogadosTable}`).DataTable().ajax.reload()
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el registro')
                });
            },
        },
        formularios: {},
        validaciones: {
            INSERT: {
                IDPRSNA: agregarValidaciones({
                    required: true
                }),
            },
            UPDATE: {
                IDPRSNA: agregarValidaciones({
                    required: true
                }),
            }
        }
    };

    const horariosCrud = {
        init: () => {
            horariosCrud.eventos.RELOADCALENDAR();
        },
        globales: () => {
            $('#addEventSidebar').on('hidden.bs.offcanvas', function () {
                fechaGlobal = null;
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
                const $addEventSidebar = $(eventSidebarSelector);
                const $calendarEl = $(calendarSelector);
                const $offcanvasTitle = $(offcanvasTitleSelector);
                bsAddEventSidebar = new bootstrap.Offcanvas($addEventSidebar[0]);

                const modifyToggler = () => { };

                const eventClick = async ({ event }) => {
                    $('#AddCalendar .is-invalid').removeClass('is-invalid');
                    func.resetAll('#' + formSelector, true);
                    const eventDetails = event._def.extendedProps;
                    horariosCrud.variables.rowEdit = eventDetails;

                    func.actualizarForm(formSelector, eventDetails);
                    $offcanvasTitle.text('Actualizar');
                    $(`#${formSelector} #btnDeleteCalendar`).show();
                    $(`#${formSelector} #btnRegisterCalendar`).show();
                    bsAddEventSidebar.show();
                };

                const dateClick = info => {
                    $('#AddCalendar .is-invalid').removeClass('is-invalid');
                    func.resetAll('#' + formSelector, true);
                    let fecha = new Date(info.date);
                    horariosCrud.variables.rowEdit = {
                        FCHA: fecha,
                        IDDIA: fecha.getDay() == 0 ? 7 : fecha.getDay(),
                        NDIA: diasSemana[fecha.getDay()],
                    };

                    $("#AddCalendar #FCHA")[0]._flatpickr.setDate(fecha);
                    fechaGlobal = fecha;

                    bsAddEventSidebar.show();
                    $offcanvasTitle.text('Agregar');
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
                        start: 'prev,next, title',
                        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                    },
                    eventClick: info => {
                        eventClick(info);
                    },
                    dateClick: info => {
                        dateClick(info);
                    },
                    datesSet: function (info) {
                        let currentMonth = info.view.currentStart.getMonth() + 1; // +1 porque getMonth() es 0-indexado
                        let currentYear = info.view.currentStart.getFullYear();
                        let periodo = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
                        horariosCrud.eventos.RELOADCALENDAR(periodo);
                    },
                    eventClassNames: function ({ event: calendarEvent }) {
                        $('.fc-event-time').remove();
                        let valores = calendarEvent._def.extendedProps;
                        let aleatorio = Math.floor(Math.random() * coloresBEBE.length);
                        if (moment(valores.EVENTSTARTDATE).isBefore(moment(), 'day')) return ['fc-event-' + coloresBEBE[aleatorio], 'fc-event-past'];
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
                if (!horariosCrud.variables.rowEdit.ID) horariosCrud.eventos.INSERT();
                else horariosCrud.eventos.UPDATE();
            });

            $('#AddCalendar #btnDeleteCalendar').on('click', function () {
                horariosCrud.eventos.DELETE(horariosCrud.variables.rowEdit.ID);
            });
        },
        variables: {
            rowEdit: {}
        },
        eventos: {
            RELOADCALENDAR: async (periodo) => {
                // pp-overlay
                $('.app-overlay').show();
                await $.ajax({
                    url: uisApis.API + `=BuscarHorarios&start=0&CESTDO=&IDABGDO=${abogadosCrud.variables.rolEdit.id}&length=1000&draw=1&PRDO=${periodo || moment().format('YYYY-MM')})`,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                    },
                    success: function (response) {
                        let events = response?.data.length > 0 ? response.data.map(d => {
                            return {
                                id: d.id,
                                title: d.hrainit + ' - ' + d.hrafn,
                                start: new Date(d.fcha),
                                end: new Date(d.fcha),
                                extendedProps: {
                                    ID: d.id,
                                    EVENTTITLE: d.hrainit + ' - ' + d.hrafn,
                                    EVENTSTARTDATE: d.fcha,
                                    HRAINIT: d.hrainit,
                                    HRAFN: d.hrafn,
                                    FCHA: d.fcha,
                                    CESTDO: d.cestdo,
                                }
                            };
                        }) : [];

                        calendar.removeAllEvents();
                        calendar.addEventSource(events);
                        calendar.render();
                    }
                });
            },
            INSERT: () => {
                let errores = 0;
                errores += horariosCrud.eventos.VALIDATE($('#AddCalendar #HRAINIT'), /^[0-9]{2}:[0-9]{2}$/);
                errores += horariosCrud.eventos.VALIDATE($('#AddCalendar #HRAFN'), /^[0-9]{2}:[0-9]{2}$/);

                if (errores > 0) return;
                if (!abogadosCrud.variables.rolEdit.id) return swalFire.error('Seleccione un abogado');

                let fechaFormateada = moment(fechaGlobal).format('YYYY-MM-DD');
                let formData = new FormData();
                formData.append('IDABGDO', abogadosCrud.variables.rolEdit.id);
                formData.append('FCHA', fechaFormateada);
                formData.append('HRAINIT', $('#AddCalendar #HRAINIT').val());
                formData.append('HRAFN', $('#AddCalendar #HRAFN').val());
                formData.append('CESTDO', 'A');

                swalFire.cargando(['Espere un momento', 'Estamos registrando la información']);
                $.ajax({
                    url: uisApis.API + '=AddHorarios',
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
                            swalFire.success('Información registrada correctamente', '', {
                                1: () => {
                                    let mes = moment($('#AddCalendar #FCHA').val()).format('YYYY-MM');
                                    horariosCrud.variables.rowEdit = {};
                                    $('#AddCalendar').trigger('reset');
                                    bsAddEventSidebar.hide();
                                    horariosCrud.eventos.RELOADCALENDAR(mes);
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al agregar la información')
                });
            },
            UPDATE: () => {
                let errores = 0;
                errores += horariosCrud.eventos.VALIDATE($('#AddCalendar #HRAINIT'), /^[0-9]{2}:[0-9]{2}$/);
                errores += horariosCrud.eventos.VALIDATE($('#AddCalendar #HRAFN'), /^[0-9]{2}:[0-9]{2}$/);

                if (errores > 0) return;

                let formData = new FormData();
                formData.append('ID', horariosCrud.variables.rowEdit.ID);
                formData.append('FCHA', $('#AddCalendar #FCHA').val());
                formData.append('HRAINIT', $('#AddCalendar #HRAINIT').val());
                formData.append('HRAFN', $('#AddCalendar #HRAFN').val());
                formData.append('CESTDO', horariosCrud.variables.rowEdit.CESTDO);

                swalFire.cargando(['Espere un momento', 'Estamos actualizando la información']);
                $.ajax({
                    url: uisApis.API + '=UpdateHorarios',
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
                            swalFire.success('Información actualizada correctamente', '', {
                                1: () => {
                                    let mes = moment(horariosCrud.variables.rowEdit.fcha).format('YYYY-MM');
                                    $('#AddCalendar').trigger('reset');
                                    bsAddEventSidebar.hide();
                                    horariosCrud.eventos.RELOADCALENDAR(mes);
                                    horariosCrud.variables.rowEdit = {};
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) =>
                        swalFire.error('Ocurrió un error al actualizar la información')
                });
            },
            DELETE: id => {
                if (!id) return swalFire.error('No se encontró el identificador del registro');

                let formData = new FormData();
                formData.append('ID', id);

                swalFire.cargando(['Espere un momento', 'Estamos eliminando la información']);
                $.ajax({
                    url: uisApis.API + '=DeleteHorarios',
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
                            swalFire.success('Información eliminada correctamente', '', {
                                1: () => {
                                    let mes = moment(horariosCrud.variables.rowEdit.fcha).format('YYYY-MM');
                                    $('#AddCalendar').trigger('reset');
                                    bsAddEventSidebar.hide();
                                    horariosCrud.eventos.RELOADCALENDAR(mes);
                                    horariosCrud.variables.rowEdit = {};
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar la información')
                });
            },
            VALIDATE: (referencia, regex = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]+$/) => {
                if (regex.test(referencia.val())) {
                    referencia.removeClass('is-invalid');
                    return 0;
                } else {
                    referencia.addClass('is-invalid');
                    return 1;
                }
            },
        },
        formularios: {},
        validaciones: {
            INSERT: {
                GDPDRE: agregarValidaciones({
                    required: true
                }),
                DGDTLLE: agregarValidaciones({
                    required: true
                }),
                GDTPO: agregarValidaciones({
                    required: true
                }),
                DTLLE: agregarValidaciones({
                    required: true
                }),
                VLR1: agregarValidaciones({
                    required: true
                })
            },
            UPDATE: {
                DGDTLLE: agregarValidaciones({
                    required: true
                }),
                GDTPO: agregarValidaciones({
                    required: true
                }),
                DTLLE: agregarValidaciones({
                    required: true
                }),
                VLR1: agregarValidaciones({
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
        init: async () => {
            await globalCrud.eventos.selects2();
        },
        eventos: {
            selects2: async () => {
                const GRUPODATOS = 'GDESPCLDD,GDSCRSLS';
                const API1 = `${uisApis.PER}=Buscar&CESTDO=A&start=0&length=1000`;
                const API2 = `${uisApis.GD}=ObtenerAll`;
                const accessToken = localStorage.getItem('accessToken');

                // Ejecutar ambas llamadas en paralelo
                const [response1, response2, abogadosRes] = await Promise.all([
                    // 1. Personas
                    $.ajax({
                        url: API1,
                        beforeSend: (xhr) => xhr.setRequestHeader('XSRF-TOKEN', accessToken),
                        type: 'GET',
                    }).catch(err => {
                        console.error('Error al obtener datos de personas', err);
                        return null;
                    }),
                    // 2. Grupo Dato
                    $.ajax({
                        url: API2,
                        beforeSend: (xhr) => xhr.setRequestHeader('XSRF-TOKEN', accessToken),
                        type: 'GET',
                        data: { GDTOS: GRUPODATOS },
                    }).catch(err => {
                        console.error('Error al obtener datos de grupo dato', err);
                        return null;
                    }),
                    // 3. Abogados
                    $.ajax({
                        url: `${uisApis.ABOGADOS}Buscar&IDEMPRSA=${IDEMPRSA}&start=0&length=1000&CESTDO=A`,
                        type: 'GET',
                        beforeSend: xhr => xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null))
                    }).catch(err => {
                        console.error('Error al obtener datos de abogados', err);
                        return null;
                    })
                ]);

                // Poblar selectores de personas (una sola asignación de innerHTML)
                if (response1?.data?.length) {
                    const personasOptions = [
                        '<option value="">-- Seleccione --</option>',
                        ...response1.data.map(d => `<option value="${d.id}">${d.ncmpto}</option>`)
                    ].join('');

                    document.querySelectorAll('#EditAbogado #IDPRSNA, #AddAbogado #IDPRSNA')
                        .forEach(selector => selector.innerHTML = personasOptions);
                }

                // Poblar selectores de grupo dato (una sola asignación por selector)
                if (response2?.data?.length) {
                    const grupoDatoIds = GRUPODATOS.split(',').map(d => d.trim());

                    grupoDatoIds.forEach(gdId => {
                        const options = response2.data.filter(d => d.gdpdre === gdId);

                        document.querySelectorAll(`#${gdId}`).forEach(selector => {
                            // Si es select multiple, no incluir "-- Seleccione --"
                            const isMultiple = selector.hasAttribute('multiple');
                            const optionsHTML = [
                                ...(isMultiple ? [] : ['<option value="">-- Seleccione --</option>']),
                                ...options.map(d => `<option value="${d.vlR1}">${d.dtlle}</option>`)
                            ].join('');

                            selector.innerHTML = optionsHTML;
                        });
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

                    ['#navs-equipos #ABOGDOS', '#modalAddEquipo #ABOGDOS', '#modalEditEquipo #ABOGDOS'].forEach(selector => {
                        const element = document.querySelector(selector);
                        if (element) tagsTagify(element, usersList);
                    });
                }
            }
        }
    };


    return {
        init: async () => {
            IDEMPRSA = func.IDEMPRESA();
            await func.limitarCaracteres();
            await func.datepickerListModify();

            await globalCrud.init();
            abogadosCrud.init();
            abogadosCrud.globales();
            horariosCrud.globales();
            equiposCrud.globales();

            var myTabs = document.querySelectorAll('.erp-tabs button');
            myTabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    const tabPane = tab.getAttribute('data-bs-target');
                    if (tabPane === '#navs-abogados') {
                        redirect(false, 'navs-horarios', 0);
                        abogadosCrud.eventos.TABLE();
                    }

                    if (tabPane === '#navs-horarios') {
                        horariosCrud.init();
                    }

                    if (tabPane === '#navs-equipos') {
                        equiposCrud.init();
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
