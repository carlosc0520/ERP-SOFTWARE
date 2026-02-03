/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    const uisApis = {
        API: '/CanalDenuncias/Configuracion/Index?handler',
        MR: '/Seguridad/Marcas/Index?handler',
        GD: '/Seguridad/GrupoDato/Index?handler',
        ROL: '/Usuarios/Roles/Index?handler',
        PER: '/Usuarios/Personas/Index?handler',
    };

    // * VARIABLES
    let tipodenunciaTable = 'tipodenunciaTable';
    let relacionempresaTable = 'relacionempresaTable';
    let receptoresTable = 'receptoresTable';
    let receptoresUsersTable = 'receptoresUsersTable';
    let CtipodenunciaTable = null;
    let CrelacionempresaTable = null;
    let CreceptoresTable = null;
    let CreceptoresUsersTable = null;

    // * TABLAS
    const tipoDenunciaCrud = {
        init: () => {
            tipoDenunciaCrud.eventos.TABLE();
        },
        globales: () => {
            // * MODALES
            $('#modalAddTipoDenuncia').on('show.bs.modal', function (e) {
                configFormVal('AddTipoDenuncia', tipoDenunciaCrud.validaciones.INSERT, () => tipoDenunciaCrud.eventos.INSERT());
            });

            $('#modalEditTipoDenuncia').on('show.bs.modal', function (e) {
                configFormVal('EditTipoDenuncia', tipoDenunciaCrud.validaciones.UPDATE, () => tipoDenunciaCrud.eventos.UPDATE());
                func.actualizarForm('EditTipoDenuncia', tipoDenunciaCrud.variables.rowEdit);
            });

            // * FORMULARIOS
            $(`#${tipodenunciaTable}`).on('click', '.edit-row-button', function () {
                const data = CtipodenunciaTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                tipoDenunciaCrud.variables.rowEdit = data;
                $('#modalEditTipoDenuncia').modal('show');
            });

            $(`#${tipodenunciaTable}`).on('click', '.delete-row-button', function () {
                const data = CtipodenunciaTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                swalFire.confirmar('¿Está seguro de cambiar el estado del registro?', {
                    1: () => tipoDenunciaCrud.eventos.DELETE(data.id)
                });
            });
        },
        variables: {
            rowEdit: {},
        },
        eventos: {
            TABLE: () => {
                $(`#${tipodenunciaTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

                if (!CtipodenunciaTable) {
                    CtipodenunciaTable = $(`#${tipodenunciaTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.API + '=TipoDenuncia',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.CESTDO = func.obtenerCESTDO(tipodenunciaTable);
                                d.IDEMPRESA = func.IDEMPRESA() || 0;
                                d.TIPO = "1";
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
                            {
                                data: null,
                                title: 'Descripción',
                                className: 'text-left',
                                render: data => data?.descp || ''
                            },
                            {
                                data: null,
                                title: 'Detalle',
                                className: 'text-left',
                                render: data => data?.detalle?.length > 100 ? data.detalle.substring(0, 100) + '...' : data.detalle || ''
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
                            if ($(`#${tipodenunciaTable}`).find('.radio-buttons').length == 0) {
                                $(`#${tipodenunciaTable}_filter`).append(radio_group_estados);

                                $(`#${tipodenunciaTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                                    $(`#${tipodenunciaTable}`).DataTable().ajax.reload();
                                });
                            }
                        },
                        columnDefs: [],
                        buttons: (() => {
                            let buttons = [

                            ];

                            buttons.unshift({
                                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                                className: 'erp-btn erp-btn-secondary',
                                action: function (e, dt, node, config) {
                                    $('#modalAddTipoDenuncia').modal('show');
                                }
                            });

                            return buttons;
                        })()
                    });
                } else {
                    CtipodenunciaTable.ajax.reload();
                }
            },
            INSERT: () => {
                let IDEMPRESA = func.IDEMPRESA();
                if (!IDEMPRESA) return swalFire.warning('No se encontró la empresa seleccionada');

                let formData = new FormData();
                formData.append('IDEMPRESA', IDEMPRESA);
                formData.append('TIPO', '1');
                formData.append('DESCP', $('#AddTipoDenuncia #DESCP').val());
                formData.append('DETALLE', $('#AddTipoDenuncia #DETALLE').val())
                formData.append('CESTDO', $('#AddTipoDenuncia #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos insertando el registro']);
                $.ajax({
                    url: uisApis.API + '=AddTipoDenuncia',
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
                            swalFire.success('Registro agregado correctamente', '', {
                                1: () => {
                                    $('#modalAddTipoDenuncia').modal('hide');
                                    CtipodenunciaTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el registro')
                });
            },
            UPDATE: () => {
                if (!tipoDenunciaCrud.variables.rowEdit?.id) return swalFire.warning('No se encontró el registro seleccionado');

                let formData = new FormData();
                formData.append('ID', tipoDenunciaCrud.variables.rowEdit.id);
                formData.append('IDEMPRESA', tipoDenunciaCrud.variables.rowEdit.idempresa);
                formData.append('TIPO', '1');
                formData.append('DESCP', $('#EditTipoDenuncia #DESCP').val());
                formData.append('DETALLE', $('#EditTipoDenuncia #DETALLE').val())
                formData.append('CESTDO', $('#EditTipoDenuncia #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el registro']);
                $.ajax({
                    url: uisApis.API + '=UpdateTipoDenuncia',
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
                                    $('#modalEditTipoDenuncia').modal('hide');
                                    CtipodenunciaTable.ajax.reload();
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

                swalFire.cargando(['Espere un momento', 'Estamos cambiando el estado del registro']);
                $.ajax({
                    url: uisApis.API + '=DeleteTipoDenuncia',
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
                            swalFire.success('Se cambió el estado del registro correctamente', '', {
                                1: () => $(`#${tipodenunciaTable}`).DataTable().ajax.reload()
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al cambiar el estado del registro')
                });
            }
        },
        formularios: {},
        validaciones: {
            INSERT: {
                DESCP: agregarValidaciones({
                    required: true
                }),
            },
            UPDATE: {
                DESCP: agregarValidaciones({
                    required: true
                }),
            }
        }
    };

    const relacionEmpresaCrud = {
        init: () => {
            relacionEmpresaCrud.eventos.TABLE();
        },
        globales: () => {
            // * MODALES
            $('#modalAddRelacionEmpresa').on('show.bs.modal', function (e) {
                configFormVal('AddRelacionEmpresa', relacionEmpresaCrud.validaciones.INSERT, () => relacionEmpresaCrud.eventos.INSERT());
            });

            $('#modalEditRelacionEmpresa').on('show.bs.modal', function (e) {
                configFormVal('EditRelacionEmpresa', relacionEmpresaCrud.validaciones.UPDATE, () => relacionEmpresaCrud.eventos.UPDATE());
                func.actualizarForm('EditRelacionEmpresa', relacionEmpresaCrud.variables.rowEdit);
            });

            // * FORMULARIOS
            $(`#${relacionempresaTable}`).on('click', '.edit-row-button', function () {
                const data = CrelacionempresaTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                relacionEmpresaCrud.variables.rowEdit = data;
                $('#modalEditRelacionEmpresa').modal('show');
            });

            $(`#${relacionempresaTable}`).on('click', '.delete-row-button', function () {
                const data = CrelacionempresaTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                swalFire.confirmar('¿Está seguro de cambiar el estado del registro?', {
                    1: () => relacionEmpresaCrud.eventos.DELETE(data.id)
                });
            });
        },
        variables: {
            rowEdit: {},
        },
        eventos: {
            TABLE: () => {
                $(`#${relacionempresaTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

                if (!CrelacionempresaTable) {
                    CrelacionempresaTable = $(`#${relacionempresaTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.API + '=RelacionEmpresa',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.CESTDO = func.obtenerCESTDO(relacionempresaTable);
                                d.IDEMPRESA = func.IDEMPRESA() || 0;
                                d.TIPO = "2";
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
                            {
                                data: null,
                                title: 'Descripción',
                                className: 'text-left',
                                render: data => data?.descp || ''
                            },
                            {
                                data: null,
                                title: 'Detalle',
                                className: 'text-left',
                                render: data => data?.detalle?.length > 100 ? data.detalle.substring(0, 100) + '...' : data.detalle || ''
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
                            if ($(`#${relacionempresaTable}`).find('.radio-buttons').length == 0) {
                                $(`#${relacionempresaTable}_filter`).append(radio_group_estados);

                                $(`#${relacionempresaTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                                    $(`#${relacionempresaTable}`).DataTable().ajax.reload();
                                });
                            }
                        },
                        columnDefs: [],
                        buttons: (() => {
                            let buttons = [

                            ];

                            buttons.unshift({
                                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                                className: 'erp-btn erp-btn-secondary',
                                action: function (e, dt, node, config) {
                                    $('#modalAddRelacionEmpresa').modal('show');
                                }
                            });

                            return buttons;
                        })()
                    });
                } else {
                    CrelacionempresaTable.ajax.reload();
                }
            },
            INSERT: () => {
                let IDEMPRESA = func.IDEMPRESA();
                if (!IDEMPRESA) return swalFire.warning('No se encontró la empresa seleccionada');

                let formData = new FormData();
                formData.append('IDEMPRESA', IDEMPRESA);
                formData.append('TIPO', '2');
                formData.append('DESCP', $('#AddRelacionEmpresa #DESCP').val());
                formData.append('DETALLE', $('#AddRelacionEmpresa #DETALLE').val())
                formData.append('CESTDO', $('#AddRelacionEmpresa #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos insertando el registro']);
                $.ajax({
                    url: uisApis.API + '=AddRelacionEmpresa',
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
                            swalFire.success('Registro agregado correctamente', '', {
                                1: () => {
                                    $('#modalAddRelacionEmpresa').modal('hide');
                                    CrelacionempresaTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el registro')
                });
            },
            UPDATE: () => {
                if (!relacionEmpresaCrud.variables.rowEdit?.id) return swalFire.warning('No se encontró el registro seleccionado');

                let formData = new FormData();
                formData.append('ID', relacionEmpresaCrud.variables.rowEdit.id);
                formData.append('IDEMPRESA', relacionEmpresaCrud.variables.rowEdit.idempresa);
                formData.append('TIPO', '2');
                formData.append('DESCP', $('#EditRelacionEmpresa #DESCP').val());
                formData.append('DETALLE', $('#EditRelacionEmpresa #DETALLE').val())
                formData.append('CESTDO', $('#EditRelacionEmpresa #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el registro']);
                $.ajax({
                    url: uisApis.API + '=UpdateRelacionEmpresa',
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
                                    $('#modalEditRelacionEmpresa').modal('hide');
                                    CrelacionempresaTable.ajax.reload();
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

                swalFire.cargando(['Espere un momento', 'Estamos cambiando el estado del registro']);
                $.ajax({
                    url: uisApis.API + '=DeleteRelacionEmpresa',
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
                            swalFire.success('Se cambió el estado del registro correctamente', '', {
                                1: () => $(`#${relacionempresaTable}`).DataTable().ajax.reload()
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al cambiar el estado del registro')
                });
            }
        },
        formularios: {},
        validaciones: {
            INSERT: {
                DESCP: agregarValidaciones({
                    required: true
                }),
            },
            UPDATE: {
                DESCP: agregarValidaciones({
                    required: true
                }),
            }
        }
    };

    const receptoresCrud = {
        init: () => {
            receptoresCrud.eventos.TABLE();
        },
        globales: () => {
            // * MODALES
            $('#modalAddReceptor').on('show.bs.modal', function (e) {
                receptoresCrud.eventos.USERS();
            });

            $('#modalEditReceptor').on('show.bs.modal', function (e) {
                configFormVal('EditReceptor', receptoresCrud.validaciones.UPDATE, () => receptoresCrud.eventos.UPDATE());
                func.actualizarForm('EditReceptor', receptoresCrud.variables.rowEdit);
            });

            // * FORMULARIOS
            $(`#${receptoresTable}`).on('click', '.edit-row-button', function () {
                const data = CreceptoresTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                receptoresCrud.variables.rowEdit = data;
                $('#modalEditReceptor').modal('show');
            });

            $(`#${receptoresTable}`).on('click', '.delete-row-button', function () {
                const data = CreceptoresTable.row($(this).parents('tr')).data();
                if (!data.id) return swalFire.error('No se encontró el registro seleccionado');
                swalFire.confirmar('¿Está seguro de cambiar el estado del registro?', {
                    1: () => receptoresCrud.eventos.DELETE(data.id)
                });
            });

            $("#btnAddReceptor").on('click', function (e) {
                e.preventDefault();
                let checkboxes = $(`#${receptoresUsersTable} input[type="checkbox"]:checked`);
                let receptores = [];
                checkboxes.each(function () {
                    let data = CreceptoresUsersTable.row($(this).parents('tr')).data();
                    if (data) {
                        receptores.push({
                            IDUSER: data.id,
                            PRINCIPAL: false,
                            CESTDO: 'A',
                        });
                    }
                });

                if (receptores.length == 0) return swalFire.warning('Seleccione al menos un receptor');

                // PROMISE ALL AL MISMO API PARA INSERTAR N VECES
                let url = `${uisApis.API}=AddReceptor`;
                let promises = receptores.map(receptor => {
                    let formData = new FormData();
                    formData.append('IDUSER', receptor.IDUSER);
                    formData.append('PRINCIPAL', receptor.PRINCIPAL);
                    formData.append('CESTDO', receptor.CESTDO);

                    return $.ajax({
                        url: url,
                        type: 'POST',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                        },
                        dataType: 'json',
                        contentType: false,
                        processData: false,
                        data: formData
                    });
                });

                swalFire.cargando(['Espere un momento', 'Estamos insertando los registros']);

                Promise.all(promises)
                    .then(responses => {
                        console.log(responses);
                        let success = responses.some(response => response.codEstado > 0); // Verifica si al menos uno fue exitoso
                        if (success) {
                            swalFire.success('Registros agregados correctamente', '', {
                                1: () => {
                                    $('#modalAddReceptor').modal('hide');
                                    CreceptoresTable.ajax.reload();
                                }
                            });
                        } else {
                            swalFire.error('Ocurrió un error al agregar los registros');
                        }
                    })
                    .catch(() => {
                        swalFire.error('Ocurrió un error al agregar los registros');
                    });

            });

        },
        variables: {
            rowEdit: {},
        },
        eventos: {
            TABLE: () => {
                $(`#${receptoresTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

                if (!CreceptoresTable) {
                    CreceptoresTable = $(`#${receptoresTable} `).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.API + '=Receptor',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.CESTDO = func.obtenerCESTDO(receptoresTable);
                                d.IDEMPRESA = func.IDEMPRESA() || 0;
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
                                    </div>`;
                                }
                            }
                        ],
                        initComplete: function (settings, json) {
                            if ($(`#${receptoresTable} `).find('.radio-buttons').length == 0) {
                                $(`#${receptoresTable}_filter`).append(radio_group_estados);

                                $(`#${receptoresTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                                    $(`#${receptoresTable} `).DataTable().ajax.reload();
                                });
                            }
                        },
                        columnDefs: [],
                        buttons: (() => {
                            let buttons = [

                            ];

                            buttons.unshift({
                                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                                className: 'erp-btn erp-btn-secondary',
                                action: function (e, dt, node, config) {
                                    $('#modalAddReceptor').modal('show');
                                }
                            });

                            return buttons;
                        })()
                    });
                } else {
                    CreceptoresTable.ajax.reload();
                }
            },
            INSERT: () => {
                let IDEMPRESA = func.IDEMPRESA();
                if (!IDEMPRESA) return swalFire.warning('No se encontró la empresa seleccionada');

                let formData = new FormData();
                formData.append('IDEMPRESA', IDEMPRESA);
                formData.append('TIPO', '3');
                formData.append('DESCP', $('#AddReceptores #DESCP').val());
                formData.append('DETALLE', $('#AddReceptores #DETALLE').val())
                formData.append('CESTDO', $('#AddReceptores #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos insertando el registro']);
                $.ajax({
                    url: uisApis.API + '=AddReceptores',
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
                            swalFire.success('Registro agregado correctamente', '', {
                                1: () => {
                                    $('#modalAddReceptores').modal('hide');
                                    CreceptoresTable.ajax.reload();
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el registro')
                });
            },
            UPDATE: () => {
                if (!receptoresCrud.variables.rowEdit?.id) return swalFire.warning('No se encontró el registro seleccionado');

                let formData = new FormData();
                formData.append('ID', receptoresCrud.variables.rowEdit.id);
                formData.append('PRINCIPAL', $('#EditReceptor #PRINCIPAL').is(':checked') ? true : false);
                formData.append('CESTDO', $('#EditReceptor #CESTDO').val());

                swalFire.cargando(['Espere un momento', 'Estamos actualizando el registro']);
                $.ajax({
                    url: uisApis.API + '=UpdateReceptor',
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
                                    $('#modalEditReceptor').modal('hide');
                                    CreceptoresTable.ajax.reload();
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

                swalFire.cargando(['Espere un momento', 'Estamos cambiando el estado del registro']);
                $.ajax({
                    url: uisApis.API + '=DeleteReceptor',
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
                            swalFire.success('Se cambió el estado del registro correctamente', '', {
                                1: () => $(`#${receptoresTable} `).DataTable().ajax.reload()
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al cambiar el estado del registro')
                });
            },
            USERS: () => {
                $(`#${receptoresUsersTable} _filter.radio - buttons #radioGroup_2`).prop('checked', true);

                if (!CreceptoresUsersTable) {
                    CreceptoresUsersTable = $(`#${receptoresUsersTable} `).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.PER + '=Buscar',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.CESTDO = 'A';
                                d.IDMRCA = func.IDEMPRESA() || 0;
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
                            {
                                data: null,
                                title: 'Persona',
                                className: 'text-left',
                                render: data => {
                                    const name = data?.ncmpto || '';
                                    const email = data?.correo || '';
                                    let output;

                                    if (data?.rtafto) {
                                        output = `<img src = "${data.rtafto}" class="rounded-circle avatar-sm me-3" alt="avatar" height="32" width="32">`;
                                    } else {
                                        const states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
                                        const initials = (name.match(/\b\w/g) || [])
                                            .map(char => char.toUpperCase())
                                            .slice(0, 2)
                                            .join('');
                                        const state = states[Math.floor(Math.random() * states.length)];

                                        output = `<span class="avatar-initial rounded-circle bg-label-${state}"> ${initials}</span> `;
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
                                title: 'Estado',
                                className: 'text-center',
                                render: data => {
                                    return `<span> <i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'
                                        }></i></span> `;
                                }
                            },
                            {
                                data: null,
                                title: '',
                                className: 'text-center',
                                render: data => {
                                    return `<div class="d-flex justify-content-center m-0 p-0">
                                        <input type="checkbox" class="form-check-input" id="check-${data.id}" name="check-${data.id}">
                                    </div>`;
                                }
                            },
                        ],
                        initComplete: function (settings, json) { },
                        columnDefs: [],
                        buttons: (() => {
                            let buttons = [];
                            return buttons;
                        })()
                    });
                } else {
                    CreceptoresUsersTable.ajax.reload();
                }
            }
        },
        formularios: {},
        validaciones: {
            INSERT: {
                DESCP: agregarValidaciones({
                    required: true
                }),
            },
            UPDATE: {
                DESCP: agregarValidaciones({
                    required: true
                }),
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
                                select.innerHTML = `< option value = "" > --Seleccione</option > `;

                                if (data.length > 0) {
                                    data.forEach(d => {
                                        select.innerHTML += `< option value = "${d.vlR1}" > ${d.dtlle}</option > `;
                                    });
                                }
                            });
                        }
                    },
                    error: error => swalFire.error('Ocurrió un error al cargar los módulos')
                });
            },
            selectsForm: () => {
                // let urlMarcas = `${uisApis.MR}=Obtener & start=0 & length=100`;
                // let urlRoles = `${uisApis.ROL}=Buscar & start=0 & length=10000`;

                // Promise.all([
                //     fetch(urlMarcas).then(response => response.json()),
                //     fetch(urlRoles).then(response => response.json())
                // ])
                //     .then(([resultMarcas, resultRoles]) => {
                //         globalCrud.generarSelects2('IDMRCA', resultMarcas?.data || [], 'id', 'mrca');
                //         globalCrud.generarSelects2('IDROL', resultRoles?.data || [], 'id', 'dscrpcn');
                //     })
                //     .catch(error => swalFire.error('Ocurrió un error al cargar los datos'));
            }
        },
        generarSelects2: (id, data, value, label) => {
            let selects = document.querySelectorAll(`select[name = ${id}]`);
            selects.forEach(select => {
                select.innerHTML = '';
                select.innerHTML = `< option value = "" > --Seleccione</option > `;
                data.forEach(d => {
                    select.innerHTML += `< option value = "${d[value]}" > ${d[label]}</option > `;
                });
            });
        }
    };

    return {
        init: async () => {
            func.limitarCaracteres();
            func.selects2();

            await globalCrud.init();
            tipoDenunciaCrud.init();
            tipoDenunciaCrud.globales();
            relacionEmpresaCrud.globales();
            receptoresCrud.globales();

            var myTabs = document.querySelectorAll('.erp-tabs button');
            myTabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    const tabPane = tab.getAttribute('data-bs-target');
                    if (tabPane === '#navs-tipodenuncia') {
                        tipoDenunciaCrud.init();
                    }

                    if (tabPane === '#navs-relacionempresa') {
                        relacionEmpresaCrud.init();
                    }

                    if (tabPane === '#navs-receptores') {
                        receptoresCrud.init();
                    }
                });
            });

            // * CAMBIOS
            $("#condominio-actual_select").on("change", function () {
                redirect(1, "navs-tipodenuncia", 1);
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
