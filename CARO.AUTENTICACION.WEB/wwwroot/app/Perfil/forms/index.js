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
            formulario: {}
        },
        eventos: {
            preview: (ID, SENDMAIL) => {
                if (!SENDMAIL || !isValidEmail(SENDMAIL)) {
                    swalFire.error('El correo electrónico no es válido');
                    return;
                }

                swalFire.cargando('Cargando datos...');
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

                            if (dataForm.gdtpogr == "1") {
                                formularioCrud.eventos.renderizarPreguntasListaPreview(dataForm.preguntas);
                            } else {
                                formularioCrud.eventos.renderizarPreguntasView(dataForm.preguntas);
                            }
                        } else {
                            swalFire.error('No se encontró el formulario seleccionado');
                        }
                    },
                    error: function (xhr, status, error) {
                        swalFire.error('Error al obtener los datos del formulario: ' + error);
                    },
                    complete: function () {
                        swalFire.cerrar();
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
                    let preguntaHtml = `<div class="card mb-3" data-pregunta-id="${pregunta.ID}" 
                    data-index="${index + 1}">
                        <div class="card-body">
                            <p class="card-title" style="font-weight: semi-bold!important;">
                                ${index + 1}. ${pregunta.DESCP} ${pregunta.REQUIREDP ? '<span class="text-danger">*</span>' : ''}
                            </p>
                            <div class="mt-3">`;
                    switch (pregunta.GDTYPEP) {
                        case 'V': // Verdadero o Falso
                            let ISVERFLSO = pregunta.RESPUESTAS?.[0].ISVERFLSO || '';
                            preguntaHtml += `
                                <div class="form-check">
                                    <input disabled 
                                    ${ISVERFLSO == true ? 'checked' : ''}
                                    class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_true" value="true">
                                    <label class="form-check-label" for="pregunta_${pregunta.ID}_true">Verdadero</label>
                                </div>
                                <div class="form-check">
                                    <input disabled
                                    ${ISVERFLSO == false ? 'checked' : ''}
                                    class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_false" value="false">
                                    <label class="form-check-label" for="pregunta_${pregunta.ID}_false">Falso</label>
                                </div>`;
                            break;
                        case 'E': // Respuesta corta
                            let ESCALA = pregunta.RESPUESTAS?.[0].ESCALA || '';
                            preguntaHtml += `<div class="star-rating_${pregunta.ID}" id="star-rating_${pregunta.ID}"></div>`;
                            setTimeout(() => {
                                $(`.star-rating_${pregunta.ID}`).rateYo({
                                    rating: ESCALA,
                                    fullStar: true,
                                    numStars: 5,
                                    readOnly: true,
                                    starWidth: "30px",
                                    normalFill: "#A0A0A0",
                                    ratedFill: "#F39C12",
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
                            preguntaHtml += `<input type="text" disabled class="form-control" name="pregunta_${index}" placeholder="Escribe tu respuesta aquí..." value="${RSPSTA}">`;
                            break;
                        case 'T': // Fecha y hora
                            RSPSTA = pregunta.RESPUESTAS?.[0].RSPSTA || '';
                            preguntaHtml += `<textarea class="form-control" disabled name="pregunta_${index}" rows="3" placeholder="Escribe tu respuesta aquí...">${RSPSTA}</textarea>`;
                            break;
                        case 'S': // Selección desplegable
                            let IDRSPSTA = pregunta.RESPUESTAS?.[0].IDRSPSTA || 0;
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                preguntaHtml += `<select disabled 
                                class="form-select" name="pregunta_${pregunta.ID}">
                                    <option value="" selected>-- Seleccione --</option>`;
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
                                        <div class="form-check mt-2">
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
                                        <div class="form-check mt-2">
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
                        </div>
                    </div>`;

                    contenedor.append(preguntaHtml);

                });
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
                                        <input class="form-check-input" disabled type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_option_1" value="1" ${ISVERFLSO === '1' ? 'checked' : ''}>
                                        <label class="form-check-label" for="pregunta_${pregunta.ID}_option_1">Verdadero</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" disabled type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_option_2" value="2" ${ISVERFLSO === '2' ? 'checked' : ''}>
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
                            tablaHtml += `<input type="text" class="form-control" disabled name="pregunta_${index}" placeholder="Escribe tu respuesta aquí..." value="${RSPSTA}">`;
                            break;
                        case 'T':
                            RSPSTA = pregunta.RESPUESTAS?.[0]?.RSPSTA || '';
                            tablaHtml += `<textarea class="form-control" disabled name="pregunta_${index}" rows="3" placeholder="Escribe tu respuesta aquí...">${RSPSTA}</textarea>`;
                            break;
                        case 'S':
                            let IDRSPSTA = pregunta.RESPUESTAS?.[0]?.IDRSPSTA || 0;
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                tablaHtml += `<select disabled class="form-control" name="pregunta_${index}">`;
                                tablaHtml += `<option value="">--Seleccione--</option>`;
                                pregunta.ALTERNATIVAS.forEach(opcion => {
                                    tablaHtml += `<option value="${opcion.ID}" ${opcion.ID === IDRSPSTA ? 'selected' : ''}>${opcion.NOMBRE}</option>`;
                                });
                                tablaHtml += `</select>`;
                            }
                            break;
                        case 'R':
                            let IDRSP = pregunta.RESPUESTAS?.[0]?.IDRSPSTA || 0;
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
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
                swalFire.cargando('Cargando datos...');
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
                        swalFire.cerrar();
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
                    let preguntaHtml = `<div class="card mb-3" data-pregunta-id="${pregunta.ID}" 
                    data-index="${index + 1}">
                        <div class="card-body">
                            <p class="card-title" style="font-weight: semi-bold!important;">
                                ${index + 1}. ${pregunta.DESCP} ${pregunta.REQUIREDP ? '<span class="text-danger">*</span>' : ''}
                            </p>
                            <div class="mt-3">`;
                    switch (pregunta.GDTYPEP) {
                        case 'V': // Verdadero o Falso
                            preguntaHtml += `
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_true" value="true">
                                    <label class="form-check-label" for="pregunta_${pregunta.ID}_true">Verdadero</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_false" value="false">
                                    <label class="form-check-label" for="pregunta_${pregunta.ID}_false">Falso</label>
                                </div>`;
                            break;
                        case 'E': // Respuesta estrellas    
                            preguntaHtml += `<div class="star-rating_${pregunta.ID}" id="star-rating_${pregunta.ID}"></div>`;
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
                            }, 100);
                            break;
                        case 'I': // Respuesta Corta
                            preguntaHtml += `<input type="text" class="form-control" name="pregunta_${index}" placeholder="Escribe tu respuesta aquí...">`;
                            break;
                        case 'T': // Respuesta Larga
                            preguntaHtml += `<textarea class="form-control" name="pregunta_${index}" rows="3" placeholder="Escribe tu respuesta aquí..."></textarea>`;
                            break;
                        case 'S': // Selección desplegable
                            // select con opciones, agrega al comeinza --Seleccione--
                            if (pregunta.ALTERNATIVAS && pregunta.ALTERNATIVAS.length > 0) {
                                preguntaHtml += `<select class="form-select" name="pregunta_${pregunta.ID}">
                                    <option value="" selected>-- Seleccione --</option>`;
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
                                        <div class="form-check mt-2">
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
                                        <div class="form-check mt-2">
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
                        </div>
                    </div>`;

                    contenedor.append(preguntaHtml);

                });
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
                            tablaHtml += `<input type="text" class="form-control" name="pregunta_${index}" placeholder="Escribe tu respuesta aquí...">`;
                            break;
                        case 'T': // Respuesta Larga
                            tablaHtml += `<textarea class="form-control" name="pregunta_${index}" rows="3" placeholder="Escribe tu respuesta aquí..."></textarea>`;
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
                                pregunta.ALTERNATIVAS.forEach((opcion, optIndex) => {
                                    tablaHtml += `
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="radio" name="pregunta_${pregunta.ID}" id="pregunta_${pregunta.ID}_option_${optIndex}" value="${opcion.ID}">
                                <label class="form-check-label" for="pregunta_${pregunta.ID}_option_${optIndex}">${opcion.DESCP}</label>
                            </div>`;
                                });
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

                        let preguntaElem = $(this).find('input, select, textarea, .star-rating_' + dataPreguntaId);
                        if (preguntaElem.length > 0) {
                            if (preguntaElem.is('select')) {
                                respuesta = preguntaElem.val();
                            } else if (preguntaElem.is('textarea')) {
                                respuesta = preguntaElem.val().trim();
                            } else if (preguntaElem.is(`.star-rating_${dataPreguntaId}`)) {
                                respuesta = $(`#pregunta_${dataPreguntaId}_valor`).val();
                            } else if (preguntaElem.is('input[type="radio"]')) {
                                respuesta = $(this).find('input[type="radio"]:checked').val() || null;
                            } else if (preguntaElem.is('input[type="checkbox"]')) {
                                respuesta = [];
                                $(this).find('input[type="checkbox"]:checked').each(function () {
                                    respuesta.push($(this).val());
                                });
                            } else {
                                respuesta = preguntaElem.val().trim();
                            }
                        }
                        if (isRequired) {
                            if (respuesta === null || (Array.isArray(respuesta) && respuesta.length === 0) || respuesta === '') {
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
                    $('#preguntas-container .card').each(function () {
                        let preguntaId = $(this).find('.card-title').text().split('. ')[0];
                        let dataPreguntaId = $(this).data('pregunta-id');
                        let dataIndex = $(this).data('index');
                        if (preguntaId) preguntaId = preguntaId.trim();
                        let preguntaText = $(this).find('.card-title').text().replace(preguntaId + '. ', '').replace(' *', '').trim();
                        let isRequired = $(this).find('.card-title .text-danger').length > 0;
                        let respuesta = null;

                        let preguntaElem = $(this).find('input, select, textarea, .star-rating_' + dataPreguntaId);
                        if (preguntaElem.length > 0) {
                            if (preguntaElem.is('select')) {
                                respuesta = preguntaElem.val();
                            } else if (preguntaElem.is('textarea')) {
                                respuesta = preguntaElem.val().trim();
                            } else if (preguntaElem.is(`.star-rating_${dataPreguntaId}`)) {
                                respuesta = $(`#pregunta_${dataPreguntaId}_valor`).val();
                            }
                            else if (preguntaElem.is('input[type="radio"]')) {
                                respuesta = $(this).find('input[type="radio"]:checked').val() || null;
                            } else if (preguntaElem.is('input[type="checkbox"]')) {
                                respuesta = [];
                                $(this).find('input[type="checkbox"]:checked').each(function () {
                                    respuesta.push($(this).val());
                                });
                            } else {
                                respuesta = preguntaElem.val().trim();
                            }
                        }

                        if (isRequired) {
                            if (respuesta === null || (Array.isArray(respuesta) && respuesta.length === 0) || respuesta === '') {
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


                swalFire.cargando('Guardando respuestas...');
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
                        if (data?.codEstado > 0) {
                            swalFire.success('formulario guardado correctamente', '', {
                                1: () => {
                                    window.location.href = `/Perfil/Forms/index?preview=true&id=${ID}&sendmail=${correo}`;
                                }
                            });
                        }

                        if (data?.codEstado <= 0) swalFire.error(data.mensaje);
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
