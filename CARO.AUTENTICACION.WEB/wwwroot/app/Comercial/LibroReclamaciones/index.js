/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    const uisApis = {
        API: '/Comercial/LibroReclamaciones/Index?handler',
        GD: '/Seguridad/GrupoDato/Index?handler',
    };

    let libroreclamaciones = 'libroreclamaciones';
    let Clibroreclamaciones = null;
    let GDSLCTDCOLORS = [];

    // * TABLAS
    const libroReclamacionesCrud = {
        init: () => {
            libroReclamacionesCrud.table();
        },
        table: () => {
            $(`#${libroreclamaciones}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

            if (!Clibroreclamaciones) {
                Clibroreclamaciones = $(`#${libroreclamaciones}`).DataTable({
                    ...configTable(),
                    ajax: {
                        url: uisApis.API + '=Buscar',
                        type: 'GET',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                        },
                        data: function (d) {
                            delete d.columns;
                            const form = $('#formSearch').serializeArray();
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
                            title: 'N° Solicitud',
                            className: 'text-center',
                            render: data => {
                                let year = new Date(data.fecharecl).getFullYear();
                                return `<span class="">${data.id.toString().padStart(8, '0')}-${year}</span>`;
                            }
                        },
                        {
                            data: null,
                            title: 'Tipo',
                            className: 'text-center',
                            render: data => data?.tiporeclamo || "",
                        },
                        {
                            data: null,
                            title: 'Usuario solicitante',
                            className: 'text-left',
                            width: '35%',
                            render: data => {
                                return `<div class="d-flex flex-column">
                                    <p class="m-0 p-0"><strong>Cliente:</strong> ${data?.nombreapellidO1 || ""}, ${data?.apllds || ""}</p>
                                    <p class="m-0 p-0"><strong>Tipo Doc.:</strong> ${data?.tdocrecl || ""}</p>
                                    <p class="m-0 p-0"><strong>N° Doc.:</strong> ${data?.nrodocrecl || ""}</p>
                                </div>`;
                            }
                        },
                        {
                            data: null,
                            title: 'Fecha de solicitud',
                            className: 'text-center',
                            render: data => func.formatFecha(data.fecharecl, 'DD-MM-YYYY HH:mm a')

                        },
                        // { data: 'ucrcn', title: 'U. Edición' },
                        {
                            data: null,
                            title: '',
                            className: 'text-center',
                            render: data => {
                                return `<div class="d-flex justify-content-center m-0 p-0">
                                    <button name="VER" class="btn btn-sm btn-icon view-row-button" title="Ver"><i class="bx bx-show"></i></button>
                                </div>`;
                            }
                        }
                    ],
                    initComplete: function (settings, json) {
                        $(`#${libroreclamaciones}_filter`).addClass('d-none');
                    },
                    columnDefs: [],
                    buttons: (() => {
                        let buttons = [];

                        // agregar boton buscar y exportar
                        buttons.push({
                            text: `<i class="bx bx-search"></i> Buscar`,
                            className: 'btn btn-secondary',
                            action: function (e, dt, node, config) {
                                Clibroreclamaciones.ajax.reload();
                            }
                        });

                        buttons.push({
                            text: `<i class="bx bx-file"></i> Exportar`,
                            className: 'btn btn-success',
                            id: 'btnExportar',
                            action: function (e, dt, node, config) {
                                libroReclamacionesCrud.eventos.excelExport();
                            }
                        });

                        return buttons;
                    })()
                });
            } else {
                Clibroreclamaciones.ajax.reload();
            }
        },
        globales: () => {
            $(`#${libroreclamaciones}`).on('click', '.view-row-button', function () {
                let data = Clibroreclamaciones.row($(this).parents('tr')).data();
                if (data) {
                    libroReclamacionesCrud.variables.rowData = data;
                    redirect(true, 'navs-detalle', data.id);
                }
            });
        },
        variables: {
            rowData: {}
        },
        eventos: {
            getFind: () => {
                libroReclamacionesCrud.variables.rowData.fecharecl = func.formatFecha(libroReclamacionesCrud.variables.rowData.fecharecl, 'DD-MM-YYYY HH:mm a')
                if (libroReclamacionesCrud.variables.rowData.menoredad == "No") {
                    $("#isMenorEdad").addClass('d-none');
                } else {
                    $("#isMenorEdad").removeClass('d-none');
                }

                if (libroReclamacionesCrud.variables.rowData.empresa === 'No') {
                    $('#isEmpresa').addClass('d-none');
                } else {
                    $('#isEmpresa').removeClass('d-none');
                }

                let archivos = JSON.parse(libroReclamacionesCrud.variables.rowData.archivos || '[]');
                let htmlArchivos = '';
                // #archivos TABLA
                console.log(archivos);
                if (archivos.length > 0) {
                    archivos.forEach(archivo => {
                        // de .RUTA, sacar todo despues del ultimo /
                        let nombre = archivo.RUTA.split('/').pop();
                        htmlArchivos += `<tr>
                            <td class="text-center">${nombre}</td>
                            <td class="text-left">${archivo.COMENTARIOS}</td>
                            <td class="text-center">
                                <a href="http://resourcesasociados.caroasociados.pe/${archivo.RUTA}" class="btn btn-sm btn-primary" target="_blank" title="Descargar archivo">
                                    <i class="bx bx-download"></i>
                                </a>
                            </td>
                        </tr>`;
                    });

                    $('#archivos tbody').html(htmlArchivos);
                }

                func.actualizarForm('formDetalle', libroReclamacionesCrud.variables.rowData);
            },
            excelExport: () => {
                swalFire.cargando(['Generando documento...', 'Por favor espere un momento']);
                let form = $('#formSearch').serializeArray();
                let params = '';
                form.forEach(x => params += `&${x.name}=${x.value}`);

                $.ajax({
                    url: uisApis.API + '=Buscar&start=0&length=10000',
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                    },
                    data: params,
                    success: function (data) {
                        if (data.data.length === 0) {
                            swalFire.warning('No hay datos para exportar.');
                            return;
                        }

                        let workbook = new ExcelJS.Workbook();
                        let worksheet = workbook.addWorksheet('Libro de Reclamaciones');

                        // ✅ 1. Título en A1:F1 con color naranja suave
                        worksheet.mergeCells('A1:F1');
                        let titleCell = worksheet.getCell('A1');
                        titleCell.value = 'REPORTE DE RECLAMOS';
                        titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }; // Texto blanco
                        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                        titleCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFA500' } // Naranja suave
                        };

                        worksheet.getRow(1).height = 25;

                        // ✅ 2. Fila vacía (A2)
                        worksheet.addRow([]);

                        // ✅ 3. Cabeceras en A3:F3 con color naranja suave
                        const headerRow = worksheet.addRow([
                            'N° Solicitud', 'Tipo', 'Usuario Solicitante', 'Tipo Doc.', 'N° Doc.', 'Fecha de Solicitud'
                        ]);

                        headerRow.eachCell((cell) => {
                            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texto blanco
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFFA500' } // Naranja suave
                            };
                            cell.border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                        });

                        // ✅ 4. Agregar datos desde la fila 4
                        let rows = data.data.map(item => {
                            let year = new Date(item.fecharecl).getFullYear();
                            return [
                                `${item.id.toString().padStart(8, '0')}-${year}`,
                                item.tiporeclamo || "",
                                `${item?.nombreapellidO1 || ""} ${item?.apllds || ""}`,
                                item.tdocrecl || "",
                                item.nrodocrecl || "",
                                func.formatFecha(item.fecharecl, 'DD-MM-YYYY HH:mm a')
                            ];
                        });

                        rows.forEach((rowData, index) => {
                            let row = worksheet.addRow(rowData);
                            row.eachCell((cell) => {
                                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                                cell.border = {
                                    top: { style: 'thin' },
                                    left: { style: 'thin' },
                                    bottom: { style: 'thin' },
                                    right: { style: 'thin' }
                                };
                            });
                            // Zebra alternado
                            if (index % 2 === 0) {
                                row.eachCell(cell => {
                                    cell.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'FFFBEEDA' } // Naranja muy claro para zebra
                                    };
                                });
                            }
                        });

                        // ✅ Ajustar ancho de columnas
                        worksheet.columns.forEach((col, index) => {
                            col.width = [20, 15, 35, 15, 20, 25][index];
                        });

                        // ✅ Descargar archivo
                        workbook.xlsx.writeBuffer().then(function (buffer) {
                            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'Libro_Reclamaciones.xlsx';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        });
                        swalFire.success('Reporte generado exitosamente');
                    },
                    error: function (error) {
                        swalFire.error('Error al generar el reporte');
                    }
                });
            }
        },
    };


    return {
        init: async () => {
            libroReclamacionesCrud.init();
            libroReclamacionesCrud.globales();
            var myTabs = document.querySelectorAll('.erp-tabs button');
            redirect(false, 'navs-detalle', 0);
            myTabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    const tabPane = tab.getAttribute('data-bs-target');
                    if (tabPane === '#navs-queja') {
                        redirect(false, 'navs-detalle', 0);
                        libroReclamacionesCrud.init();
                    }

                    if (tabPane === '#navs-detalle') {
                        libroReclamacionesCrud.eventos.getFind();
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
