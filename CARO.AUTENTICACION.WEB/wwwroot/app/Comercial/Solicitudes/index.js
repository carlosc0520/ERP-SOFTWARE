/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    const uisApis = {
        API: '/Comercial/Solicitudes/Index?handler',
        GD: '/Seguridad/GrupoDato/Index?handler',
        ABG: '/Legal/Abogados/Index?handler',
    };

    let solicitudesTable = 'solicitudesTable';
    let CsolicitudesTable = null;
    let GDSLCTDCOLORS = [];

    // * TABLAS
    const solicitudesCrud = {
        init: () => {
            solicitudesCrud.table();
        },
        table: () => {
            $(`#${solicitudesTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

            if (!CsolicitudesTable) {
                CsolicitudesTable = $(`#${solicitudesTable}`).DataTable({
                    ...configTable(),
                    ajax: {
                        url: uisApis.API + '=Buscar',
                        type: 'GET',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                        },
                        data: function (d) {
                            delete d.columns;
                            const form = $('#formSearchSolicitud').serializeArray();
                            form.forEach(x => d[x.name] = x.value);
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
                            title: 'Fcha. Servicio',
                            className: 'text-center',
                            render: data => func.formatFecha(data.fchaservicio, 'DD-MM-YYYY HH:mm a')
                        },
                        { data: 'dgdespcldd', title: 'Especialidad' },
                        {
                            data: null,
                            title: 'Cliente',
                            className: 'text-left',
                            width: '35%',
                            render: data => {
                                return `<div class="d-flex flex-column">
                                    <p class="m-0 p-0"><strong>Cliente:</strong> ${data?.nmbres || ""}, ${data?.apllds || ""}</p>
                                    <p class="m-0 p-0"><strong>Correo:</strong> ${data?.correo || ""}</p>
                                    <p class="m-0 p-0"><strong>Celular:</strong> ${data?.celular || ""}</p>
                                </div>`;
                            }
                        },
                        {
                            data: null,
                            title: 'Estado',
                            className: 'text-center',
                            render: data => {
                                let color = GDSLCTDCOLORS.find(x => x.vlR1 === data.cestdo) || {};
                                return `<span><i class="fa fa-circle" 
                                style="color:${color.vlR2 || 'black'}; font-size: 12px;"
                                title="${color.dtlle}"></i></span>`;
                            }
                        },
                        {
                            data: null,
                            title: '',
                            className: 'text-center',
                            render: data => {
                                return `<div class="d-flex justify-content-center m-0 p-0">
                                    ${data.cestdo != "4" ? '<button name="VER" class="btn btn-sm btn-icon aprobar-row-button" title="Aprobar"><i class="bx bx-check"></i></button>' : ""}
                                    ${["1", "2"].includes(data.cestdo) ? '<button name="VER" class="btn btn-sm btn-icon rechazar-row-button" title="Rechazar"><i class="bx bx-x"></i></button>' : ""}
                                    <button name="VER" class="btn btn-sm btn-icon view-row-button" title="Ver"><i class="bx bx-show"></i></button>
                                    <button name="EXPORTAR" class="btn btn-sm btn-icon view-row-exportar" title="Exportar"><i class="bx bx-download"></i></button>
                                </div>`;
                            }
                        }
                    ],
                    initComplete: function (settings, json) {
                        $(`#${solicitudesTable}_filter`).addClass('d-none');
                    },
                    columnDefs: [],
                    buttons: (() => {
                        let buttons = [];

                        // buttons.unshift({
                        //     text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                        //     className: 'erp-btn erp-btn-secondary',
                        //     action: function (e, dt, node, config) {
                        //         $('#modalAddAbogado').modal('show');
                        //     }
                        // });

                        return buttons;
                    })()
                });
            } else {
                CsolicitudesTable.ajax.reload();
            }
        },
        globales: () => {
            $("#formSearchSolicitud #btnBuscar").on('click', function () {
                CsolicitudesTable.ajax.reload();
            });

            $("#formSearchSolicitud #btnExportar").on('click', function () {
                let form = $('#formSearchSolicitud').serializeArray();
                let url = uisApis.API + '=BuscarExportar&' + $.param(form);
                url += '&DGDSUCRSLS=' + $('#formSearchSolicitud #GDSUCRSLS option:selected').text();
                url += '&DCESTDO=' + $('#formSearchSolicitud #CESTDO option:selected').text();

                swalFire.cargando(['Espere un momento', 'Se está exportando la información']);
                $.ajax({
                    url: url,
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                    },
                    success: function (data, status, xhr) {
                        swalFire.cerrar();
                        if (data.success) {
                            let byteCharacters = atob(data.fileBase64);
                            let byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            let byteArray = new Uint8Array(byteNumbers);

                            let blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

                            let a = document.createElement("a");
                            let url = window.URL.createObjectURL(blob);
                            a.href = url;
                            a.download = data.filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        }
                    },
                    error: function (xhr, status, error) {
                        swalFire.error('Error', 'Ocurrió un error al exportar la información');
                    }
                });
            });

            $(`#${solicitudesTable}`).on('click', '.aprobar-row-button', function () {
                let data = CsolicitudesTable.row($(this).parents('tr')).data();
                if (data) {
                    swalFire.coolToAction('¿Está seguro de aprobar la solicitud?', {
                        1: async (comentario) => {
                            let formData = new FormData();
                            formData.append('ID', data.id);
                            formData.append('ACMNTRS', comentario);
                            formData.append('CESTDO', '4');
                            formData.append('PATHS', data.files);

                            swalFire.cargando(['Espere un momento', 'Se está actualizando el estado de la solicitud']);
                            $.ajax({
                                url: uisApis.API + '=UpdateEstado',
                                type: 'POST',
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                                },
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: function (data) {
                                    swalFire.cerrar();
                                    if (data.esSatisfactoria) {
                                        swalFire.success('Éxito', 'Se actualizó el estado de la solicitud');
                                        CsolicitudesTable.ajax.reload();
                                    } else {
                                        swalFire.error('Error', 'Ocurrió un error al actualizar el estado de la solicitud');
                                    }
                                },
                                error: function (xhr, status, error) {
                                    swalFire.error('Error', 'Ocurrió un error al actualizar el estado de la solicitud');
                                }   
                            });
                        }
                    })
                }
            });

            $(`#${solicitudesTable}`).on('click', '.rechazar-row-button', function () {
                let data = CsolicitudesTable.row($(this).parents('tr')).data();
                if (data) {
                    swalFire.coolToAction('¿Está seguro de rechazar la solicitud?', {
                        1: async (comentario) => {
                            let formData = new FormData();
                            formData.append('ID', data.id);
                            formData.append('RCMNTRS', comentario);
                            formData.append('CESTDO', '3');

                            swalFire.cargando(['Espere un momento', 'Se está actualizando el estado de la solicitud']);
                            $.ajax({
                                url: uisApis.API + '=UpdateEstado',
                                type: 'POST',
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                                },
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: function (data) {
                                    swalFire.cerrar();
                                    if (data.esSatisfactoria) {
                                        swalFire.success('Éxito', 'Se actualizó el estado de la solicitud');
                                        CsolicitudesTable.ajax.reload();
                                    } else {
                                        swalFire.error('Error', 'Ocurrió un error al actualizar el estado de la solicitud');
                                    }
                                },
                                error: function (xhr, status, error) {
                                    swalFire.error('Error', 'Ocurrió un error al actualizar el estado de la solicitud');
                                }   
                            });
                        }
                    })
                }
            });

            $(`#${solicitudesTable}`).on('click', '.view-row-button', function () {
                let data = CsolicitudesTable.row($(this).parents('tr')).data();
                if (data) {
                    solicitudesCrud.variables.rowData = data;
                    $("#modalAddSolicitud").modal('show');
                    func.actualizarForm("AddSolicitud", data);
                }
            });

            $(`#${solicitudesTable}`).on('click', '.view-row-exportar', function () {
                let data = CsolicitudesTable.row($(this).parents('tr')).data();
                if (data) {
                    let formData = new FormData();
                    formData.append('FILES', data.files);

                    swalFire.cargando(['Espere un momento', 'Se está descargando los archivos']);
                    $.ajax({
                        url: uisApis.API + '=Download',
                        type: 'POST',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                        },
                        data: formData,
                        processData: false,
                        contentType: false,
                        xhrFields: {
                            responseType: 'blob'
                        },
                        success: function (blob) {
                            swalFire.cerrar();
                            if (blob.size === 0) {
                                return;
                            }

                            var url = window.URL.createObjectURL(blob);
                            var a = document.createElement('a');
                            a.href = url;
                            a.download = 'ArchivosDescargados.zip';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        },
                        error: function (xhr, status, error) {
                            swalFire.error('Error', 'Ocurrió un error al descargar los archivos');
                        }
                    });

                }
            });

            $("#modalAddSolicitud #btnDescargarArchivos").on('click', function (e) {
                e.preventDefault();
                let formData = new FormData();
                formData.append('FILES', solicitudesCrud.variables.rowData.files);

                swalFire.cargando(['Espere un momento', 'Se está descargando los archivos']);
                $.ajax({
                    url: uisApis.API + '=Download',
                    type: 'POST',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                    },
                    data: formData,
                    processData: false,
                    contentType: false,
                    xhrFields: {
                        responseType: 'blob'
                    },
                    success: function (blob) {
                        swalFire.cerrar();
                        if (blob.size === 0) {
                            return;
                        }

                        var url = window.URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = 'ArchivosDescargados.zip';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    },
                    error: function (xhr, status, error) {
                        swalFire.error('Error', 'Ocurrió un error al descargar los archivos');
                    }
                });
            })
        },
        variables: {
            rowData: {}
        },
        eventos: {

        },
        formularios: {

        },
        validaciones: {

        }
    };


    const EXECUTECOMBOS = async () => {
        const API1 = `${uisApis.GD}=ObtenerAll&GDTOS=GDESPCLDD,GDSCRSLS,GDSLCTD`;
        const API2 = `${uisApis.ABG}=Buscar&start=0&length=1000&search=&columns=&order=&draw=1`;
        const [response1, response2] = await Promise.allSettled([
            $.ajax({ url: API1, type: 'GET', beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null)); } }),
            $.ajax({ url: API2, type: 'GET', beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null)); } })
        ]);
        if (response1.status === 'fulfilled') {
            const { data } = response1.value;
            if (data) {
                let GDESPCLDD = data.filter(x => x.gdpdre === 'GDESPCLDD');
                let GDSCRSLS = data.filter(x => x.gdpdre === 'GDSCRSLS');
                let GDSLCTD = data.filter(x => x.gdpdre === 'GDSLCTD');
                GDSLCTDCOLORS = GDSLCTD;
                $('#formSearchSolicitud #GDESPCLDD').empty().append(`<option value="">Todos</option>`);
                $('#formSearchSolicitud #GDSUCRSLS').empty().append(`<option value="">Todos</option>`);
                $('#formSearchSolicitud #CESTDO').empty().append(`<option value="">Todos</option>`);
                GDESPCLDD.forEach(x => $('#formSearchSolicitud #GDESPCLDD').append(`<option value="${x.vlR1}">${x.dtlle}</option>`));
                GDSCRSLS.forEach(x => $('#formSearchSolicitud #GDSUCRSLS').append(`<option value="${x.vlR1}">${x.dtlle}</option>`))
                GDSLCTD.forEach(x => {
                    $('#formSearchSolicitud #CESTDO').append(`<option value="${x.vlR1}">${x.dtlle}</option>`)
                    $('#AddSolicitud #CESTDO').append(`<option value="${x.vlR1}">${x.dtlle}</option>`)
                });

            }
        }

        if (response2.status === 'fulfilled') {
            const { data } = response2.value;
            if (data) {
                $('#formSearchSolicitud #ABOGADO').empty().append(`<option value="">Todos</option>`);
                data.forEach(x => $('#formSearchSolicitud #ABOGADO').append(`<option value="${x.id}">${x.nmbrs}</option>`));
            }
        }
    }

    return {
        init: async () => {
            await func.selects2("formSearchSolicitud")
            await EXECUTECOMBOS();
            solicitudesCrud.init();
            solicitudesCrud.globales();
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
