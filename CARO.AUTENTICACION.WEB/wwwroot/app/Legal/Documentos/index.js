/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
    const uisApis = {
        API: '/Legal/Documentos/Index?handler'
    };

    // * VARIABLES
    let theme = $('html').hasClass('light-style') ? 'default' : 'default-dark';

    // * TABLAS
    const documentosCrud = {
        init: () => {
            documentosCrud.eventos.OBTENER();
        },
        globales: () => {
            if (documentosCrud.variables.dragDrop.length) {
                documentosCrud.variables.dragDrop.jstree({
                    core: {
                        themes: {
                            name: theme
                        },
                        check_callback: true,
                        data: [],
                        multiple: false
                    },
                    plugins: ['types', 'dnd'],
                    types: {
                        default: {
                            icon: 'bx bx-folder text-grey'
                        },
                        html: {
                            icon: 'bx bxl-html5 text-danger'
                        },
                        css: {
                            icon: 'bx bxl-css3 text-info'
                        },
                        'image/png': {
                            icon: 'bx bx-image text-primary'
                        },
                        'image/jpeg': {
                            icon: 'bx bx-image text-primary'
                        },
                        js: {
                            icon: 'bx bxl-nodejs text-warning'
                        },
                        pdf: {
                            icon: 'bx bxl-adobe text-danger'
                        },
                        'application/vnd.openxmlformats-officedocument.word': {
                            icon: 'bx bx-file text-primary'
                        },
                        excel: {
                            icon: 'bx bxl-excel text-success'
                        },
                        powerpoint: {
                            icon: 'bx bxl-powerpoint text-danger'
                        },
                        'application/pdf': {
                            icon: 'bx bxl-adobe text-danger'
                        },
                        'application/msword': {
                            icon: 'bx bx-file text-primary'
                        },
                        'application/vnd.ms-excel': {
                            icon: 'bx bxl-excel text-success'
                        },
                        'application/vnd.ms-powerpoint': {
                            icon: 'bx bxl-powerpoint text-danger'
                        },
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                            icon: 'bx bx-file text-success'
                        },
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
                            icon: 'bx bx-file text-primary'
                        },
                        'image/svg+xml': {
                            icon: 'bx bx-image text-success'
                        },
                    },
                });


                documentosCrud.variables.dragDrop.on('rename_node.jstree', (e, data) => {
                    let nuevo = data.text;
                    let padre = data.node.parent;

                    if (data.old === nuevo && nuevo != "Nueva Carpeta") { return false; }

                    let formData = new FormData();
                    formData.append('ID', data.node.id);
                    formData.append('NOMBRE', nuevo);
                    formData.append('GDTPOFILE', '1');
                    formData.append('EXTENSION', "");
                    formData.append('IDPADRE', padre);
                    formData.append('FILE', null);

                    $.ajax({
                        url: uisApis.API + '=Add',
                        type: 'POST',
                        data: formData,
                        contentType: false,
                        processData: false,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                        },
                        success: async response => {
                            let ref = documentosCrud.variables.dragDrop.jstree(true);
                            if (!response?.esSatisfactoria) {
                                if (isNaN(data?.node?.id)) {
                                    ref.delete_node(data.node);
                                }
                                return
                            }

                            ref.set_id(data.node, response.codEstado);
                        },
                        error: error => {
                            let ref = documentosCrud.variables.dragDrop.jstree(true);
                            if (isNaN(data?.node?.id)) {
                                ref.delete_node(data.node);
                            }
                        }
                    });

                });

                documentosCrud.variables.dragDrop.on('move_node.jstree', (e, data) => {
                    let id = data.node.id;
                    let padre = data.parent;
                    let name = data.node.text;

                    // QUE EL NJUEVO PARENT DEBE SER UN repositorio
                    let ref = documentosCrud.variables.dragDrop.jstree(true);
                    let isType = ref.get_node(padre)?.original?.isType === 'repositorio';
                    if (!isType) {
                        ref.move_node(data.node, data.old_parent, data.old_position);
                        return false;
                    }


                    let formData = new FormData();
                    formData.append('ID', id);
                    formData.append('IDPADRE', padre);
                    formData.append('NOMBRE', name);
                    formData.append('TIPO', 6);

                    $.ajax({
                        url: uisApis.API + '=Update',
                        type: 'POST',
                        data: formData,
                        contentType: false,
                        processData: false,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                        },
                        success: async response => {
                            if (!response?.esSatisfactoria) {
                                ref.move_node(data.node, data.old_parent, data.old_position);
                                return
                            }
                        },
                        error: error => {
                            ref.move_node(data.node, data.old_parent, data.old_position);
                        }
                    });
                });
            }

            $('#btnNuevo').click(() => {
                let ref = documentosCrud.variables.dragDrop.jstree(true),
                    sel = ref.get_selected();

                let isType = ref.get_node(sel)?.original?.isType === 'repositorio';
                if (!isType || !sel.length) { return false; }

                sel = sel[0];
                sel = ref.create_node(sel, { type: "file", isType: "repositorio", text: "Nueva Carpeta" });
                if (sel) {
                    ref.edit(sel);
                }
            });

            $('#btnRename').click(() => {
                let ref = documentosCrud.variables.dragDrop.jstree(true),
                    sel = ref.get_selected();
                if (!sel.length) { return false; }
                sel = sel[0];
                if (['0', 0].includes(sel)) { return false; }
                ref.edit(sel);
            });

            $('#btnDelete').click(() => {
                let ref = documentosCrud.variables.dragDrop.jstree(true),
                    sel = ref.get_selected();
                let id = sel[0];

                if (!sel.length
                    || ['0', 0].includes(id)
                ) { return false; }

                swalFire.delete('¿Está seguro de eliminar el elemento seleccionado?', {
                    1: () => {
                        let formData = new FormData();
                        formData.append('ID', id);

                        documentosCrud.eventos.CARGA();
                        $.ajax({
                            url: uisApis.API + '=Delete',
                            type: 'POST',
                            data: formData,
                            contentType: false,
                            processData: false,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                            },
                            success: async response => {
                                if (!response?.esSatisfactoria) { return false; }
                                ref.delete_node(sel);
                            },
                            error: error => swalFire.error('Ocurrió un error al eliminar el elemento'),
                            complete: () => documentosCrud.eventos.CERRAR()
                        });
                    }
                });
            });

            $('#btnSubir').click(async () => {
                let ref = documentosCrud.variables.dragDrop.jstree(true),
                    sel = ref.get_selected();

                let isType = ref.get_node(sel)?.original?.isType === 'repositorio';
                if (!isType || !sel.length) {
                    return false;
                }

                let input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx';

                input.onchange = async e => {
                    let file = e.target.files[0];

                    if (!file) {
                        return false;
                    }

                    let formData = new FormData();
                    formData.append('ID', null);
                    formData.append('NOMBRE', file.name);
                    formData.append('GDTPOFILE', '2');
                    formData.append('EXTENSION', file.type);
                    formData.append('IDPADRE', sel[0]);
                    formData.append('TIPO', 1);
                    formData.append('FILE', file);

                    try {
                        documentosCrud.eventos.CARGA();
                        await $.ajax({
                            url: uisApis.API + '=Add',
                            type: 'POST',
                            data: formData,
                            contentType: false,
                            processData: false,
                            beforeSend: xhr => {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || ''));
                            },
                            success: response => {
                                if (!response?.esSatisfactoria) {
                                    swalFire.error('No se pudo subir el archivo');
                                    return;
                                }

                                ref.create_node(sel, {
                                    id: response.codEstado,
                                    type: file.type,
                                    text: file.name,
                                    icon: documentosCrud.eventos.OBTENERICONO(file.type)
                                });
                            },
                            error: () => swalFire.error('Ocurrió un error al subir el archivo'),
                            complete: () => documentosCrud.eventos.CERRAR()
                        });
                    } catch (err) {
                        swalFire.error('Error inesperado al procesar la solicitud');
                    }
                };

                input.click();
            });

            $('#btnPreview').click(async () => {
                $('#frame_previsualizacion').attr('src', '');
                let ref = documentosCrud.variables.dragDrop.jstree(true),
                    sel = ref.get_selected();
                let isType = ref.get_node(sel)?.original?.isType === 'repositorio';

                if (!sel.length || isType) { return false; }

                documentosCrud.eventos.CARGA();
                await $.ajax({
                    url: uisApis.API + '=Obtener&ID=' + sel[0],
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                    },
                    success: async response => {
                        if (response.success) {
                            let tipo = response.nombre.split('.').pop();

                            if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(tipo)) {
                                let a = document.createElement('a');
                                a.href = response.base64Data;
                                a.download = response.nombre;
                                a.click();
                                return true;
                            }

                            $('#frame_previsualizacion').attr('src', response.base64Data);
                            return true;
                        }


                        return false;
                    },
                    error: error => swalFire.error('Ocurrió un error al obtener los datos'),
                    complete: () => documentosCrud.eventos.CERRAR()
                });
            });

            $('#btnDownload').click(async () => {
                let ref = documentosCrud.variables.dragDrop.jstree(true),
                    sel = ref.get_selected();
                let isType = ref.get_node(sel)?.original?.isType === 'repositorio';

                if (!sel.length || isType) { return false; }

                documentosCrud.eventos.CARGA();
                await $.ajax({
                    url: uisApis.API + '=Obtener&ID=' + sel[0],
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                    },
                    success: async response => {
                        if (response.success) {
                            let a = document.createElement('a');
                            a.href = response.base64Data;
                            a.download = response.nombre;
                            a.click();
                            return true;
                        }

                        return false;
                    },
                    error: error => swalFire.error('Ocurrió un error al obtener los datos'),
                    complete: () => documentosCrud.eventos.CERRAR()
                });
            });
        },
        variables: {
            rowEdit: {},
            dragDrop: $('#jstree-drag-drop'),
            treview: []
        },
        eventos: {
            OBTENER: async () => {
                documentosCrud.eventos.CARGA();
                await $.ajax({
                    url: uisApis.API + '=Buscar',
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
                    },
                    success: async response => {
                        let data = response?.data || [];
                        let map = {};
                        let roots = [];

                        data.forEach(item => {
                            map[item.id] = { ...item, Hijos: [] };
                        });



                        data.forEach(item => {
                            if (item.idpadre === null) {
                                roots.push(map[item.id]);
                            } else {
                                if (map[item.idpadre]) {
                                    map[item.idpadre].Hijos.push(map[item.id]);
                                }
                            }
                        });


                        documentosCrud.variables.treview = [{
                            id: 0,
                            idpadre: null,
                            gdtpofile: "1",
                            nombre: "Directorio",
                            extension: "",
                            Hijos: roots
                        }];
                        documentosCrud.eventos.RESET();
                    },
                    error: error => swalFire.error('Ocurrió un error al obtener los datos'),
                    complete: () => documentosCrud.eventos.CERRAR()
                });
            },
            RESET: () => {
                let data = documentosCrud.variables.treview.map(item => {
                    const getChildren = (hijos) => {
                        return hijos.map(hijo => {
                            return {
                                id: hijo.id,
                                idpadre: hijo.idpadre,
                                gdtpofile: hijo.gdtpofile,
                                text: hijo.nombre,
                                isType: hijo.gdtpofile == "1" ? "repositorio" : "file",
                                type: hijo.extension,
                                children: hijo.Hijos && hijo.Hijos.length > 0 ? getChildren(hijo.Hijos) : []
                            };
                        });
                    };

                    return {
                        id: item.id,
                        idpadre: item.idpadre,
                        gdtpofile: item.gdtpofile,
                        text: item.nombre,
                        isType: item.gdtpofile == "1" ? "repositorio" : "file",
                        type: item.extension,
                        children: item.Hijos && item.Hijos.length > 0 ? getChildren(item.Hijos) : []
                    };
                });

                documentosCrud.variables.dragDrop.jstree(true).settings.core.data = data;
                documentosCrud.variables.dragDrop.jstree(true).refresh();
            },
            OBTENERICONO: (type) => {
                switch (type) {
                    case 'image/jpeg':
                    case 'image/png':
                    case 'image/gif':
                    case 'image/bmp':
                        return 'bx bx-image text-primary';
                    case 'application/pdf':
                        return 'bx bxl-adobe text-danger';
                    case 'application/msword':
                    case 'application/vnd.openxmlformats-officedocument.word':
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                        return 'bx bx-file text-primary';
                    case 'application/vnd.ms-excel':
                    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        return 'bx bx-file text-success';
                    case 'application/vnd.ms-powerpoint':
                    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                        return 'bx bx-file text-danger';
                    default:
                        return 'bx bx-file text-warning';
                }
            },
            CARGA: () => {
                $("#card-preview").block({
                    message: '<div class="spinner-border text-primary" role="status"></div>',
                    css: {
                        backgroundColor: 'transparent',
                        border: '0'
                    },
                    overlayCSS: {
                        backgroundColor: '#000',
                        opacity: 0.1
                    },
                    onBlock: function () {
                        emailListInstance.settings.suppressScrollY = true;
                    },
                    onUnblock: function () {
                        emailListInstance.settings.suppressScrollY = false;
                    }
                });
            },
            CERRAR: () => {
                $("#card-preview").unblock();
            }
        },
        formularios: {},
        validaciones: {
            EDITAR: {

            }
        }
    };


    return {
        init: async () => {
            documentosCrud.init();
            documentosCrud.globales();
        }
    };
}

const useContext = async () => {
    $.ajax({
        url: '/Login/Index?handler=Validate&accessToken=' + localStorage.getItem('accessToken'),
        type: 'GET',
        success: data => (data?.success ? executeView().init() : (window.location.href = '/Login')),
        error: error => (window.location.href = '/Login')
    });
};

useContext();
