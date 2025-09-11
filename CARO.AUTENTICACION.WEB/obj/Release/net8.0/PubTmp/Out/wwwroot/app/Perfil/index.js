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
        globales: () => { },
        variables: () => { },
        eventos: {
            obtenerPersona: (ID) => {
                swalFire.cargando('Cargando datos del perfil...');
                let aleatorio = Math.floor(Math.random() * 1000) + "APIDENTIFICADOR";
                $.ajax({
                    url: `${uisApis.API}=Buscar&ID=${ID}&search=&length=1&start=0`,
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + aleatorio);
                    },
                    success: async function (response) {
                        if (response && response.data && response.data.length > 0) {
                            const persona = response.data[0];
                            console.log(persona);
                            $('#IMG_PERFIL').attr('src', persona.rtafto ? persona.rtafto : '/images/placeholder.png');
                            $("#NOMBRES_PERFIL").text(persona.ncmpto || 'N/A');
                            $("#CARGO_PERFIL").text(persona.rol || 'N/A');
                            $("#CORREO_PERFIL").text(persona.correo || 'N/A');
                            $("#CORREO_PERFIL").attr('href', `mailto:${persona.correo || ''}`);
                            $("#TELEFONO_PERFIL").text(persona.tlfno || 'N/A');
                            $("#TELEFONO_PERFIL").attr('href', `tel:${persona.tlfno || ''}`);
                                $("#QR_CODE").attr('src', await usuarioCrud.eventos.generateBase64QR(ID));
                        } else {
                            swalFire.error('No se encontró la persona con el ID proporcionado');
                        }
                    },
                    error: function (xhr, status, error) {
                        swalFire.error('Error al obtener los datos de la persona: ' + error);
                    },
                    complete: function () {
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

                    // Si no hay imagen, observar cambios en el DOM
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
