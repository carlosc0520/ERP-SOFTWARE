/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Comercial/Cursos/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler',
    MR: '/Seguridad/Marcas/Index?handler'
  };

  // * VARIABLES
  let plantillasTable = 'plantillasTable';
  let CplantillasTable = null;
  let dropzoneBasicEdit = null,
    dropzoneBasic = null;
  let paginationData = {
    INIT: 0,
    ROWS: 10,
    MAX: 10
  };

  // * TABLAS
  const cursosCrud = {
    init: () => {
      cursosCrud.eventos.LISTCURSOS();
    },
    globales: () => {
      // * MODALES
      $('#modalAddCurso').on('show.bs.modal', function (e) {
        cursosCrud.variables.myDropzoneAddCurso.removeAllFiles();
        configFormVal('AddCurso', cursosCrud.validaciones.INSERT, () => cursosCrud.eventos.INSERT());
      });

      $('#modalEditCurso').on('hidden.bs.modal', function (e) {
        cursosCrud.variables.myDropzoneEditCurso.removeAllFiles();
      });

      $('#btnAddCursoModal').on('click', () => $('#modalAddCurso').modal('show'));
      $('#btn-search').on('click', () => cursosCrud.eventos.LISTCURSOS());

      // * FILES
      dropzoneBasic = $('#AddCurso #dropzone-area');
      if (dropzoneBasic) {
        cursosCrud.variables.myDropzoneAddCurso = new Dropzone(dropzoneBasic[0], {
          previewTemplate: previewTemplate('imagen'),
          parallelUploads: 1,
          maxFilesize: 5,
          maxFiles: 1,
          acceptedFiles: '.png,.jpg,.jpeg',
          init: function () {
            this.on('addedfile', function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }
            });
          }
        });
      }

      dropzoneBasicEdit = $('#EditCurso #dropzone-area');
      if (dropzoneBasic) {
        cursosCrud.variables.myDropzoneEditCurso = new Dropzone(dropzoneBasicEdit[0], {
          previewTemplate: previewTemplateImage('imagen'),
          createImageThumbnails: false,
          parallelUploads: 1,
          maxFilesize: 5,
          maxFiles: 1,
          acceptedFiles: 'image/*',
          init: function () {
            this.on('addedfile', async function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }

              dropzoneBasicEdit.find('.centered-image').off('click');
              dropzoneBasicEdit.find('.dz-preview').css('cursor', 'pointer');

              let filePreview = this.files[0];
              if (filePreview.isExist) {
                let img = dropzoneBasicEdit.find('.dz-preview').find('.dz-details').find('img');
                img.attr('src', filePreview.dataURL);
                return;
              }

              let reader = new FileReader();
              reader.readAsDataURL(filePreview);
              reader.onload = function () {
                let img = dropzoneBasicEdit.find('.dz-preview').find('.dz-details').find('img');
                img.attr('src', reader.result);
                img.on('click', function () {
                  createModalImage(reader.result);
                });
              };
            });
          }
        });
      }
    },
    variables: {
      myDropzoneAddCurso: null,
      myDropzoneEditCurso: null,
      editPlantilla: {},
      cursos: [],
      curso: {}
    },
    eventos: {
      LISTCURSOS: (INIT = 0, ROWS = paginationData.MAX) => {
        $('#spinky-wave').fadeIn();
        $.ajax({
          url: uisApis.API + `=Buscar&ROWS=${ROWS}&INIT=${INIT}&DRAW=1&DESC=${$('#busqueda-search').val()}`,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'GET',
          success: function (response) {
            paginationData.INIT = INIT;
            paginationData.ROWS = ROWS;

            let data = response?.data || [];
            cursosCrud.variables.cursos = data;
            let contenedorCursos = $('#contenedor-cursos');
            contenedorCursos.html('');
            if (data.length > 0) {
              data.forEach(d => {
                contenedorCursos.append(`
                <div class="col-sm-6 col-lg-4">
                  <div class="card p-2 h-100">
                      <div class="rounded-2 text-center mb-3">
                          <a href="CourseDetails"><img class="img-fluid" src="data:${d?.type};base64,${
                  d?.imagen
                }" alt="tutor image 1" /></a>
                      </div>
                      <div class="card-body p-3 pt-2">
                          <div class="d-flex justify-content-between align-items-center mb-3">
                              <span class="badge bg-label-primary">${d?.dscrpcn.substring(0, 10)}...</span>
                              <h6 class="d-flex align-items-center justify-content-center gap-1 mb-0">
                                  4.4 <span class="text-warning"><i class="bx bxs-star me-1"></i></span><span class="text-muted">(1.23k)</span>
                              </h6>
                          </div>
                          <a href="CourseDetails" class="h5">${d?.dscrpcn}</a>
                          <p class="mt-2 text-justify">${d?.dtlle || ''}</p>
                          <p class="d-flex align-items-center"><i class="bx bx-time-five me-2"></i>${func.formatFecha(
                            d?.fini,
                            'DD-MM-YYYY'
                          )} al ${func.formatFecha(d?.ffin, 'DD-MM-YYYY')}</p>
                          <div class="d-flex flex-column justify-content-center flex-md-row gap-2 text-nowrap pe-xl-3 pe-xxl-0">
                              <button class="btn-edit-curso app-academy-md-50 btn btn-label-secondary me-md-2 d-flex align-items-center" data-id="${
                                d?.id
                              }">
                                  <i class="bx bx-edit align-middle me-2 "></i><span>Editar</span>
                              </button>
                              <a class="app-academy-md-50 btn btn-label-primary d-flex align-items-center" href="cursos/CourseDetails?course=${d?.id}">
                                  <span class="me-2">Ir a</span><i class="bx bx-chevron-right lh-1 scaleX-n1-rtl"></i>
                              </a>

                          </div>
                      </div>
                  </div>
              </div>
                `);
              });
            } else {
              contenedorCursos.append(`
              <div class="d-flex justify-content-center w-100">
                <div class="alert alert-danger text-center" role="alert">
                  No se encontraron cursos
                </div>
              </div>
              `);
            }

            let totalRows = data?.[0]?.totalrows || 0;
            $('#TOTALROWS').text(totalRows);

            let totalPages = Math.ceil(totalRows / paginationData.MAX);
            let pagination = $('#pagination');
            pagination.html('');

            for (let i = 1; i <= totalPages; i++) {
              pagination.append(`
              <li class="page-item ${
                i == paginationData.INIT + 1 ? 'active' : ''
              }"><a class="page-link" href="#">${i}</a></li>
              `);
            }

            $('.page-link')
              .off('click')
              .on('click', function () {
                let page = $(this).text();
                if (page == 'Anterior' || page == 'Siguiente') {
                  page = $('.page-item.active').text();
                  if (page == '1' && $(this).text() == 'Anterior') return;
                  if ($(this).text() == 'Anterior') page--;
                  if ($(this).text() == 'Siguiente') page++;
                }

                $('.page-item').removeClass('active');
                $(this).parent().addClass('active');
                cursosCrud.eventos.LISTCURSOS((page - 1) * paginationData.MAX, paginationData.MAX);
              });

            $('.btn-edit-curso')
              .off('click')
              .on('click', function () {
                let id = $(this).data('id');
                cursosCrud.eventos.GETCURSO(id);
              });
          },
          error: error => swalFire.error('Ocurrió un error al cargar los cursos'),
          complete: () => $('#spinky-wave').fadeOut()
        });
      },
      INSERT: () => {
        const file = cursosCrud.variables.myDropzoneAddCurso.files[0];
        if (!file) return swalFire.error('Debe seleccionar una imagen');

        let formData = new FormData();
        formData.append('DSCRPCN', $('#AddCurso #DSCRPCN').val());
        formData.append('DTLLE', $('#AddCurso #DTLLE').val());
        formData.append('FINI', $('#AddCurso #FINI').val());
        formData.append('FFIN', $('#AddCurso #FFIN').val());
        formData.append('IDMRCA', $('#AddCurso #IDMRCA').val());
        formData.append('GDCTGCRSO', $('#AddCurso #GDCTGCRSO').val());
        formData.append('IMG', file);

        swalFire.cargando(['Espere un momento', 'Estamos registrando la plantilla']);
        $.ajax({
          url: uisApis.API + '=Add',
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
              swalFire.success('Curso agregado correctamente', '', {
                1: () => {
                  $('#modalAddCurso').modal('hide');
                  cursosCrud.variables.myDropzoneAddCurso.removeAllFiles();
                  cursosCrud.eventos.LISTCURSOS();
                }
              });
            }
            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar la plantilla')
        });
      },
      UPDATE: () => {
        const file = cursosCrud.variables.myDropzoneEditCurso.files[0];
        if (!file) return swalFire.error('Debe seleccionar una imagen');

        let formData = new FormData();
        formData.append('ID', cursosCrud.variables.curso.id);
        formData.append('RTAIMG', cursosCrud.variables.curso.rtaimg);
        formData.append('IMG', file?.isExist ? null : file);
        formData.append('DSCRPCN', $('#EditCurso #DSCRPCN').val());
        formData.append('DTLLE', $('#EditCurso #DTLLE').val());
        formData.append('FINI', $('#EditCurso #FINI').val());
        formData.append('FFIN', $('#EditCurso #FFIN').val());
        formData.append('IDMRCA', $('#EditCurso #IDMRCA').val());
        formData.append('GDCTGCRSO', $('#EditCurso #GDCTGCRSO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando la plantilla']);
        $.ajax({
          url: uisApis.API + '=Update',
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
              swalFire.success('Curso actualizado correctamente', '', {
                1: () => {
                  $('#modalEditCurso').modal('hide');
                  cursosCrud.variables.myDropzoneEditCurso.removeAllFiles();
                  cursosCrud.eventos.LISTCURSOS();
                }
              });
            }
            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar la plantilla')
        });
      },
      DELETE: data => {},
      GETCURSO: id => {
        cursosCrud.variables.myDropzoneEditCurso.removeAllFiles();
        configFormVal('EditCurso', cursosCrud.validaciones.UPDATE, () => cursosCrud.eventos.UPDATE());

        let curso = cursosCrud.variables.cursos.find(c => c.id == id);
        cursosCrud.variables.curso = curso;
        func.actualizarForm('EditCurso', curso);
        $('#EditCurso #FINI')[0]._flatpickr.setDate(func.formatFecha(curso.fini, 'DD-MM-YYYY'));
        $('#EditCurso #FFIN')[0]._flatpickr.setDate(func.formatFecha(curso.ffin, 'DD-MM-YYYY'));

        // * ACTUALIZAR DROPZONE
        var filename = curso?.name;
        curso.imagen = curso?.imagen.includes('data:image')
          ? curso?.imagen
          : `data:${curso?.type};base64,${curso?.imagen}`;
        var blob = new Blob([curso?.imagen], { type: curso?.type });
        var fileOfBlob = new File([blob], filename);
        fileOfBlob.dataURL = curso?.imagen;
        fileOfBlob.isExist = true;
        cursosCrud.variables.myDropzoneEditCurso.files.push(fileOfBlob);
        cursosCrud.variables.myDropzoneEditCurso.emit('addedfile', fileOfBlob);
        cursosCrud.variables.myDropzoneEditCurso.emit('complete', fileOfBlob);

        $('#modalEditCurso').modal('show');
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        FINI: agregarValidaciones({
          required: true
        }),
        FFIN: agregarValidaciones({
          required: true
        }),
        IDMRCA: agregarValidaciones({
          required: true
        }),
        GDCTGCRSO: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        DSCRPCN: agregarValidaciones({
          required: true
        }),
        FINI: agregarValidaciones({
          required: true
        }),
        FFIN: agregarValidaciones({
          required: true
        }),
        IDMRCA: agregarValidaciones({
          required: true
        }),
        GDCTGCRSO: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
    },
    eventos: {
      selects: async () => {
        // Crear promesas para cada solicitud AJAX
        const fetchGD = new Promise((resolve, reject) => {
          $.ajax({
            url: `${uisApis.GD}=ObtenerAll`,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET',
            data: {
              GDTOS: 'GDCTGCRSO'
            },
            success: response => resolve(response),
            error: error => reject('Ocurrió un error al cargar los datos GD')
          });
        });

        const fetchMR = new Promise((resolve, reject) => {
          $.ajax({
            url: `${uisApis.MR}=Obtener&start=0&length=100`,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET',
            success: response => resolve(response),
            error: error => reject('Ocurrió un error al cargar los datos MR')
          });
        });

        // Ejecutar ambas solicitudes en paralelo
        Promise.all([fetchGD, fetchMR])
          .then(([dataGD, dataMR]) => {
            if (dataGD?.data) {
              // Todos los selects dentro EditPlantilla AddCurso, que no sea CESTDO
              let selects = document.querySelectorAll('#AddCurso select, #EditCurso select');
              selects = Array.from(selects).filter(select => select.getAttribute('name') != 'CESTDO');

              selects.forEach(select => {
                const name = select.getAttribute('name');
                const data = dataGD.data.filter(d => d.gdpdre == name);
                select.innerHTML = `<option value="">-- Seleccione</option>`;

                if (data.length > 0) {
                  data.forEach(d => {
                    select.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
                  });
                }
              });
            }

            if (dataMR?.data) {
              let selects = document.querySelectorAll('#AddCurso #IDMRCA, #EditCurso #IDMRCA');
              selects.forEach(select => {
                select.innerHTML = '';
                select.innerHTML += `<option value="">-- Seleccione</option>`;
                dataMR.data.forEach(d => {
                  select.innerHTML += `<option value="${d.id}">${d.mrca}</option>`;
                });
              });
            }
          })
          .catch(error => swalFire.error(error));
      }
    }
  };

  return {
    init: () => {
      cursosCrud.init();
      cursosCrud.globales();

      globalCrud.init();
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
