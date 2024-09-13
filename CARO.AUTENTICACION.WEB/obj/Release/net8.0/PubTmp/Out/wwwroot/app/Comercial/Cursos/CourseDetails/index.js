/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Comercial/Cursos/Index?handler',
    DET: '/Comercial/Cursos/CourseDetails/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler',
    MR: '/Seguridad/Marcas/Index?handler'
  };

  // * VARIABLES
  let rowIndex = 2;
  let formRepeater = null;
  let dropzoneBasicEdit = null,
    dropzoneBasic = null;
  let paginationData = {
    INIT: 0,
    ROWS: 10,
    MAX: 10
  };

  // * TABLAS
  const detalleCursoCrud = {
    init: () => {
      detalleCursoCrud.eventos.GETCURSO();
    },
    globales: () => {
      $('#modalEditCurso').on('hidden.bs.modal', function (e) {
        detalleCursoCrud.variables.myDropzoneEditCurso.removeAllFiles();
      });

      $('#btnAddCursoModal').on('click', () => $('#modalAddCurso').modal('show'));
      $('#btn-search').on('click', () => detalleCursoCrud.eventos.LISTCURSOS());

      // * FILES
      dropzoneBasic = $('#formAddDetalle #dropzone-area');
      if (dropzoneBasic) {
        detalleCursoCrud.variables.myDropzoneAddDetalle = new Dropzone(dropzoneBasic[0], {
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

              dropzoneBasic.find('.centered-image').off('click');
              dropzoneBasic.find('.dz-preview').css('cursor', 'pointer');

              let filePreview = this.files[0];
              if (filePreview.isExist) {
                let img = dropzoneBasic.find('.dz-preview').find('.dz-details').find('img');
                img.attr('src', filePreview.dataURL);
                return;
              }

              let reader = new FileReader();
              reader.readAsDataURL(filePreview);
              reader.onload = function () {
                let img = dropzoneBasic.find('.dz-preview').find('.dz-details').find('img');
                img.attr('src', reader.result);
                file.dataURL = reader.result;
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
      myDropzoneAddDetalle: null,
      myDropzoneEditCurso: null,
      editPlantilla: {},
      cursos: [],
      curso: {},
      courseId: 0,
      isEdit: false
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
            detalleCursoCrud.variables.cursos = data;
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
                              <a class="app-academy-md-50 btn btn-label-primary d-flex align-items-center" href="cursos/CourseDetails?course=${
                                d?.id
                              }">
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
                detalleCursoCrud.eventos.LISTCURSOS((page - 1) * paginationData.MAX, paginationData.MAX);
              });

            $('.btn-edit-curso')
              .off('click')
              .on('click', function () {
                let id = $(this).data('id');
                detalleCursoCrud.eventos.GETCURSO(id);
              });
          },
          error: error => swalFire.error('Ocurrió un error al cargar los cursos'),
          complete: () => $('#spinky-wave').fadeOut()
        });
      },
      INSERT: () => {
        const file = detalleCursoCrud.variables.myDropzoneAddDetalle.files?.[0];
        if (!file) return swalFire.error('Debe seleccionar una imagen');

        let formData = new FormData();
        formData.append('DSCRPCN', $('#formAddDetalle #DSCRPCN').val());
        formData.append('IMGCOURSE', file);
        formData.append('IDCRSO', detalleCursoCrud.variables.courseId);
        formData.append('OBJETVS', new Quill('#full-editor-objetivos').root.innerHTML);
        formData.append('PRTCPNTS', new Quill('#full-editor-participantes').root.innerHTML);
        formData.append('DRCCN', $('#formAddDetalle #DRCCN').val());
        formData.append('INVRSN', $('#formAddDetalle #INVRSN').val());
        formData.append('MDLDD', $('#formAddDetalle #MDLDD').val());
        formData.append('LGAR', $('#formAddDetalle #LGAR').val());

        let formRepeater = $('.div_chapterOne');
        let horarios = [];
        if (formRepeater) {
          formRepeater.each(function (index, i) {
            let inputs = $(this).find('.form-control');
            horarios.push({
              ID: null,
              IDDCRSO: null,
              TITLE: inputs?.[0].value || '',
              ORDEN: inputs?.[1].value || '',
              DTLLE: inputs?.[2].value || '',
              CLNDRIO: inputs?.[3] ? new Quill('#' + inputs?.[3].id).root.innerHTML : '',
              CESTDO: 'A'
            });
          });

          horarios = horarios.filter(h => h.TITLE);
        }

        formData.append('MODULOS', JSON.stringify(horarios));

        swalFire.cargando(['Espere un momento', 'Estamos registrando la plantilla']);
        $.ajax({
          url: uisApis.DET + '=Add',
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
              swalFire.success('Detalle del curso agregado correctamente', '', {
                1: () => {
                  window.location.reload();
                }
              });
            }
            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el detalle del curso')
        });
      },
      UPDATE: () => {
        const file = detalleCursoCrud.variables.myDropzoneAddDetalle.files?.[0];
        if (!file) return swalFire.error('Debe seleccionar una imagen');
        if (!detalleCursoCrud.variables.curso) return swalFire.error('Ocurrió un error al obtener el curso');


        let formData = new FormData();
        formData.append('ID', detalleCursoCrud.variables.curso.id);
        formData.append('IDCRSO', detalleCursoCrud.variables.courseId);
        formData.append('DSCRPCN', $('#formAddDetalle #DSCRPCN').val());
        formData.append('RTAIMG', detalleCursoCrud.variables.curso.rtaimg);
        formData.append('IMGCOURSE', file.isExist ? null : file);
        formData.append('OBJETVS', new Quill('#full-editor-objetivos').root.innerHTML);
        formData.append('PRTCPNTS', new Quill('#full-editor-participantes').root.innerHTML);
        formData.append('DRCCN', $('#formAddDetalle #DRCCN').val());
        formData.append('INVRSN', $('#formAddDetalle #INVRSN').val());
        formData.append('MDLDD', $('#formAddDetalle #MDLDD').val());
        formData.append('LGAR', $('#formAddDetalle #LGAR').val());

        let formRepeater = $('.div_chapterOne');
        let horarios = [];
        if (formRepeater) {
          formRepeater.each(function (index, i) {
            let inputs = $(this).find('.form-control');
            horarios.push({
              ID: inputs?.[4].value || null,
              IDDCRSO: null,
              TITLE: inputs?.[0].value || '',
              ORDEN: inputs?.[1].value || '',
              DTLLE: inputs?.[2].value || '',
              CLNDRIO: inputs?.[3] ? new Quill('#' + inputs?.[3].id).root.innerHTML : '',
              CESTDO: 'A'
            });
          });

          horarios = horarios.filter(h => h.TITLE);
        }

        formData.append('MODULOS', JSON.stringify(horarios));

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el detalle del curso']);
        $.ajax({
          url: uisApis.DET + '=Update',
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
              swalFire.success('Detalle del curso actualizado correctamente', '', {
                1: () => {
                  window.location.reload();
                }
              });
            }
            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          }
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);
        swalFire.cargando(['Espere un momento', 'Estamos eliminando el detalle del curso']);
        $.ajax({
          url: uisApis.DET + '=Delete',
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
              swalFire.success('Detalle del curso eliminado correctamente', '', {
                1: () => {
                  // window.location.reload();
                }
              });
            }
            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          }
        });
      },
      GETCURSO: () => {

        let id = func.getURLParameter('course');
        if (!id || isNaN(id)) return (window.location.href = '/Comercial/Cursos');

        swalFire.cargando(['Espere un momento', 'Estamos cargando el curso']);
        detalleCursoCrud.variables.courseId = id;

        $("div[data-repeater-item]").not(':first').remove();
        $.ajax({
          url: uisApis.DET + `=Buscar&ROWS=${1}&INIT=${0}&DRAW=1&DESC=&ID=${id}`,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'GET',
          success: function (response) {
            if (response.data) {
              let course = response.data[0];
              $('#NAME_COURSE').text(course.course);
              if (course?.idcrso) {
                configFormVal('formAddDetalle', detalleCursoCrud.validaciones.UPDATE, () =>
                  detalleCursoCrud.eventos.UPDATE()
                );

                detalleCursoCrud.variables.isEdit = true;
                detalleCursoCrud.variables.curso = course;
                $('#formAddDetalle #DSCRPCN').val(course?.dscrpcn);
                $('#formAddDetalle #DRCCN').val(course?.drccn);
                $('#formAddDetalle #INVRSN').val(course?.invrsn);
                $('#formAddDetalle #MDLDD').val(course?.mdldd);
                $('#formAddDetalle #LGAR').val(course?.lgar);
                new Quill('#full-editor-objetivos').root.innerHTML = course?.objetvs;
                new Quill('#full-editor-participantes').root.innerHTML = course?.prtcpnts;

                // * FILE ....
                if(course?.imgfile){
                  var filename = course?.name;
                  course.imagen = `data:${course?.type};base64,${course?.imgfile}`;
                  var blob = new Blob([course?.imagen], { type: course?.type });
                  var fileOfBlob = new File([blob], filename);
                  fileOfBlob.dataURL = course?.imagen;
                  fileOfBlob.isExist = true;
                  detalleCursoCrud.variables.myDropzoneAddDetalle.files.push(fileOfBlob);
                  detalleCursoCrud.variables.myDropzoneAddDetalle.emit('addedfile', fileOfBlob);
                  detalleCursoCrud.variables.myDropzoneAddDetalle.emit('complete', fileOfBlob);
                }

                // * FORM REPEATER
                let modulos = JSON.parse(course?.modulos);
                if (modulos.length > 0) {
                  modulos.forEach((m, index) => {
                    if (index > 0) $('#data-repeater-create').click();

                    let formRepeater = $('.div_chapterOne').last();
                    let inputs = formRepeater.find('.form-control');
                    inputs[0].value = m.TITLE;
                    inputs[1].value = m.ORDEN;
                    inputs[2].value = m.DTLLE;
                    let editor = $(inputs[3]).find('.ql-editor');
                    if (editor) editor.html(m.CLNDRIO);
                    inputs[4].value = m.ID;
                  });
                }
              }else{
                configFormVal('formAddDetalle', detalleCursoCrud.validaciones.INSERT, () =>
                  detalleCursoCrud.eventos.INSERT()
                );
              }

              return;
            }

            swalFire.error('Ocurrió un error al cargar el curso, lo sentimos', {
              1: () => (window.location.href = '/Comercial/Cursos')
            });
          },
          error: error => swalFire.error('Ocurrió un error al cargar el curso'),
          complete: () => swalFire.cerrar()
        });
      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        DSCRPCN: agregarValidaciones({
          required: true
        })
      },
      UPDATE: {
        DSCRPCN: agregarValidaciones({
          required: true
        })
      }
    }
  };

  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
      globalCrud.globales();
    },
    globales: () => {
      formRepeater = $('.form-repeater');
      if (formRepeater.length) {
        formRepeater.on('submit', function (e) {
          e.preventDefault();
        });
        formRepeater.repeater({
          show: function () {
            let fromControl = $(this).find('.form-control, .form-select', '.form-repeater-calendarios');
            let formLabel = $(this).find('.form-label');
            fromControl.each(function (index, i) {
              let dataVar = $(this).attr('data-var');
              let dataId = 'form-repeater-' + dataVar + '-' + rowIndex + '-' + (index + 1);
              $(fromControl[index]).attr('id', dataId);
              $(formLabel[index]).attr('for', dataId);
            });

            $(this).slideDown();
            let formRepeaterCalendarios = $(this).find('#form-repeater-horarios-' + rowIndex + '-4');
            let repeatEditor = new Quill('#form-repeater-horarios-' + rowIndex + '-4', {
              bounds: '#full-editor',
              placeholder: 'Escriba algo aquí...',
              modules: {
                formula: true,
                toolbar: fullToolbar
              },
              theme: 'snow'
            });

            rowIndex++;
            let accordionButton = $(this).find('.accordion-button');
            let dataBsTarget = 'chapterOne';
            accordionButton.attr('data-bs-target', '#' + dataBsTarget + '-' + rowIndex);
            accordionButton.attr('aria-controls', dataBsTarget + '-' + rowIndex);

            let divChapterOne = $(this).find('.div_chapterOne');
            divChapterOne.attr('id', dataBsTarget + '-' + rowIndex);
            divChapterOne.addClass('collapse');
            divChapterOne.addClass('show');

            let registroChapterOne = $(this).find('.registro-chapterOne');
            registroChapterOne.text('Registro ' + (rowIndex - 1));

            $('.solo-numero')
              .off('input')
              .on('input', function () {
                this.value = this.value.replace(/[^0-9]/g, '');
              });
          },
          hide: function (e) {
            let id = $(this).find('.form-control[data-var="id"]').val();   
            swalFire.delete('¿Está seguro de eliminar este elemento?', {
              1: () => {
                if (id) {
                    detalleCursoCrud.eventos.DELETE(id);
                }
                $(this).slideUp(e);
              }
            });
          }
        });
      }

      // * EDITORS
      const fullEditor = new Quill('#full-editor-objetivos', {
        bounds: '#full-editor',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });

      const fullEditor2 = new Quill('#full-editor-participantes', {
        bounds: '#full-editor',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });

      const fullEditor3 = new Quill('.form-repeater-horarios', {
        bounds: '#full-editor',
        placeholder: 'Escriba algo aquí...',
        modules: {
          formula: true,
          toolbar: fullToolbar
        },
        theme: 'snow'
      });
    },
    eventos: {
      selects: async () => {
  
      }
    }
  };

  return {
    init: () => {
      globalCrud.init();
      detalleCursoCrud.init();
      detalleCursoCrud.globales();
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
