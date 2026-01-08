/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    const uisApis = {
        API: '/Legal/Abogados/Index?handler',
        PER: '/Usuarios/Personas/Index?handler',
        GD: '/Seguridad/GrupoDato/Index?handler'
    };

    // * VARIABLES
    let abogadosTable = 'abogadosTable';
    let CabogadosTable = null;
    let calendar = null;
    let bsAddEventSidebar = null;
    let fechaGlobal = null;
    let diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let coloresBEBE = ['warning', 'danger', 'success', 'info', 'primary', 'secondary'];

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
                            { data: 'rn', title: '' },
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
                            { data: 'uedcn', title: 'U. Edición' },
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
                                className: 'btn btn-label-primary btn-add-new',
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
                if(!id) return swalFire.error('No se encontró el identificador del registro');

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

    const globalCrud = {
        init: async () => {
            await globalCrud.eventos.selects2();
        },
        eventos: {
            selects2: async () => {
                const GRUPODATOS = 'GDESPCLDD,GDSCRSLS';
                const API1 = `${uisApis.PER}=Buscar&CESTDO=A&start=0&length=1000`;
                const API2 = `${uisApis.GD}=ObtenerAll`;

                const response1 = await $.ajax({
                    url: API1,
                    beforeSend: (xhr) => xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken')),
                    type: 'GET',
                }).catch(err => {
                    console.error('Error al obtener datos de API1', err);
                    return null;
                });

                if (response1?.data) {
                    let selectores = document.querySelectorAll('#EditAbogado #IDPRSNA, #AddAbogado #IDPRSNA');
                    selectores.forEach(selector => {
                        selector.innerHTML = '<option value="">-- Seleccione --</option>';
                        response1.data.forEach(d => {
                            selector.innerHTML += `<option value="${d.id}">${d.ncmpto}</option>`;
                        });
                    });
                }

                const response2 = await $.ajax({
                    url: API2,
                    beforeSend: (xhr) => xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken')),
                    type: 'GET',
                    data: { GDTOS: GRUPODATOS },
                }).catch(err => {
                    console.error('Error al obtener datos de API2', err);
                    return null;
                });

                if (response2?.data) {
                    let arraySelectores = GRUPODATOS.split(',').map(d => "#" + d.trim());
                    let selectores = document.querySelectorAll(arraySelectores.join(', '));

                    selectores.forEach(selector => {
                        let options = response2.data.filter(d => d.gdpdre === selector.id);
                        selector.innerHTML = '<option value="">-- Seleccione --</option>';
                        options.forEach(d => {
                            selector.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
                        });
                    });
                }
            }
        }
    };


    return {
        init: async () => {
            await func.limitarCaracteres();
            await func.datepickerListModify();

            await globalCrud.init();
            abogadosCrud.init();
            abogadosCrud.globales();
            horariosCrud.globales();

            var myTabs = document.querySelectorAll('.nav-tabs button');
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
