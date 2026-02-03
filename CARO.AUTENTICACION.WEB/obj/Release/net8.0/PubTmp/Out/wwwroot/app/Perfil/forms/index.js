/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    const uisApis = {
        API: '/Comercial/Plantillas/checklistPlantilla/Index?handler',
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    let formularioName = "";

    const formularioCrud = {
        init: () => { },
        globales: () => { },
        variables: {
            formulario: {},
            totalPreguntas: 0
        },
        setSpinnerText: (text, subtext = 'Por favor espere un momento') => {
            $('.spinner-text').text(text);
            if (subtext) {
                $('.spinner-subtext').text(subtext);
            }
        },
        updateProgress: () => {

            // Buscar tanto question-card como td con data-pregunta-id (para modo lista)
            let preguntas = $('#preguntas-container .question-card');
            let isTableFormat = false;

            // Si no hay question-card, buscar en formato tabla
            if (preguntas.length === 0) {
                preguntas = $('#preguntas-container td[data-pregunta-id]');
                isTableFormat = true;
            }

            const totalPreguntas = preguntas.length;

            let preguntasRespondidas = 0;

            preguntas.each(function (index) {
                const questionElement = $(this);
                const preguntaId = questionElement.data('pregunta-id');

                // En formato tabla, los inputs están en el siguiente td (hermano)
                const searchScope = isTableFormat ? questionElement.closest('tr') : questionElement;

                // Verificar si la pregunta tiene respuesta
                let tieneRespuesta = false;

                // Radio buttons
                const radioChecked = searchScope.find('input[type="radio"]:checked');
                if (radioChecked.length > 0) {
                    tieneRespuesta = true;
                }
                // Checkboxes
                else if (searchScope.find('input[type="checkbox"]:checked').length > 0) {
                    tieneRespuesta = true;
                }
                // Textarea
                else if (searchScope.find('textarea').val()?.trim()) {
                    tieneRespuesta = true;
                }
                // Star rating - buscar el input hidden específico con el ID de la pregunta
                else if (searchScope.find('.star-rating-container').length > 0 || searchScope.find('[id^="star-rating_"]').length > 0) {
                    // Buscar el input hidden con el ID específico de la pregunta
                    const ratingInput = $(`#pregunta_${preguntaId}_valor`);
                    const ratingValue = ratingInput.val();
                    if (ratingValue && parseFloat(ratingValue) > 0) {
                        tieneRespuesta = true;
                    }
                }
                // Select
                else if (searchScope.find('select').val()) {
                    tieneRespuesta = true;
                }
                // Input text
                else if (searchScope.find('input[type="text"]').val()?.trim()) {
                    tieneRespuesta = true;
                }

                if (tieneRespuesta) {
                    preguntasRespondidas++;
                    if (isTableFormat) {
                        questionElement.closest('tr').addClass('answered');
                    } else {
                        questionElement.addClass('answered');
                    }
                } else {
                    if (isTableFormat) {
                        questionElement.closest('tr').removeClass('answered');
                    } else {
                        questionElement.removeClass('answered');
                    }
                }
            });

            const porcentaje = totalPreguntas > 0 ? Math.round((preguntasRespondidas / totalPreguntas) * 100) : 0;

            // Actualizar barra de progreso
            $('.form-progress-bar').css('width', porcentaje + '%');
            $('#progress-count').text(`${preguntasRespondidas} de ${totalPreguntas}`);
            $('#progress-percentage').text(porcentaje + '%');
            $('#progress-percentage-compact').text(porcentaje + '%');

            // Agregar clase de completado si está al 100%
            if (porcentaje === 100) {
                $('.form-progress').addClass('complete');
                $('.progress-percentage').css('background', '#22c55e');
                $('#progress-indicator').addClass('complete');
            } else {
                $('.form-progress').removeClass('complete');
                $('.progress-percentage').css('background', 'var(--erp-primary)');
                $('#progress-indicator').removeClass('complete');
            }
        },
        eventos: {
            preview: (ID, SENDMAIL) => {
                if (!SENDMAIL || !isValidEmail(SENDMAIL)) {
                    swalFire.error('El correo electrónico no es válido');
                    return;
                }

                $('#spinner-container-modulos').removeClass('d-none');
                formularioCrud.setSpinnerText('Cargando vista previa...', 'Obteniendo tus respuestas');
                let aleatorio = Math.floor(Math.random() * 1000) + "APIDENTIFICADOR";
                $.ajax({
                    url: `${uisApis.API}=AllResp&IDFORM=${ID}&EMAIL=${SENDMAIL}`,
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + aleatorio);
                    },
                    success: async function (response) {
                        if (response && response.data) {
                            let dataForm = response.data;
                            dataForm.preguntas = dataForm.preguntas ? JSON.parse(dataForm.preguntas) : [];
                            formularioCrud.variables.formulario = dataForm;

                            $(".layout-page .content-wrapper").css("background-color", dataForm.bgcolor ? dataForm.bgcolor : "#f8f9fa");
                            $("#page-content-global .container-fluid ").css("background-color", dataForm.bgcolor ? dataForm.bgcolor : "#f8f9fa");
                            $(".content-footer").attr("style", "background-color:" + (dataForm.bgcolor || "#f8f9fa") + " !important");
                            $(".bg-footer-theme").attr("style", "background-color:" + (dataForm.bgcolor || "#f8f9fa") + " !important");
                            document.getElementById("IMG_SKELETON").style.display = "none"; // ocultar skeleton

                            $("#IMG_FORM").removeClass("d-none");
                            $("#IMG_FORM").attr("src", pathFileImg + dataForm.logo);
                            $("#NOMBRE_FORM").text(dataForm.nombre);
                            $("#DESCRIPCION_FORM").html(dataForm.descp);

                            $("#CORREO").val(dataForm.email || "");
                            $("#CORREO").prop("disabled", true);
                            $("#NOMBRE_USUARIO").val(dataForm.nombres || "");
                            $("#NOMBRE_USUARIO").prop("disabled", true);
                            $("#btnGuardar").prop("disabled", true);
                            $("#btnGuardar").addClass("d-none");

                            console.log('Renderizando preguntas en modo preview, GDTYPEP:', dataForm);
                            if (dataForm.gdtpogr == "1") {
                                formularioCrud.eventos.renderizarPreguntasListaPreview(dataForm.preguntas);
                            } else {
                                formularioCrud.eventos.renderizarPreguntasView(dataForm.preguntas);
                            }

                            // En preview, forzar progreso al 100%
                            setTimeout(() => {
                                const totalPreguntas = dataForm.preguntas.length;
                                $('.form-progress-bar').css('width', '100%');
                                $('#progress-count').text(`${totalPreguntas} de ${totalPreguntas}`);
                                $('#progress-percentage').text('100%');
                                $('#progress-percentage-compact').text('100%');
                                $('.form-progress').addClass('complete');
                                $('.progress-percentage').css('background', '#22c55e');
                                $('#progress-indicator').addClass('complete');
                            }, 300);
                        } else {
                            swalFire.error('No se encontró el formulario seleccionado');
                        }
                    },
                    error: function (xhr, status, error) {
                        swalFire.error('Error al obtener los datos del formulario: ' + error);
                    },
                    complete: function () {
                        $('#spinner-container-modulos').addClass('d-none');
                    }
                });
            },
            renderizarPreguntasView: (preguntas) => {
                const contenedor = $('#preguntas-container');
                contenedor.empty();

                if (preguntas.length === 0) {
                    contenedor.append('<p class="text-muted">No hay preguntas disponibles en este formulario.</p>');
                    return;
                }
                /** GDTYPEP = 
                V -> VERDADERO O FALSO | SIN ALTERNATIVAS
                E -> SIN ALTERNATIVAS
                I -> SIN ALTERNATIVAS
                T -> SIN ALTERNATIVAS
                S -> CON OPCIONES
                R -> SOLO MARCA 1 | SI TIENE ALTERNATIVAS 
                C -> PUEDE TENER VARIAS ALTERNATIVAS
                **/
                let RSPSTA = "";
                preguntas.forEach((pregunta, index) => {
                    let preguntaHtml = `<div class="question-card fade-in" data-pregunta-id="${pregunta.ID}" 
                    data-index="${index + 1}">
                        <div class="question-title">
                            <span class="question-number">${index + 1}</span>
                            ${pregunta.DESCP} ${pregunta.REQUIREDP ? '<span class="modern-label-required">*</span>' : ''}
                        </div>
                        <div class="mt-3">`;
                    switch (pregunta.GDTYPEP) {
                        case 'V': // Verdadero o Falso
                            let ISVERFLSO = pregunta.RESPUESTAS?.[0].ISVERFLSO || '';
                            preguntaHtml += `
                                <div class="modern-radio-group">
                                    <div class="modern-radio-option">
                                        <input disabled 
                                        ${ISVERFLSO == true ? 'checked' : ''}
                                        class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_true" value="true">
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_true">Sí</label>
                                    </div>
                                    <div class="modern-radio-option">
                                        <input disabled
                                        ${ISVERFLSO == false ? 'checked' : ''}
                                        class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_false" value="false">
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_false">No</label>
                                    </div>
                                </div>`;
                            break;
                        case 'E': // Respuesta corta
                            let ESCALA = pregunta.RESPUESTAS?.[0].ESCALA || '';
                            preguntaHtml += `<div class="star-rating-container"><div class="star-rating_${pregunta.ID}" id="star-rating_${pregunta.ID}"></div></div>`;
                            setTimeout(() => {
                                $(`.star-rating_${pregunta.ID}`).rateYo({
                                    rating: ESCALA,
                                    fullStar: true,
                                    numStars: 5,
                                    readOnly: true,
                                    starWidth: "35px",
                                    normalFill: "#dadce0",
                                    ratedFill: "#FF6A16",
                                }).on("rateyo.set", function (e, data) {
                                    $(`#pregunta_${pregunta.ID}_valor`).val(ESCALA);
                                });

                                if ($(`#pregunta_${pregunta.ID}_valor`).length === 0) {
                                    contenedor.append(`<input type="hidden" id="pregunta_${pregunta.ID}_valor" name="pregunta_${pregunta.ID}_valor" value="0">`);
                                }
                            }, 100);
                            break;
                        case 'I': // Respuesta larga
                            RSPSTA = pregunta.RESPUESTAS?.[0].RSPSTA || '';
                            preguntaHtml += `<input type="text" disabled class="form-control modern-input noMayus" name="pregunta_${index}" placeholder="Tu respuesta..." value="${RSPSTA}">`;
                            break;
                        case 'T': // Fecha y hora
                            RSPSTA = pregunta.RESPUESTAS?.[0].RSPSTA || '';
                            preguntaHtml += `<textarea class="form-control modern-textarea noMayus" disabled name="pregunta_${index}" rows="3" placeholder="Tu respuesta...">${RSPSTA}</textarea>`;
                            break;
                        case 'S': // Selección desplegable
                            let IDRSPSTA = pregunta.RESPUESTAS?.[0].IDRSPSTA || 0;
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                preguntaHtml += `<select disabled 
                                class="form-select modern-select" name="pregunta_${pregunta.ID}">
                                    <option value="" selected>-- Selecciona una opción --</option>`;
                                pregunta.ALTERNATIVAS.forEach((opcion) => {
                                    preguntaHtml += `<option 
                                    ${opcion.ID === IDRSPSTA ? 'selected' : ''}
                                    value="${opcion.ID}">${opcion.DESCP}</option>`;
                                });
                                preguntaHtml += `</select>`;
                            }
                            else {
                                preguntaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        case 'R': // Opción múltiple (radio)
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                let IDRSPSTA = pregunta.RESPUESTAS?.[0].IDRSPSTA || 0;
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    preguntaHtml += `
                                        <div class="form-check modern-radio">
                                            <input ${opcion.ID === IDRSPSTA ? 'checked' : ''} 
                                            disabled class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                                            <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                                        </div>`;
                                });
                            }
                            else {
                                preguntaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        case 'C': // Casillas de verificación (checkbox)
                            // check puede seleccionar varias opciones
                            let IDRESPS = pregunta.RESPUESTAS?.map(resp => resp.IDRSPSTA) || [];
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    preguntaHtml += `
                                        <div class="form-check modern-checkbox">
                                            <input class="form-check-input" 
                                            ${IDRESPS.includes(opcion.ID) ? 'checked' : ''}
                                            disabled type="checkbox" name="pregunta_${pregunta.ID}[]" id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                                            <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                                        </div>`;
                                });
                            }
                            else {
                                preguntaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        default:
                            preguntaHtml += `<p class="text-muted">Tipo de pregunta no soportado.</p>`;
                            break;
                    }
                    preguntaHtml += `</div>
                    </div>`;

                    contenedor.append(preguntaHtml);

                });

                // Calcular progreso inicial
                setTimeout(() => {
                    formularioCrud.updateProgress();
                }, 200);
            },
            renderizarPreguntasListaPreview: (preguntas) => {
                const contenedor = $('#preguntas-container');
                contenedor.empty();

                if (!preguntas || preguntas.length === 0) {
                    contenedor.append('<p class="text-muted">No hay preguntas disponibles en este formulario.</p>');
                    return;
                }

                let tablaHtml = `<table class="table table-bordered bg-white rounded"><tbody>`;

                preguntas.forEach((pregunta, index) => {
                    tablaHtml += `<tr class="TIPO_${pregunta.GDTYPEP}">
                        <td data-pregunta-id="${pregunta.ID}" data-index="${index + 1}">
                            ${index + 1}. ${pregunta.DESCP} ${pregunta.REQUIREDP ? '<span class="text-danger">*</span>' : ''}
                        </td>
                        <td>`;

                    let RSPSTA = '';
                    switch (pregunta.GDTYPEP) {
                        case 'V':
                            let ISVERFLSO = pregunta.RESPUESTAS?.[0]?.ISVERFLSO || '';
                            tablaHtml += `
                                <div class="TIPO_DIV_${pregunta.GDTYPEP}">
                                    <div class="form-check">
                                        <input class="form-check-input" disabled type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_option_1" value="1" ${ISVERFLSO ? 'checked' : ''}>
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_option_1">Verdadero</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" disabled type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_option_2" value="2" ${!ISVERFLSO ? 'checked' : ''}>
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_option_2">Falso</label>
                                    </div>
                                </div>`;
                            break;
                        case 'E':
                            let ESCALA = pregunta.RESPUESTAS?.[0]?.ESCALA || 0;
                            tablaHtml += `<div class="star-rating_${pregunta.ID}" id="star-rating_${pregunta.ID}"></div>`;
                            setTimeout(() => {
                                $(`.star-rating_${pregunta.ID}`).rateYo({
                                    rating: ESCALA,
                                    fullStar: true,
                                    readOnly: true
                                });
                            }, 0);
                            break;
                        case 'I':
                            RSPSTA = pregunta.RESPUESTAS?.[0]?.RSPSTA || '';
                            tablaHtml += `<input type="text" class="form-control noMayus" disabled name="pregunta_${index}" placeholder="Escribe tu respuesta aquí..." value="${RSPSTA}">`;
                            break;
                        case 'T':
                            RSPSTA = pregunta.RESPUESTAS?.[0]?.RSPSTA || '';
                            tablaHtml += `<textarea class="form-control noMayus" disabled name="pregunta_${index}" rows="3" placeholder="Escribe tu respuesta aquí...">${RSPSTA}</textarea>`;
                            break;
                        case 'S':
                            let IDRSPSTA = pregunta.RESPUESTAS?.[0]?.IDRSPSTA || 0;
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                tablaHtml += `<select disabled class="form-control" name="pregunta_${index}">`;
                                tablaHtml += `<option value="">--Seleccione--</option>`;
                                pregunta.ALTERNATIVAS.forEach(opcion => {
                                    tablaHtml += `<option value="${opcion.ID}" ${opcion.ID === IDRSPSTA ? 'selected' : ''}>${opcion.DESCP}</option>`;
                                });
                                tablaHtml += `</select>`;
                            }
                            break;
                        case 'R':
                            let IDRSP = pregunta.RESPUESTAS?.[0]?.IDRSPSTA || 0;
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                tablaHtml += `<div class="TIPO_DIV_${pregunta.GDTYPEP}">`;
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    tablaHtml += `
                                    <div class="form-check pl-0 mt-2">
                                        <input class="form-check-input" ${opcion.ID === IDRSP ? 'checked' : ''} 
                                        disabled type="radio"
                                         name="pregunta_${pregunta.ID}"
                                          id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                                    </div>`;
                                });
                                tablaHtml += `</div>`;
                            } else {
                                tablaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        case 'C':
                            let IDRESPS = pregunta.RESPUESTAS?.map(resp => resp.IDRSPSTA) || [];
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    tablaHtml += `
                        <div class="form-check mt-2">
                            <input class="form-check-input" ${IDRESPS.includes(opcion.ID) ? 'checked' : ''} disabled type="checkbox" name="pregunta_${pregunta.ID}[]" id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                            <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                        </div>`;
                                });
                            } else {
                                tablaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        default:
                            tablaHtml += `<p class="text-muted">Tipo de pregunta no soportado.</p>`;
                            break;
                    }

                    tablaHtml += `</td></tr>`;
                });

                tablaHtml += `</tbody></table>`;
                contenedor.append(tablaHtml);

                // cerrar swal o loader después de renderizar todo
                if (swalFire?.cerrar) swalFire.cerrar();
            },


            obtener: (ID) => {
                $('#spinner-container-modulos').removeClass('d-none');
                formularioCrud.setSpinnerText('Cargando formulario...', 'Preparando las preguntas');
                let aleatorio = Math.floor(Math.random() * 1000) + "APIDENTIFICADOR";
                $.ajax({
                    url: `${uisApis.API}=Form&ID=${ID}&id=${ID}`,
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + aleatorio);
                    },
                    success: async function (response) {
                        if (response && response.data) {
                            let dataForm = response.data;
                            formularioCrud.variables.formulario = dataForm;
                            formularioName = response.data.nombre || "";
                            dataForm.preguntas = dataForm.preguntas ? JSON.parse(dataForm.preguntas) : [];

                            $(".layout-page .content-wrapper").css("background-color", dataForm.bgcolor ? dataForm.bgcolor : "#f8f9fa");
                            $("#page-content-global .container-fluid ").css("background-color", dataForm.bgcolor ? dataForm.bgcolor : "#f8f9fa");
                            $(".content-footer").attr("style", "background-color:" + (dataForm.bgcolor || "#f8f9fa") + " !important");
                            $(".bg-footer-theme").attr("style", "background-color:" + (dataForm.bgcolor || "#f8f9fa") + " !important");
                            document.getElementById("IMG_SKELETON").style.display = "none"; // ocultar skeleton

                            $("#IMG_FORM").removeClass("d-none");
                            $("#IMG_FORM").attr("src", pathFileImg + dataForm.logo);
                            $("#NOMBRE_FORM").text(dataForm.nombre);
                            $("#DESCRIPCION_FORM").html(dataForm.descp);
                            if (dataForm.gdtpogr == "1") {
                                formularioCrud.eventos.renderizarPreguntasLista(dataForm.preguntas);
                            } else {
                                formularioCrud.eventos.renderizarPreguntas(dataForm.preguntas);
                            }
                        } else {
                            swalFire.error('No se encontró el formulario seleccionado');
                        }
                    },
                    error: function (xhr, status, error) {
                        swalFire.error('Error al obtener los datos del formulario: ' + error);
                    },
                    complete: function () {
                        $('#spinner-container-modulos').addClass('d-none');
                    }
                });
            },
            renderizarPreguntas: (preguntas) => {
                const contenedor = $('#preguntas-container');
                contenedor.empty();

                if (preguntas.length === 0) {
                    contenedor.append('<p class="text-muted">No hay preguntas disponibles en este formulario.</p>');
                    return;
                }
                /** GDTYPEP = 
                V -> VERDADERO O FALSO | SIN ALTERNATIVAS
                E -> SIN ALTERNATIVAS
                I -> SIN ALTERNATIVAS
                T -> SIN ALTERNATIVAS
                S -> CON OPCIONES
                R -> SOLO MARCA 1 | SI TIENE ALTERNATIVAS 
                C -> PUEDE TENER VARIAS ALTERNATIVAS
                **/
                preguntas.forEach((pregunta, index) => {
                    let preguntaHtml = `<div class="question-card fade-in" data-pregunta-id="${pregunta.ID}" 
                    data-index="${index + 1}" style="animation-delay: ${index * 0.05}s;">
                        <div class="question-title">
                            <span class="question-number">${index + 1}</span>
                            ${pregunta.DESCP} ${pregunta.REQUIREDP ? '<span class="modern-label-required">*</span>' : ''}
                        </div>
                        <div class="mt-3">`;
                    switch (pregunta.GDTYPEP) {
                        case 'V': // Verdadero o Falso
                            preguntaHtml += `
                                <div class="modern-radio-group">
                                    <div class="modern-radio-option">
                                        <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_true" value="true">
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_true">Sí</label>
                                    </div>
                                    <div class="modern-radio-option">
                                        <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_false" value="false">
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_false">No</label>
                                    </div>
                                </div>`;
                            break;
                        case 'E': // Respuesta estrellas    
                            preguntaHtml += `<div class="star-rating-container"><div class="star-rating_${pregunta.ID}" id="star-rating_${pregunta.ID}"></div></div>`;
                            setTimeout(() => {
                                $(`.star-rating_${pregunta.ID}`).rateYo({
                                    rating: 0,
                                    fullStar: true,
                                    starWidth: "35px",
                                    normalFill: "#dadce0",
                                    ratedFill: "#FF6A16",
                                }).on("rateyo.set", function (e, data) {
                                    $(`#pregunta_${pregunta.ID}_valor`).val(data.rating);
                                });

                                if ($(`#pregunta_${pregunta.ID}_valor`).length === 0) {
                                    contenedor.append(`<input type="hidden" id="pregunta_${pregunta.ID}_valor" name="pregunta_${pregunta.ID}_valor" value="0">`);
                                }
                            }, 100);
                            break;
                        case 'I': // Respuesta Corta
                            preguntaHtml += `<input type="text" class="form-control modern-input noMayus" name="pregunta_${index}" placeholder="Tu respuesta...">`;
                            break;
                        case 'T': // Respuesta Larga
                            preguntaHtml += `<textarea class="form-control modern-textarea noMayus" name="pregunta_${index}" rows="3" placeholder="Tu respuesta..."></textarea>`;
                            break;
                        case 'S': // Selección desplegable
                            // select con opciones, agrega al comeinza --Seleccione--
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                preguntaHtml += `<select class="form-select modern-select" name="pregunta_${pregunta.ID}">
                                    <option value="" selected>-- Selecciona una opción --</option>`;
                                pregunta.ALTERNATIVAS.forEach((opcion) => {
                                    preguntaHtml += `<option value="${opcion.ID}">${opcion.DESCP}</option>`;
                                });
                                preguntaHtml += `</select>`;
                            }
                            else {
                                preguntaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        case 'R': // Opción múltiple (radio)
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    preguntaHtml += `
                                        <div class="form-check modern-radio">
                                            <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                                            <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                                        </div>`;
                                });
                            }
                            else {
                                preguntaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        case 'C': // Casillas de verificación (checkbox)
                            // check puede seleccionar varias opciones
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    preguntaHtml += `
                                        <div class="form-check modern-checkbox">
                                            <input class="form-check-input" type="checkbox" name="pregunta_${pregunta.ID}[]" id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                                            <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                                        </div>`;
                                });
                            }
                            else {
                                preguntaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        default:
                            preguntaHtml += `<p class="text-muted">Tipo de pregunta no soportado.</p>`;
                            break;
                    }
                    preguntaHtml += `</div>
                    </div>`;

                    contenedor.append(preguntaHtml);

                });

                // Calcular progreso inicial
                setTimeout(() => {
                    formularioCrud.updateProgress();
                }, 200);
            },
            renderizarPreguntasLista: (preguntas) => {
                const contenedor = $('#preguntas-container');
                contenedor.empty();
                if (preguntas.length === 0) {
                    contenedor.append('<p class="text-muted">No hay preguntas disponibles en este formulario.</p>');
                    return;
                }

                let tablaHtml = `<table class="table table-bordered bg-white rounded"><tbody>`;
                preguntas.forEach((pregunta, index) => {
                    tablaHtml += `<tr class="TIPO_${pregunta.GDTYPEP}">
                    <td data-pregunta-id="${pregunta.ID}" data-index="${index + 1}">
                        ${index + 1}. ${pregunta.DESCP} ${pregunta.REQUIREDP ? '<span class="text-danger">*</span>' : ''}
                    </td>
                    <td>`;

                    switch (pregunta.GDTYPEP) {
                        case 'V': // Verdadero o Falso
                            tablaHtml += `
                                <div class="TIPO_DIV_${pregunta.GDTYPEP}">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_true" value="true">
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_true">Verdadero</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_false" value="false">
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_false">Falso</label>
                                    </div>
                                </div>`;
                            break;
                        case 'E': // Respuesta estrellas
                            tablaHtml += `<div class="star-rating_${pregunta.ID}" id="star-rating_${pregunta.ID}"></div>`;
                            setTimeout(() => {
                                $(`.star-rating_${pregunta.ID}`).rateYo({
                                    rating: 0,
                                    fullStar: true,
                                    starWidth: "30px",
                                    normalFill: "#A0A0A0",
                                    ratedFill: "#F39C12",
                                }).on("rateyo.set", function (e, data) {
                                    $(`#pregunta_${pregunta.ID}_valor`).val(data.rating);
                                });

                                if ($(`#pregunta_${pregunta.ID}_valor`).length === 0) {
                                    contenedor.append(`<input type="hidden" id="pregunta_${pregunta.ID}_valor" name="pregunta_${pregunta.ID}_valor" value="0">`);
                                }
                            });
                            break;
                        case 'I': // Respuesta Corta
                            tablaHtml += `<input type="text" class="form-control noMayus" name="pregunta_${index}" placeholder="Escribe tu respuesta aquí...">`;
                            break;
                        case 'T': // Respuesta Larga
                            tablaHtml += `<textarea class="form-control noMayus" name="pregunta_${index}" rows="3" placeholder="Escribe tu respuesta aquí..."></textarea>`;
                            break;
                        case 'S': // Selección desplegable
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                tablaHtml += `<select class="form-control" name="pregunta_${index}">`;
                                tablaHtml += `<option value="">--Seleccione--</option>`;
                                pregunta.ALTERNATIVAS.forEach(opcion => {
                                    tablaHtml += `<option value="${opcion.ID}">${opcion.DESCP}</option>`;
                                });
                                tablaHtml += `</select>`;

                            } else {
                                tablaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        case 'R': // Opción múltiple (radio)
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                tablaHtml += `<div class="TIPO_DIV_${pregunta.GDTYPEP}">`;
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    tablaHtml += `
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                                <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                            </div>`;
                                });
                                tablaHtml += `</div>`;
                            } else {
                                tablaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        case 'C': // Casillas de verificación (checkbox)
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    tablaHtml += `
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="checkbox" name="pregunta_${pregunta.ID}[]" id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                                <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                            </div>`;
                                });
                            } else {
                                tablaHtml += `<p class="text-muted">No hay opciones disponibles.</p>`;
                            }
                            break;
                        default:
                            tablaHtml += `<p class="text-muted">Tipo de pregunta no soportado.</p>`;
                            break;
                    }

                    tablaHtml += `</td></tr>`;
                });

                tablaHtml += `</tbody></table>`;
                contenedor.append(tablaHtml);

                // Calcular progreso inicial
                setTimeout(() => {
                    formularioCrud.updateProgress();
                }, 200);
            },

            attachProgressListeners: () => {

                // Remover listeners anteriores para evitar duplicados
                $(document).off('change', '#preguntas-container input[type="radio"]');
                $(document).off('change', '#preguntas-container input[type="checkbox"]');
                $(document).off('input', '#preguntas-container textarea');
                $(document).off('change', '#preguntas-container select');
                $(document).off('input', '#preguntas-container input[type="text"]');

                // Event listeners para radio buttons
                $(document).on('change', '#preguntas-container input[type="radio"]', function () {
                    formularioCrud.updateProgress();
                });

                // Event listeners para checkboxes
                $(document).on('change', '#preguntas-container input[type="checkbox"]', function () {
                    formularioCrud.updateProgress();
                });

                // Event listeners para textarea
                $(document).on('input', '#preguntas-container textarea', function () {
                    formularioCrud.updateProgress();
                });

                // Event listeners para select
                $(document).on('change', '#preguntas-container select', function () {
                    formularioCrud.updateProgress();
                });

                // Event listeners para input text
                $(document).on('input', '#preguntas-container input[type="text"]', function () {
                    formularioCrud.updateProgress();
                });

                // Event listeners para star rating (rateYo)
                $(document).on('rateyo.set', function () {
                    setTimeout(() => formularioCrud.updateProgress(), 100);
                });

            },
            guardarRespuestas: () => {
                if (!$("#CORREO").val().trim()) {
                    swalFire.errorMensaje('El campo correo es obligatorio.');
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test($("#CORREO").val().trim())) {
                    swalFire.errorMensaje('El campo correo no es válido.');
                    return;
                }

                let respuestas = [];
                let valid = true;
                if (formularioCrud.variables.formulario.gdtpogr == "1") {
                    // tabla
                    $('#preguntas-container table tbody tr').each(function () {
                        let preguntaId = $(this).find('td:first').text().split('. ')[0];
                        let dataPreguntaId = $(this).find('td:first').data('pregunta-id');
                        let dataIndex = $(this).find('td:first').data('index');
                        if (preguntaId) preguntaId = preguntaId.trim();
                        let preguntaText = $(this).find('td:first').text().replace(preguntaId + '. ', '').replace(' *', '').trim();
                        let isRequired = $(this).find('td:first .text-danger').length > 0;
                        let respuesta = null;

                        // Buscar elementos en toda la fila (tr), no solo en la primera celda
                        let rowElement = $(this);

                        // Verificar tipo de pregunta y capturar respuesta
                        if (rowElement.find('input[type="radio"]').length > 0) {
                            respuesta = rowElement.find('input[type="radio"]:checked').val() || null;
                        } else if (rowElement.find('input[type="checkbox"]').length > 0) {
                            respuesta = [];
                            rowElement.find('input[type="checkbox"]:checked').each(function () {
                                respuesta.push($(this).val());
                            });
                        } else if (rowElement.find('select').length > 0) {
                            respuesta = rowElement.find('select').val();
                        } else if (rowElement.find('textarea').length > 0) {
                            respuesta = rowElement.find('textarea').val()?.trim();
                        } else if (rowElement.find('.star-rating_' + dataPreguntaId).length > 0) {
                            respuesta = $(`#pregunta_${dataPreguntaId}_valor`).val();
                        } else if (rowElement.find('input[type="text"]').length > 0) {
                            respuesta = rowElement.find('input[type="text"]').val()?.trim();
                        }

                        if (isRequired) {
                            if (respuesta === null || (Array.isArray(respuesta) && respuesta.length === 0) || respuesta === '') {
                                console.warn(`  - ⚠️ Pregunta requerida sin respuesta!`);
                                swalFire.errorMensaje(`La pregunta <strong>"${dataIndex}.-  ${preguntaText}"</strong> es obligatoria.`);
                                valid = false;
                                return false;
                            }
                        }

                        respuestas.push({
                            IDPRGNTA: dataPreguntaId,
                            IDRSPSTA: respuesta
                        });
                    });

                } else {
                    $('#preguntas-container .question-card').each(function () {
                        let dataPreguntaId = $(this).data('pregunta-id');
                        let dataIndex = $(this).data('index');
                        let preguntaText = $(this).find('.question-title').text().split(`${dataIndex}`)[1]?.replace('*', '').trim();
                        let isRequired = $(this).find('.question-title .modern-label-required').length > 0;
                        let respuesta = null;
                        let cardElement = $(this);

                        // Verificar tipo de pregunta y capturar respuesta
                        if (cardElement.find('input[type="radio"]').length > 0) {
                            respuesta = cardElement.find('input[type="radio"]:checked').val() || null;
                        } else if (cardElement.find('input[type="checkbox"]').length > 0) {
                            respuesta = [];
                            cardElement.find('input[type="checkbox"]:checked').each(function () {
                                respuesta.push($(this).val());
                            });
                        } else if (cardElement.find('select').length > 0) {
                            respuesta = cardElement.find('select').val();
                        } else if (cardElement.find('textarea').length > 0) {
                            respuesta = cardElement.find('textarea').val()?.trim();
                        } else if (cardElement.find('.star-rating_' + dataPreguntaId).length > 0) {
                            respuesta = $(`#pregunta_${dataPreguntaId}_valor`).val();
                        } else if (cardElement.find('input[type="text"]').length > 0) {
                            respuesta = cardElement.find('input[type="text"]').val()?.trim();
                        }

                        if (isRequired) {
                            if (respuesta === null || (Array.isArray(respuesta) && respuesta.length === 0) || respuesta === '') {
                                console.warn(`  - ⚠️ Pregunta requerida sin respuesta!`);
                                swalFire.errorMensaje(`La pregunta <strong>"${dataIndex}.-  ${preguntaText}"</strong> es obligatoria.`);
                                valid = false;
                                return false;
                            }
                        }

                        respuestas.push({
                            IDPRGNTA: dataPreguntaId,
                            IDRSPSTA: respuesta
                        });
                    });
                }


                if (!valid) return;


                // formularioCrud.eventos.descargarPDF();

                let urlParams = new URLSearchParams(window.location.search);
                let ID = urlParams.get('id');
                let nombreUsuario = $("#NOMBRE_USUARIO").val().trim();
                let correo = $("#CORREO").val().trim();
                let aleatorio = Math.floor(Math.random() * 1000) + "APIDENTIFICADOR";
                respuestas = respuestas.map(r => ({
                    ...r,
                    IDFORMU: ID,
                }));

                // LOS TIPOS C PONERLES IDRSPSTA, ID: {ID: IDRSPSTA}
                let tiposArray = respuestas.filter(r => Array.isArray(r.IDRSPSTA));

                tiposArray.forEach(ta => {
                    ta.IDRSPSTA.forEach((idResp, idx) => {
                        respuestas.push({
                            IDPRGNTA: ta.IDPRGNTA,
                            IDRSPSTA: idResp,
                            IDFORMU: ID
                        });
                    });
                });

                respuestas = respuestas.filter(r => !Array.isArray(r.IDRSPSTA));
                // TODOS LOS IDFORMU A ENTERO
                respuestas.forEach(r => {
                    r.IDFORMU = parseInt(r.IDFORMU, 10);
                });

                $("#btnGuardar").css("display", "none");
                let formData = new FormData();
                formData.append("IDFORMU", ID);
                formData.append("NAMEFORM", formularioName);
                formData.append("EMAIL", correo);
                formData.append("NOMBRES", nombreUsuario);
                formData.append("RESPUESTAS", JSON.stringify(respuestas));
                formData.append("CESTDO", 'A');


                $('#spinner-container-modulos').removeClass('d-none');
                formularioCrud.setSpinnerText('Guardando respuestas...', 'Enviando tu formulario');
                $.ajax({
                    url: uisApis.API + '=AddRespuestas',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('XSRF-TOKEN', aleatorio);
                    },
                    type: 'POST',
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    data: formData,
                    success: function (data) {
                        $('#spinner-container-modulos').addClass('d-none');
                        if (data?.codEstado > 0) {
                            // cerrar spinner
                            swalFire.success(
                                'Su checklist fue enviado correctamente',
                                'Nuestro equipo comercial se estará comunicando con usted en breve.',
                                {
                                    1: () => {
                                        window.location.href = `/Perfil/Forms/index?preview=true&id=${ID}&sendmail=${correo}`;
                                    }
                                }
                            );
                        }


                        if (data?.codEstado <= 0) {
                            $("#btnGuardar").css("display", "block");
                            swalFire.error(data.mensaje);
                        }
                    },
                    error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar sus respuestas')
                });

            },
            descargarPDF: async () => {
                const { jsPDF } = window.jspdf;
                const formulario = document.getElementById("CONTAINER_FORMULARIO");

                // Captura del contenedor en canvas
                const canvas = await html2canvas(formulario, { scale: 2 });
                const imgData = canvas.toDataURL("image/png");

                // Crear documento A4
                const pdf = new jsPDF("p", "mm", "a4");
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                // Escalar la imagen al ancho de la página
                const imgWidth = pageWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                let heightLeft = imgHeight;
                let position = 0;

                // Agregar primera página
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                // Si sobra contenido, generar más páginas
                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save("formulario_respuestas.pdf");
            }

        }
    }

    return {
        init: async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const ID = urlParams.get('id');
            const PREVIEW = urlParams.get('preview');
            const SENDMAIL = urlParams.get('sendmail');

            // Inicializar listeners de progreso UNA SOLA VEZ
            formularioCrud.eventos.attachProgressListeners();

            // Toggle para el indicador de progreso
            $(document).on('click', '#progress-icon-toggle', function () {
                $('#progress-indicator').toggleClass('expanded');
            });

            // Cerrar detalles al hacer click fuera
            $(document).on('click', function (e) {
                if (!$(e.target).closest('#progress-indicator').length) {
                    $('#progress-indicator').removeClass('expanded');
                }
            });

            if (ID && PREVIEW != "true") {
                formularioCrud.eventos.obtener(ID);

                $("#btnGuardar").on("click", function () {
                    formularioCrud.eventos.guardarRespuestas();
                });
            } else if (PREVIEW == "true" && ID) {
                // SENDMAIL debe ser correo y valido sino retorna no
                if (!SENDMAIL || !isValidEmail(SENDMAIL)) {
                    swalFire.error('El correo electrónico no es válido');
                    return;
                }
                formularioCrud.eventos.preview(ID, SENDMAIL);
            } else {
                swalFire.error('No se encontró el formulario seleccionado', {
                    1: () => {
                        window.location.href = '/';
                    }
                });
            }
        }
    };
};

const useContext = async () => {
    executeView().init()
};

useContext();
