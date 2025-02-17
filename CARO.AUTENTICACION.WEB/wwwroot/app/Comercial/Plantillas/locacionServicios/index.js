const executeView = () => {
    const uisApis = {
        API: '/Comercial/Plantillas/locacionServicios/Index?handler',
        EMP: '/Mantenimientos/Empresas/Index?handler',
        GD: '/Seguridad/GrupoDato/Index?handler'
    };

    let CempresasTable = null;
    let empresasTable = 'empresaTable';
    let paises = [];
    let monedas = [];
    let entidades = [];

    const plantillasCrud = {
        init: () => { },

        globales: () => {
            $("#btnBuscarEmpresa").on("click", function () {
                plantillasCrud.variables.isLocador = false;
                $('#modalBuscarEmpresa').modal('show');
            });

            $("#btnBuscarEmpresaLocador").on("click", function () {
                plantillasCrud.variables.isLocador = true;
                $('#modalBuscarEmpresa').modal('show');
            });

            $("#btnLimpiarEmpresa").on("click", function () {
                plantillasCrud.eventos.BORRAR(false);
            });

            $("#btnLimpiarEmpresaLocador").on("click", function () {
                plantillasCrud.eventos.BORRAR(true);
            });

            $("#modalBuscarEmpresa").on("shown.bs.modal", function () {
                plantillasCrud.eventos.TABLE();
            });

            configFormVal('formContrato', plantillasCrud.validaciones, () => plantillasCrud.eventos.GENERATE());

            $("#clear").on("click", function (e) {
                e.preventDefault();
                $('#formContrato').trigger("reset");
                $('#formContrato').find('select').trigger('change');
            });
        },
        eventos: {
            TABLE: () => {
                $(`#${empresasTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

                if (!CempresasTable) {
                    CempresasTable = $(`#${empresasTable}`).DataTable({
                        ...configTable(),
                        ajax: {
                            url: uisApis.EMP + '=Buscar',
                            type: 'GET',
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            data: function (d) {
                                delete d.columns;
                                d.CESTDO = func.obtenerCESTDO(empresasTable);
                            },
                            dataSrc: function (json) {
                                if (json?.data) {
                                    let primero = json.data[0];
                                    $('#total_usuarios').text(`Total ${primero?.totalrows} usuarios`);
                                }
                                return json.data;
                            }
                        },
                        columns: [
                            { data: 'rn', title: '' },
                            {
                                data: null, title: "Empresa",
                                render: data => {
                                    return `
                                    <div class="d-flex justify-content-start align-items-center">
                                      <div class="d-flex align-items-center">
                                        <a href="javascript:void(0)">
                                            <img src="${data.rtafto}" class="rounded-circle me-3" alt="avatar" style="width: 50px; height: 50px; object-fit: cover;">
                                        </a>
                                      </div>
                                      <div class="d-flex flex-column">
                                        <div><strong>${data?.ruc || ""}</strong></div>
                                        <div>${data.mrca}</div>
                                      </div>
                                    </div>
                                  `;

                                }
                            },
                            {
                                data: null, title: "Dirección", render: data => data?.drcnn || "",
                            },
                            {
                                data: null, title: "Gerente", render: data => data?.didprsna || "",
                            },
                        ],
                        initComplete: function (settings, json) {
                            if ($(`#${empresasTable}`).find('.radio-buttons').length == 0) {
                                $(`#${empresasTable}_filter`).append(radio_group_estados);

                                $(`#${empresasTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                                    $(`#${empresasTable}`).DataTable().ajax.reload();
                                });
                            }
                        },
                        drawCallback: function (settings) {
                            $(`#${empresasTable} tbody tr`).css('cursor', 'pointer').on('click', function () {
                                let data = CempresasTable.row(this).data();
                                if (!data) return;

                                let isLocador = plantillasCrud.variables.isLocador;
                                $(`#${isLocador ? 'EMPRESALOCADOR' : 'EMPRESA'}`).val(data?.rznscil || "");
                                $(`#${isLocador ? 'RUCLOCADOR' : 'RUC'}`).val(data?.ruc || "");
                                $(`#${isLocador ? 'DIRECCIONLOCADOR' : 'DIRECCION'}`).val(data?.drcnn || "");
                                $(`#${isLocador ? 'PROVINCIALOCADOR' : 'PROVINCIA'}`).val(data?.prvnca || "");
                                $(`#${isLocador ? 'PAISLOCADOR' : 'PAIS'}`).val(data?.idpais?.toString() || "").trigger('change');
                                $(`#${isLocador ? 'GERENTELOCADOR' : 'GERENTE'}`).val(data?.didprsna || "");
                                $(`#${isLocador ? 'DNILOCADOR' : 'DNIGERENTE'}`).val(data?.dniprsna || "");



                                $("#modalBuscarEmpresa").modal('hide');
                            });
                        },
                        columnDefs: [],
                        buttons: (() => {
                            let buttons = [];
                            return buttons;
                        })()
                    });
                } else {
                    CempresasTable.ajax.reload();
                }
            },
            GENERATE: async () => {
                let formData = new FormData(document.getElementById('formContrato'));
                let pais = paises.find(p => p.vlR1 == formData.get('PAIS'));
                let paisLocador = paises.find(p => p.vlR1 == formData.get('PAISLOCADOR'));

                formData.set('PAIS', pais?.dtlle || '');
                formData.set('PAISLOCADOR', paisLocador?.dtlle || '');

                let honorario = formData.get('HONORARIO');
                honorario = formData.get('GDMONEDA') === '1' ? `S/. ${honorario} soles` : formData.get('GDMONEDA') === '2' ? `$ ${honorario} dólares` : formData.get('GDMONEDA') === '3' ? `€ ${honorario} euros` : honorario;

                formData.set('HONORARIO', honorario);
                
                let entidad = entidades.find(e => e.vlR1 === formData.get('GDENTDD'));
                formData.set('GDENTDD', entidad?.dtlle || '');
                formData.set('PARTIDALOCADOR', '798789789');


                swalFire.cargando(['Generando documento...', 'Por favor espere un momento']);
                await $.ajax({
                    url: uisApis.API + '=GenerateDocument',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                    },
                    type: 'POST',
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    data: formData,
                    success: data => {
                        let fecha = new Date();
                        let nombre = `Contrato Locación por servicios_${fecha.getFullYear()}${fecha.getMonth()}${fecha.getDate()}.docx`;

                        if (data.base64Word) {
                            var link = document.createElement('a');
                            link.href = 'data:application/octet-stream;base64,' + data.base64Word;
                            link.download = nombre || 'Contrato Locación por servicios.docx';
                            link.click();
                            $('#formContrato').trigger("reset");
                            $('#formContrato').find('select').trigger('change');
                            return;
                        }

                        swalFire.error('Error al generar el documento');

                    },
                    error: error => swalFire.error('Error al generar el documento'),
                    complete: () => swalFire.cerrar()
                });
            },
            BORRAR: (isLocador) => {
                $(`#${isLocador ? 'EMPRESALOCADOR' : 'EMPRESA'}`).val("");
                $(`#${isLocador ? 'RUCLOCADOR' : 'RUC'}`).val("");
                $(`#${isLocador ? 'DIRECCIONLOCADOR' : 'DIRECCION'}`).val("");
                $(`#${isLocador ? 'PROVINCIALOCADOR' : 'PROVINCIA'}`).val("");
                $(`#${isLocador ? 'PAISLOCADOR' : 'PAIS'}`).val("").trigger('change');
                $(`#${isLocador ? 'GERENTELOCADOR' : 'GERENTE'}`).val("");
                $(`#${isLocador ? 'DNILOCADOR' : 'DNIGERENTE'}`).val("");
            }
        },
        validaciones: {
            RUC: agregarValidaciones({
                required: true,
                maxlength: 11,
            }),
            EMPRESA: agregarValidaciones({
                required: true
            }),
            GERENTE: agregarValidaciones({
                required: true
            }),
            DNIGERENTE: agregarValidaciones({
                required: true
            }),
            DIRECCION: agregarValidaciones({
                required: true
            }),
            PROVINCIA: agregarValidaciones({
                required: true
            }),
            PAIS: agregarValidaciones({
                required: true
            }),
            RUCLOCADOR: agregarValidaciones({
                required: true,
                maxlength: 11,
            }),
            EMPRESALOCADOR: agregarValidaciones({
                required: true
            }),
            GERENTELOCADOR: agregarValidaciones({
                required: true
            }),
            DNILOCADOR: agregarValidaciones({
                required: true
            }),
            DIRECCIONLOCADOR: agregarValidaciones({
                required: true
            }),
            PROVINCIALOCADOR: agregarValidaciones({
                required: true
            }),
            PAISLOCADOR: agregarValidaciones({
                required: true
            }),
            SERVICIOCONTRATO: agregarValidaciones({
                required: true
            }),
            CASOSEGUIDO: agregarValidaciones({
                required: true
            }),
            CASOLOCADOR: agregarValidaciones({
                required: true
            }),
            GDMONEDA: agregarValidaciones({
                required: true
            }),
            HONORARIO: agregarValidaciones({
                required: true
            }),
            GDENTDD: agregarValidaciones({
                required: true
            }),
            CUENTA: agregarValidaciones({
                required: true
            }),
            CCICUENTA: agregarValidaciones({
                required: true
            }),
        },
        variables: {
            isLocador: false,
        }
    };

    const globalCrud = {
        init: () => {
            globalCrud.eventos.selects2();
        },
        eventos: {
            selects2: async () => {
                try {
                    let GRUPODATOS = "GDENTDD,GDMONEDA";
                    if (!GRUPODATOS) return;

                    const obtenerSelects = $.ajax({
                        url: uisApis.GD + '=ObtenerAll',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                        },
                        type: 'GET',
                        data: {
                            GDTOS: GRUPODATOS
                        }
                    });

                    const ObtenerPaises = $.ajax({
                        url: uisApis.GD + '=ObtenerAll&VLR1=1',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                        },
                        type: 'GET',
                        data: {
                            VLR1: '1'
                        }
                    });

                    const [responseSelects, responsePaises] = await Promise.all([obtenerSelects, ObtenerPaises]);

                    if (responseSelects?.data) {
                        paises = responsePaises.data;
                        let selects = document.querySelectorAll('select');
                        selects = Array.from(selects).filter(select => select.getAttribute('name') !== 'CESTDO');

                        selects.forEach(select => {
                            const name = select.getAttribute('name');
                            const data = responseSelects.data.filter(d => d.gdpdre === name);
                            select.innerHTML = `<option value="">-- Seleccione</option>`;

                            if (data.length > 0) {
                                data.forEach(d => {
                                    select.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
                                });
                            }
                        });
                    }

                    if (responsePaises?.data) {
                        let selects = ["#PAIS", "#PAISLOCADOR"];
                        monedas = responseSelects.data.filter(d => d.gdpdre === 'GDMONEDA');
                        entidades = responseSelects.data.filter(d => d.gdpdre === 'GDENTDD');

                        selects.forEach(select => {
                            let selectElement = document.querySelector(select);
                            selectElement.innerHTML = `<option value="">-- Seleccione</option>`;
                            responsePaises.data.forEach(d => {
                                selectElement.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
                            });
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            },
        }
    }

    return {
        init: async () => {
            await func.selects2();
            await func.limitarCaracteres();
            await globalCrud.init();
            plantillasCrud.init();
            plantillasCrud.globales();
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
