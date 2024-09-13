/**
 * PERSONAL CRUD JS
 */

'use strict';

const executeView = () => {
  const uisApis = {
    API: '/Comercial/Contactos/Index?handler',
    GD: '/Seguridad/GrupoDato/Index?handler',
    MR: '/Seguridad/Marcas/Index?handler'
  };

  // * VARIABLES
  let contactosTable = 'contactosTable';
  let CcontactosTable = null;

  // * TABLAS
  const contactosCrud = {
    init: () => {
      contactosCrud.eventos.GETMAILS();
    },
    globales: () => {
      // * MODALES
      $('#modalAddContacto').on('show.bs.modal', function (e) {
        configFormVal('AddContacto', contactosCrud.validaciones.INSERT, () => contactosCrud.eventos.INSERT());
      });

      $('#modalEditContacto').on('show.bs.modal', function (e) {
        configFormVal('EditContacto', contactosCrud.validaciones.UPDATE, () => contactosCrud.eventos.UPDATE());
        func.actualizarForm('EditContacto', contactosCrud.variables.contacto);
      });

      $('#emailComposeSidebarLabel').on('click', function (e) {
        $('#emailContacts').val('').trigger('change');
        $('#email-subject').val('');
        $('#email-editor')[0].__quill.root.innerHTML = '';
        if ($('div[data-repeater-item]')) {
          $("div[data-repeater-item]").not(':first').remove();
          $("div[data-repeater-item]").find('input').val('');        
        }
      });

      // * FORMULARIOS
      $(`#${contactosTable}`).on('click', '.edit-plantilla-button', function () {
        const data = CcontactosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el contacto seleccionado');
        contactosCrud.variables.contacto = data;
        $('#modalEditContacto').modal('show');
      });

      $(`#${contactosTable}`).on('click', '.delete-plantilla-button', function () {
        const data = CcontactosTable.row($(this).parents('tr')).data();
        if (!data.id) return swalFire.error('No se encontró el contacto seleccionado');
        swalFire.confirmar('¿Está seguro de eliminar la plantilla?', {
          1: () => contactosCrud.eventos.DELETE(data.id)
        });
      });

      $('#btnEnviarMail').on('click', function (e) {
        e.preventDefault();
        contactosCrud.eventos.ENVIARMAIL();
      });

      $("#ant_next").on("click", function () {
        if (contactosCrud.variables.pagination.DESDE > 0) {
          contactosCrud.variables.pagination.DESDE -= 10;
          contactosCrud.eventos.GETMAILS();
        }
      });

      $("#sig_next").on("click", function () {
        if (contactosCrud.variables.pagination.DESDE < contactosCrud.variables.pagination.TOTAL
          && contactosCrud.variables.pagination.DESDE < contactosCrud.variables.pagination.TOTAL - 10

        ) {
          contactosCrud.variables.pagination.DESDE += 10;
          contactosCrud.eventos.GETMAILS();
        }
      });

      $("#email-refresh").on("click", function () {
        contactosCrud.eventos.GETMAILS();
      });
    },
    variables: {
      contacto: {},
      myDropzoneAddEmail: null,
      pagination: {
        TOTAL: 0,
        DESDE: 0,
        HASTA: 10
      },
      data: {}
    },
    eventos: {
      TABLACONTACTOS: () => {
        $(`#${contactosTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CcontactosTable) {
          CcontactosTable = $(`#${contactosTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=Buscar',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.CESTDO = func.obtenerCESTDO(contactosTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: null, title: 'Persona', render: data => `${data.apllds} ${data.nmbrs}` },
              { data: 'eml', title: 'Email' },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${
                    data.cestdo == 'A' ? 'Activo' : 'Inactivo'
                  }></i></span>`;
                }
              },
              { data: 'uedcn', title: 'U. Edición' },
              { data: null, title: 'F. Edición', render: data => func.formatFecha(data.fedcn, 'DD-MM-YYYY HH:mm a') },
              {
                data: null,
                title: '',
                className: 'text-center',
                render: data => {
                  return `<div class="d-flex justify-content-center m-0 p-0">
                        <button name="EDITAR" class="btn btn-sm btn-icon edit-plantilla-button" title="Editar"><i class="bx bx-edit"></i></button>
                        <button name="ELIMINAR" class="btn btn-sm btn-icon delete-plantilla-button" data-id="${data.id}" title="Eliminar"><i class="bx bx-trash"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {
              if ($(`#${contactosTable}`).find('.radio-buttons').length == 0) {
                $(`#${contactosTable}_filter`).append(radio_group_estados);

                $(`#${contactosTable}_filter .radio-buttons #radioGroup_estado`).on('change', function () {
                  $(`#${contactosTable}`).DataTable().ajax.reload();
                });
              }
            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [
                {
                  extend: 'collection',
                  className: 'btn btn-label-secondary dropdown-toggle ms-2 me-0 mx-sm-3',
                  text: '<i class="bx bx-export me-2"></i>Exportar',
                  buttons: [
                    {
                      extend: 'pdf',
                      title: 'Suministros',
                      text: '<i class="bx bxs-file-pdf me-2"></i>Pdf',
                      className: 'dropdown-item',
                      exportOptions: {
                        columns: [0, 1, 2, 3, 4, 5],
                        format: {
                          body: function (data, row, column, node) {
                            return data;
                          }
                        }
                      }
                    }
                  ]
                }
              ];

              buttons.unshift({
                text: '<i class="bx bx-plus me-0 me-md-2"></i><span class="d-none d-md-inline-block">Agregar</span>',
                className: 'btn btn-label-primary btn-add-new',
                action: function (e, dt, node, config) {
                  $('#modalAddContacto').modal('show');
                }
              });

              return buttons;
            })()
          });
        } else {
          CcontactosTable.ajax.reload();
        }
      },
      INSERT: () => {
        let formData = new FormData();
        formData.append('NMBRS', $('#AddContacto #NMBRS').val());
        formData.append('APLLDS', $('#AddContacto #APLLDS').val());
        formData.append('EML', $('#AddContacto #EML').val());
        formData.append('TLFNO', $('#AddContacto #TLFNO').val());
        formData.append('DRCCN', $('#AddContacto #DRCCN').val());
        formData.append('CLENTE', $('#AddContacto #CLENTE').val());
        formData.append('GDRBROC', $('#AddContacto #GDRBROC').val());
        formData.append('GDCRGOC', $('#AddContacto #GDCRGOC').val());
        formData.append('IDMRCA', $('#AddContacto #IDMRCA').val());
        formData.append('CESTDO', $('#AddContacto #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos registrando el contacto']);
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
              swalFire.success('Contacto registrado correctamente', '', {
                1: () => {
                  $('#modalAddContacto').modal('hide');
                  $(`#${contactosTable}`).DataTable().ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al agregar el contacto')
        });
      },
      UPDATE: () => {
        let formData = new FormData();
        formData.append('ID', contactosCrud.variables.contacto.id);
        formData.append('NMBRS', $('#EditContacto #NMBRS').val());
        formData.append('APLLDS', $('#EditContacto #APLLDS').val());
        formData.append('EML', $('#EditContacto #EML').val());
        formData.append('TLFNO', $('#EditContacto #TLFNO').val());
        formData.append('DRCCN', $('#EditContacto #DRCCN').val());
        formData.append('CLENTE', $('#EditContacto #CLENTE').val());
        formData.append('GDRBROC', $('#EditContacto #GDRBROC').val());
        formData.append('GDCRGOC', $('#EditContacto #GDCRGOC').val());
        formData.append('IDMRCA', $('#EditContacto #IDMRCA').val());
        formData.append('CESTDO', $('#EditContacto #CESTDO').val());

        swalFire.cargando(['Espere un momento', 'Estamos actualizando el contacto']);
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
              swalFire.success('Contacto actualizado correctamente', '', {
                1: () => {
                  $('#modalEditContacto').modal('hide');
                  $(`#${contactosTable}`).DataTable().ajax.reload();
                }
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al actualizar el contacto')
        });
      },
      DELETE: id => {
        let formData = new FormData();
        formData.append('ID', id);

        swalFire.cargando(['Espere un momento', 'Estamos eliminando el contacto']);
        $.ajax({
          url: uisApis.API + '=Delete',
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
              swalFire.success('Contacto eliminado correctamente', '', {
                1: () => $(`#${contactosTable}`).DataTable().ajax.reload()
              });
            }

            if (data?.codEstado <= 0) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al eliminar el contacto')
        });
      },
      ENVIARMAIL: () => {
        const formRepeater = $('.form-repeater .row');
        const data = [];
        formRepeater.each((index, element) => {
          const inputs = $(element).find('input');
          const obj = {};
          inputs.each((i, input) => {
            obj[input.getAttribute('data-var')] = input.value;
          });

          if (obj.URL) data.push(obj);
        });

        let emailContacts = $('#emailContacts').val();
        let emailSubject = $('#email-subject').val();
        let emailEditor = $('#email-editor')?.[0]?.__quill.root.innerHTML || null;

        // * Valdiar que vea al menos un contacto
        if (!emailContacts) return swalFire.error('Debe seleccionar al menos un contacto');

        // * Validar que el asunto no esté vacío
        if (!emailSubject) return swalFire.error('El asunto no puede estar vacío');

        // * Validar que el editor no esté vacío
        if (!emailEditor) return swalFire.error('El contenido del email no puede estar vacío');

        let formData = new FormData();
        formData.append('CNTCTS', emailContacts.join(','));
        formData.append('ASNTO', emailSubject);
        formData.append('MSJE', emailEditor);
        formData.append('ADJUNTOS', JSON.stringify(data));

        swalFire.cargando(['Espere un momento', 'Estamos enviando el email']);
        $.ajax({
          url: uisApis.API + '=SendMail',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: function (data) {
            if (data?.success) {
              swalFire.success('Email enviado correctamente', '', {
                1: () => {
                  $('#emailComposeSidebar').modal('hide');
                  contactosCrud.eventos.GETMAILS();
                }
              });
            }

            if (!data?.success) swalFire.error(data.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al enviar el email')
        });
      },
      GETMAILS: async () => {
        let desc = $("#email-search-input").val();
        $(".app-overlay").addClass("show");
        $.ajax({
          url: uisApis.API + `=BuscarEmails&ASNTO=${desc}&start=${contactosCrud.variables.pagination.DESDE}&length=10`,
          type: 'GET',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
          },
          success: response => {
            contactosCrud.variables.pagination.TOTAL = response?.data?.[0]?.totalrows || 0;
            $("#cantidad_emails").text(contactosCrud.variables.pagination.TOTAL);
            contactosCrud.variables.data = [];
            $('#list-unstyled').html('');
            
            if (response?.data) {
              contactosCrud.variables.data = response.data;
              response.data.forEach(d => {
                $('#list-unstyled').append(`
                  <li class="email-list-item" data-starred="true" data-bs-toggle="sidebar" data-target="#app-email-view">
                    <div class="d-flex align-items-center">
                      <i class="email-list-item-bookmark bx bx-envelope d-sm-inline-block d-none cursor-pointer ms-2 me-3"></i>
                      <div class="email-list-item-content ms-2 ms-sm-0 me-2">
                        <span class="email-list-item-subject d-xl-inline-block d-block">${d.asnto}</span>
                      </div>
                      <div class="email-list-item-meta ms-auto d-flex align-items-center">
                        <span class="email-list-item-label badge badge-dot bg-success d-none d-md-inline-block me-2" data-label="private"></span>
                        <small class="email-list-item-time text-muted">${func.formatFecha(d.fcrcn, "DD/MM HH:mm a")}</small>
                        <ul class="list-inline email-list-item-actions">
                          <li data-id="${d.id}" data-var="item-view" id="data-${d.id}" class="list-inline-item email-read"> <i class='bx bx-envelope-open'></i> </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                `);
              });
            }

            // los que tenga data-var="item-view"
            $("li[data-var='item-view']").on("click", function () {
              const id = $(this).data("id");
              let datos = contactosCrud.variables.data.find(d => d.id == id);
              if(!datos) return swalFire.error("No se encontró el email seleccionado");

              datos = {
                ...datos,
                items: JSON.parse(datos.items)
              }
             
              contactosCrud.eventos.CARGARDETALLE(datos);
              $("#app-email-view").addClass("show");
            });

            $("#total_pagination").text(`Mostrando ${contactosCrud.variables.pagination.DESDE + 1} a 
              ${(contactosCrud.variables.pagination.DESDE + 10) > contactosCrud.variables.pagination.TOTAL ? contactosCrud.variables.pagination.TOTAL : (contactosCrud.variables.pagination.DESDE + 10) 
                
              } de ${contactosCrud.variables.pagination.TOTAL} registros`);
          },
          error: error => {
            swalFire.error('Ocurrió un error al cargar los contactos');
            console.log(error)
          },
          complete: () => $(".app-overlay").removeClass("show")
        });

      },
      CARGARDETALLE: (data) => {
        $("#asunto_detalle").text(data.asnto.trim());
        $("#inner-html").html(data.msje);
        // * TABLA ITEMS
        let table = $("#table-items");
        table.find("tbody").html("");
        data.items.forEach((d, index) => {
          table.find("tbody").append(`
            <tr>
              <td>${index + 1}</td>
              <td><img src="${d.IMGURL}" alt="imagen" class="rounded-circle" width="40" height="40"></td>
              <td><a 
              class="text-primary"
              href="${d.REDURL}" target="_blank">${d.REDURL}</a></td>
              <td class="text-center">${d.VSTS}</td>
            </tr>
          `);
        });

      }
    },
    formularios: {},
    validaciones: {
      INSERT: {
        NMBRS: agregarValidaciones({
          required: true
        }),
        APLLDS: agregarValidaciones({
          required: true
        }),
        EML: agregarValidaciones({
          required: true,
          regexp: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'El email no es válido'
        })
      },
      UPDATE: {
        NMBRS: agregarValidaciones({
          required: true
        }),
        APLLDS: agregarValidaciones({
          required: true
        }),
        EML: agregarValidaciones({
          required: true,
          regexp: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'El email no es válido'
        })
      }
    }
  };

  const globalCrud = {
    init: () => {
      globalCrud.eventos.selects();
      globalCrud.eventos.configSelects();
      globalCrud.eventos.globales();
      globalCrud.eventos.contactos();
    },
    eventos: {
      selects: () => {
        Promise.all([
          $.ajax({
            url: uisApis.GD + '=ObtenerAll',
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET',
            data: {
              GDTOS: 'GDRBROC,GDCRGOC'
            }
          }),
          $.ajax({
            url: `${uisApis.MR}=Obtener&start=0&length=100`,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
            },
            type: 'GET'
          })
        ])
          .then(([responseGD, responseMR]) => {
            if (responseGD?.data) {
              let selects = document.querySelectorAll('#EditContacto select, #AddContacto select');
              selects = Array.from(selects).filter(select => select.getAttribute('name') != 'CESTDO');

              selects.forEach(select => {
                const name = select.getAttribute('name');
                const data = responseGD.data.filter(d => d.gdpdre == name);
                select.innerHTML = `<option value="">-- Seleccione</option>`;

                if (data.length > 0) {
                  data.forEach(d => {
                    select.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
                  });
                }
              });
            }

            let selectsMR = document.querySelectorAll('#AddContacto #IDMRCA, #EditContacto #IDMRCA');
            selectsMR.forEach(select => {
              select.innerHTML = '';
              select.innerHTML += `<option value="">-- Seleccione</option>`;
              responseMR.data.forEach(d => {
                select.innerHTML += `<option value="${d.id}">${d.mrca}</option>`;
              });
            });
          })
          .catch(error => swalFire.error('Ocurrió un error al cargar los módulos y marcas'));
      },
      configSelects: () => {
        let emailContacts = $('#emailContacts');
        function initSelect2() {
          if (emailContacts.length) {
            function renderContactsAvatar(option) {
              if (!option.id) {
                return option.text;
              }
              let $avatar =
                "<div class='d-flex flex-wrap align-items-center'>" +
                "<div class='avatar avatar-xs me-2 w-px-20 h-px-20'>" +
                "<img src='" +
                assetsPath +
                'img/avatars/' +
                $(option.element).data('avatar') +
                "' alt='avatar' class='rounded-circle' />" +
                '</div>' +
                option.text +
                '</div>';

              return $avatar;
            }
            emailContacts.wrap('<div class="position-relative"></div>').select2({
              placeholder: 'Select value',
              dropdownParent: emailContacts.parent(),
              closeOnSelect: false,
              templateResult: renderContactsAvatar,
              templateSelection: renderContactsAvatar,
              escapeMarkup: function (es) {
                return es;
              }
            });
          }
        }
        initSelect2();
      },
      globales: () => {
        // email-editor
        const fullEditor2 = new Quill('#email-editor', {
          bounds: '#full-editor',
          placeholder: 'Escriba algo aquí...',
          modules: {
            formula: true,
            toolbar: fullToolbar
          },
          theme: 'snow'
        });

        var formRepeater = $('.form-repeater');
        if (formRepeater.length) {
          var row = 2;
          var col = 1;
          formRepeater.on('submit', function (e) {
            e.preventDefault();
          });
          formRepeater.repeater({
            show: function () {
              var fromControl = $(this).find('.form-control');
              var formLabel = $(this).find('.form-label');

              fromControl.each(function (i) {
                var id = 'form-repeater-' + row;
                $(fromControl[i]).attr('id', id);
                $(fromControl[i]).attr('data', 'form-control-repeater');
                $(formLabel[i]).attr('for', id);
                col++;
              });

              row++;
              $(this).slideDown();
            }
          });
        }

        let emailList = document.querySelector('.email-list'),
        refreshEmails = document.querySelector('.email-refresh');

        if (refreshEmails && emailList) {
          let emailListJq = $('.email-list'),
            emailListInstance = new PerfectScrollbar(emailList, {
              wheelPropagation: false,
              suppressScrollX: true
            });
          // ? Using jquery vars due to BlockUI jQuery dependency
          refreshEmails.addEventListener('click', e => {
            emailListJq.block({
              message: '<div class="spinner-border text-primary" role="status"></div>',
              timeout: 1000,
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
          });
        }
      },
      contactos: () => {
        $.ajax({
          url: uisApis.API + '=Buscar&CESTDO=A&start=0&length=999999&search=',
          type: 'GET',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
          },
          success: data => {
            if (data?.data) {
              let emailContacts = $('#emailContacts');
              emailContacts.html('');
              data.data.forEach(d => {
                emailContacts.append(`<option value="${d.eml}">${d.nmbrs} ${d.apllds}</option>`);
              });

              emailContacts.select2({
                placeholder: 'Seleccione un contacto',
                dropdownParent: emailContacts.parent(),
                closeOnSelect: false,
                escapeMarkup: function (es) {
                  return es;
                }
              });
            }
          },
          error: error => swalFire.error('Ocurrió un error al cargar los contactos')
        });
      }
    }
  };

  return {
    init: () => {
      globalCrud.init();
      contactosCrud.globales();
      contactosCrud.init();

      var myTabs = document.querySelectorAll('.nav-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');
          if (tabPane === '#navs-email') {
            contactosCrud.eventos.GETMAILS();
          }

          if (tabPane === '#navs-add-contacto') {
            contactosCrud.eventos.TABLACONTACTOS();
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
