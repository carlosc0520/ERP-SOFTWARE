const executeView = () => {
    const uisApis = {
        API: '/Comercial/Plantillas/PropuestaHonorarios/Index?handler',
    };
    const dataPrueba = {
        SERVICIO: 'Servicio de Consultoría',
        ASUNTO1: 'Asunto 1',
        ASUNTO2: 'Asunto 2',
        ASUNTO3: 'Asunto 3',
        SIMBOLO: 'Simbolo',
        MONTO: 1000,
        APROBACION: 'Aprobacion',
        CLIENTE: 'Calos Ruben Carbajal matias'
    }
    const plantillasCrud = {
        init: () => { },

        globales: () => {
            $("#clear").on('click', function () {
                plantillasCrud.eventos.BORRAR();
            });

            configFormVal('formContrato', plantillasCrud.validaciones, () => plantillasCrud.eventos.GENERATE());

            // cargar data  
            $('#formContrato').find('input, select').each(function () {
                const name = $(this).attr('name');
                if (dataPrueba[name]) {
                    $(this).val(dataPrueba[name]);
                }
            });
        },
        eventos: {
            GENERATE: async () => {
                const formData = new FormData(document.getElementById('formContrato'));
                const simbolo = formData.get('SIMBOLO');
                const monto = formData.get('MONTO');
                const textoMonto  = convertirMontoATexto(monto, simbolo === 'S/.' ? 'soles' : simbolo === '$' ? 'dólares' : simbolo === '€' ? 'euros' : 'pesos');
                formData.set('LECTURA', textoMonto);

                swalFire.cargando(['Generando documento...', 'Por favor espere un momento']);

                // peticion PSOT
                $.ajax({
                    url: uisApis.API + '=GenerateDocument',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
                    },
                    type: 'POST',
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    data: formData,
                    success: (data) => {
                        console.log(data);
                        if (data.success) {
                            // descagar data.base64Pdf
                            const link = document.createElement('a');
                            link.href = 'data:application/pdf;base64,' + data.base64Pdf;
                            link.download = 'PropuestaHonorarios.pdf';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            swalFire.success('Documento generado correctamente');
                        } else {
                            swalFire.error('Error al generar el documento');
                        }
                    },
                    error: (error) => {
                        swalFire.error('Error al generar el documento');
                    }
                });
            },
            BORRAR: () => {
                $('#formContrato').trigger("reset");
                $('#formContrato').find('select').trigger('change');
            }
        },
        validaciones: {
            SERVICIO: agregarValidaciones({
                required: true
            }),
            ASUNTO1: agregarValidaciones({
                required: true
            }),
            ASUNTO2: agregarValidaciones({
                required: true
            }),
            ASUNTO3: agregarValidaciones({
                required: true
            }),
            SIMBOLO: agregarValidaciones({
                required: true
            }),
            MONTO: agregarValidaciones({
                required: true,
            }),
            APROBACION: agregarValidaciones({
                required: true
            }),
            CLIENTE: agregarValidaciones({
                required: true
            }),

        },
        variables: {
            isLocador: false,
        }
    };

    return {
        init: async () => {
            await func.limitarCaracteres();
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
