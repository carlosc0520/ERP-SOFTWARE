/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    const uisApis = {
        API: '/Usuarios/Personas/Index?handler',
    };

    const usuarioCrud = {
        init: () => { },
        globales: () => {
            $("#btnAddContacto").on('click', async function () {
                if (usuarioCrud.variables.rowPerfil) {
                    const persona = usuarioCrud.variables.rowPerfil;
                    let base64Image = '';
                    if (persona.rtaftO2 && persona.rtaftO2.trim() !== '') {
                        base64Image = persona.rtaftO2;
                    }

                    let vcfContent =
                        `BEGIN:VCARD\r\n` +
                        `VERSION:3.0\r\n` +
                        `REV:${new Date().toISOString()}\r\n` +
                        `N;CHARSET=utf-8:${(persona.ncmpto.replace(/,/g, ';') || '').trim()};;;;\r\n` +
                        `FN;CHARSET=utf-8:${persona.ncmpto || ''}\r\n` +
                        `ORG;CHARSET=utf-8:${persona.marca || ''}\r\n` +
                        `TITLE;CHARSET=utf-8:${persona.cargo || ''}\r\n` +
                        `TEL;CELL:${persona.telfno || ''}\r\n` +
                        `EMAIL;INTERNET:${persona.correo || ''}\r\n` +
                        (base64Image ? `PHOTO;ENCODING=b;TYPE=JPEG:${base64Image}\r\n` : "") +
                        `END:VCARD`;

                    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${persona.ncmpto || 'contacto'}.vcf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    URL.revokeObjectURL(url);
                }
            });


        },
        variables: {
            rowPerfil: null,
        },
        eventos: {
            obtenerPersona: (ID) => {
                // swalFire.cargando('Cargando datos del perfil...');
                let aleatorio = Math.floor(Math.random() * 1000) + "APIDENTIFICADOR";
                $.ajax({
                    url: `${uisApis.API}=BuscarFind&ID=${ID}&search=&length=1&start=0`,
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + aleatorio);
                    },
                    success: async function (response) {
                        if (response && response.data && response.data.length > 0) {
                            const persona = response.data[0];
                            usuarioCrud.variables.rowPerfil = persona;
                            console.log(persona);
                            let redes = persona.redes ? JSON.parse(persona.redes) : [];
                            let color = '';
                            redes.forEach(r => {
                                color = 'btn-' + r.ICON.split('bi bi-')[1];
                                $("#redes-sociales").append(`
                                    <a style="color: #fff!important" href="${r.ENLACE}" target="_blank" class="btn-contact btn ${color} small-badge"><i class="${r.ICON}"></i></a>
                                `);
                            });

                            $('#IMG_PERFIL').attr('src', persona.rtafto ? persona.rtafto : 'https://placehold.co/160x160');
                            $('#IMG_PERFIL_EMP').attr('src', persona.rtaftoemp ? persona.rtaftoemp : 'https://placehold.co/160x160');
                            $("#NOMBRES_PERFIL").text(persona.ncmpto || 'N/A');
                            $("#CARGO_PERFIL").text(persona.cargo || 'N/A');
                            $("#EMPRESA_PERFIL").text(persona.marca || 'N/A');
                            $("#CORREO_PERFIL").text(persona.correo || 'N/A');
                            $("#CORREO_PERFIL").attr('href', `mailto:${persona.correo || ''}`);

                            //* T1
                            $("#NOMBRES_PERFIL_T1").text(persona.ncmpto || 'N/A');
                            $("#CARGO_PERFIL_T1").text(persona.cargo || 'N/A');
                            $("#RESENA_PERFIL_T1").text(persona.resena || 'N/A');

                            //* T2
                            $("#EMPRESA_T2").text(persona.marca || 'N/A');
                            $("#WEB_EMPRESA_T2").text(persona.webpage || 'N/A');
                            $("#WEB_EMPRESA_T2").attr('href', persona.webpage || '#');

                            //* T3
                            $("#CORREO_PERFIL_T3").text(persona.correo || 'N/A');
                            $("#CORREO_PERFIL_T3").attr('href', `mailto:${persona.correo || ''}`);
                            $("#TELEFONO_PERFIL_T3").text(persona.telfno || 'N/A');
                            $("#TELEFONO_PERFIL_T3").attr('href', `tel:${persona.telfno || ''}`);
                            let ciudad = '';
                            if (persona.departamento && persona.departamento.trim() !== '') {
                                ciudad = persona.departamento;
                            }

                            if (persona.provincia && persona.provincia.trim() !== '') {
                                if (ciudad !== '') ciudad += ', ';
                                ciudad += persona.provincia;
                            }

                            if (persona.distrito && persona.distrito.trim() !== '') {
                                if (ciudad !== '') ciudad += ', ';
                                ciudad += persona.distrito;
                            }

                            $("#CIUDAD_PERFIL_T3").text(ciudad || 'N/A');
                            $("#DIRECCION_PERFIL_T3").text(persona.direccion || 'N/A');

                            // * T4
                            $("#QR_CODE").attr('src', await usuarioCrud.eventos.generateBase64QR(ID));
                        } else {
                            swalFire.error('No se encontró la persona con el ID proporcionado');
                        }
                    },
                    error: function (xhr, status, error) {
                        swalFire.error('Error al obtener los datos de la persona: ' + error);
                    },
                    complete: function () {
                        $(".profile-banner").removeClass('d-none');
                        $(".profile-card").removeClass('d-none');
                        $("#spinner-container-imagen").remove();
                        swalFire.cerrar();
                    }
                });
            },
            generateBase64QR: (identificador) => {
                return new Promise((resolve, reject) => {
                    const url = `https://caroasociados.pe/Perfil?IDNTFCN=${identificador}`;

                    // Contenedor temporal (oculto)
                    const container = document.createElement('div');
                    Object.assign(container.style, {
                        position: 'fixed',
                        left: '-10000px',
                        top: '-10000px'
                    });
                    document.body.appendChild(container);

                    try {
                        new QRCode(container, {
                            text: url,
                            width: 200,
                            height: 200,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    } catch (err) {
                        document.body.removeChild(container);
                        return reject(new Error("No se pudo generar el QR. Verifica que QRCode esté cargado."));
                    }

                    // Función para extraer la imagen
                    const tryExtract = () => {
                        const img = container.querySelector('img');
                        if (img?.src?.startsWith('data:')) {
                            document.body.removeChild(container);
                            return resolve(img.src);
                        }

                        const canvas = container.querySelector('canvas');
                        if (canvas?.toDataURL) {
                            document.body.removeChild(container);
                            return resolve(canvas.toDataURL('image/png'));
                        }

                        if (window.html2canvas) {
                            html2canvas(container, { backgroundColor: null }).then(canvasRaster => {
                                document.body.removeChild(container);
                                resolve(canvasRaster.toDataURL('image/png'));
                            }).catch(err => {
                                document.body.removeChild(container);
                                reject(err);
                            });
                            return true;
                        }
                        return false;
                    };

                    // Caso: si es <img> esperar a que cargue
                    const img = container.querySelector('img');
                    if (img) {
                        img.onload = () => tryExtract();
                    }

                    const observer = new MutationObserver(() => {
                        if (tryExtract()) observer.disconnect();
                    });
                    observer.observe(container, { childList: true, subtree: true });
                });
            }
        },
    }

    return {
        init: async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const IDNTFCN = urlParams.get('IDNTFCN');
            if (IDNTFCN) {
                usuarioCrud.globales();
                usuarioCrud.eventos.obtenerPersona(IDNTFCN);
            } else {
                swalFire.error('No se encontró el contacto seleccionado', {
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
