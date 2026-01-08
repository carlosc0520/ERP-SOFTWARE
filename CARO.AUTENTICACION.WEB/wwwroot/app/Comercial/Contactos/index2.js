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
  let CcontactosTable = null;
  let contactosTable = 'contactosTable';
  let CmailingsTable = null;
  let mailingsTable = 'emailsTable';

  let enviandoMailing = false;
  let grupoDatos = [];
  let contactosPorRubro = {}
  const safeParse = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === 'object') return value;      // ya está parseado
    try { return JSON.parse(value); } catch { return fallback; }
  };

  async function actualizarPreview() {
    const html = await mailCaroCrud.eventos.generarHTML_Plantilla1(false);
    $('#previewContainer').html(html);
  }

  function ajustarColor(hex, porcentaje) {
    hex = hex.replace('#', '');

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.max(0, r + (r * porcentaje)));
    g = Math.min(255, Math.max(0, g + (g * porcentaje)));
    b = Math.min(255, Math.max(0, b + (b * porcentaje)));

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }


  // // ===========================================
  // // EVENTOS QUE ACTUALIZAN PREVIEW
  // // ===========================================
  // const actualizarPreview = async () => {
  //   const html = await mailCaroCrud.eventos.generarHTML_Plantilla1(false);
  //   $('#previewContainer').html(html);
  // };


  // * TABLAS
  const contactosCrud = {
    init: () => {
      contactosCrud.eventos.TABLACONTACTOS();
    },
    globales: () => {
      // * MODALES
      $('#modalAddContacto').on('show.bs.modal', function (e) {
        configFormVal('AddContacto', contactosCrud.validaciones.INSERT, () => contactosCrud.eventos.INSERT());
      });

      $('#modalEditContacto').on('show.bs.modal', function (e) {
        configFormVal('EditContacto', contactosCrud.validaciones.UPDATE, () => contactosCrud.eventos.UPDATE());
        func.actualizarForm('EditContacto', contactosCrud.variables.contacto);

        const safeSplit = (valor) => {
          return valor ? valor.toString().split(',') : [];
        };

        $('#EditContacto #IDMRCA').val(safeSplit(contactosCrud.variables.contacto.idmrcA_F)).trigger('change');
        $('#EditContacto #GDRBROC').val(safeSplit(contactosCrud.variables.contacto.gdrbroc)).trigger('change');
        $('#EditContacto #GDCRGOC').val(safeSplit(contactosCrud.variables.contacto.gdcrgoc)).trigger('change');
        $('#EditContacto #CLENTE').prop('checked', contactosCrud.variables.contacto.clente == 1 ? true : false);
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
    },
    variables: {
      contacto: {},
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
                d.IDMRCA = func.IDEMPRESA();
                d.CESTDO = func.obtenerCESTDO(contactosTable);
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: null, title: 'Persona', render: data => `${data.nmbrs}, ${data.apllds}` },
              { data: 'eml', title: 'Email' },
              {
                data: null,
                title: 'Estado',
                className: 'text-center',
                render: data => {
                  return `<span><i class="fa fa-circle ${data.cestdo == 'A' ? 'text-success' : 'text-danger'}" title=${data.cestdo == 'A' ? 'Activo' : 'Inactivo'
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
              let buttons = [];

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
        formData.append('CLENTE', $('#AddContacto #CLENTE').is(':checked') ? 1 : 0);
        formData.append('GDRBROC', $('#AddContacto #GDRBROC').val());
        formData.append('GDCRGOC', $('#AddContacto #GDCRGOC').val());
        formData.append('IDMRCA_V', $('#AddContacto #IDMRCA').val());
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
        formData.append('CLENTE', $('#EditContacto #CLENTE').is(':checked') ? 1 : 0);
        formData.append('GDRBROC', $('#EditContacto #GDRBROC').val());
        formData.append('GDCRGOC', $('#EditContacto #GDCRGOC').val());
        formData.append('IDMRCA_V', $('#EditContacto #IDMRCA').val());
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

  const mailingsCrud = {
    init: () => {
      mailingsCrud.eventos.TABLE();
    },
    globales: () => {
      // evento al view
      $(`#${mailingsTable}`).on('click', '.view-email-button', function () {
        const data = CmailingsTable.row($(this).parents('tr')).data();
        console.log(data);
        if (!data.mailinG_ID) return swalFire.error('No se encontró el mailing seleccionado');

        data.imageneS_JSON = safeParse(data.imageneS_JSON, []);
        data.metricaS_DETALLE = safeParse(data.metricaS_DETALLE, []);
        data.metricaS_GENERAL = safeParse(data.metricaS_GENERAL, {});

        console.log('Ver mailing:', data)

        // añadirle asunto antes de data.cuerpO_HTML
        const contenidoConAsunto = `<div style="text-align:left;margin-bottom:16px;">
        <h2 style="color:#222;margin:0;font-size:20px;">${data.asunto}</h2>
      </div><br>` + data.cuerpO_HTML;

        $('#btnAddMailing').hide();
        $('#vistaPreviaBody').html(contenidoConAsunto);
        $('#modalVistaPrevia').modal('show');
        // Aquí puedes agregar la lógica para mostrar el correo electrónico
      });

      $(`#${mailingsTable}`).on('click', '.view-metricas-button', function () {

        const data = CmailingsTable.row($(this).parents('tr')).data();
        if (!data.mailinG_ID) return swalFire.error('No se encontró el mailing seleccionado');

        const general = safeParse(data.metricaS_GENERAL, {});
        const detalle = safeParse(data.metricaS_DETALLE, []);

        mailingsCrud.eventos.mostrarMetricas(general, detalle);
      });

    },
    variables: {
      data: {}
    },
    eventos: {
      TABLE: () => {
        $(`#${mailingsTable}_filter .radio-buttons #radioGroup_2`).prop('checked', true);

        if (!CmailingsTable) {
          CmailingsTable = $(`#${mailingsTable}`).DataTable({
            ...configTable(),
            ajax: {
              url: uisApis.API + '=BuscarMailings',
              type: 'GET',
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
              },
              data: function (d) {
                delete d.columns;
                d.IDMRCA = func.IDEMPRESA();
              }
            },
            columns: [
              { data: 'rn', title: '' },
              { data: 'asunto', title: 'Asunto' },
              { data: null, title: 'F. Envio', render: data => func.formatFecha(data.fechA_REGISTRO, 'DD-MM-YYYY HH:mm a') },
              { data: 'ucrcn', title: 'U. Creación' },

              {
                data: null,
                title: '',
                className: 'text-center',
                render: data => {
                  return `<div class="d-flex justify-content-center m-0 p-0">
                        <button name="VIEW" class="btn btn-sm btn-icon view-email-button" data-id="${data.id}" title="Ver"><i class="bx bx-show"></i></button>
                        <button name="REPORTE" class="btn btn-sm btn-icon view-metricas-button" data-id="${data.id}" title="Reporte"><i class="bx bx-bar-chart"></i></button>
                     </div>`;
                }
              }
            ],
            initComplete: function (settings, json) {

            },
            columnDefs: [],
            buttons: (() => {
              let buttons = [];
              return buttons;
            })()
          });
        } else {
          CmailingsTable.ajax.reload();
        }
      },
      mostrarMetricas: (mGeneral, mDetalle) => {
        const g = `
        <div class="row text-center gy-4">

          <div class="col">
            <div class="p-3 rounded shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
              <small class="text-dark fw-semibold d-block mb-1">
                <i class="bx bx-send me-1"></i> Total de Envíos
              </small>
              <h4 class="fw-bold text-primary mb-0">${mGeneral.TOTAL_ENVIADOS}</h4>
            </div>
          </div>

          <div class="col">
            <div class="p-3 rounded shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
              <small class="text-dark fw-semibold d-block mb-1">
                <i class="bx bx-show me-1"></i> Tasa de Apertura
              </small>
              <h4 class="fw-bold text-success mb-0">${mGeneral.TOTAL_ABIERTOS}</h4>
            </div>
          </div>

          <div class="col">
            <div class="p-3 rounded shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
              <small class="text-dark fw-semibold d-block mb-1">
                <i class="bx bx-mouse me-1"></i> Tasa de Clics
              </small>
              <h4 class="fw-bold text-info mb-0">${mGeneral.TOTAL_CLICKS}</h4>
            </div>
          </div>

          <div class="col">
            <div class="p-3 rounded shadow-sm bg-light h-100 d-flex flex-column justify-content-center">
              <small class="text-dark fw-semibold d-block mb-1">
                <i class="bx bx-user-x me-1"></i> Cancelaciones
              </small>
              <h4 class="fw-bold text-danger mb-0">${mGeneral.TOTAL_EVENTOS}</h4>
            </div>
          </div>

        </div>
      `;

        $("#metricasGeneral").html(g);

        // Destruir si ya existe (para evitar errores)
        if ($.fn.DataTable.isDataTable('#tablaMetricas')) {
          $('#tablaMetricas').DataTable().clear().destroy();
        }

        $('#tablaMetricas').DataTable({
          data: mDetalle,
          columns: [
            { data: "DESTINATARIO", title: "Destinatario" },
            { data: "ENVIADOS", title: "Enviado" },
            { data: "ABIERTOS", title: "Abierto" },
            { data: "CLICKS", title: "Click" },
            { data: "TOTAL_EVENTOS", title: "Eventos" }
          ],
          pageLength: 10,
          lengthChange: false,
          searching: false,
          info: true,
          ordering: false
        });

        $("#modalMetricas").modal("show");
      }

    },
  };

  const mailCaroCrud = {
    init: () => {

    },

    globales: async () => {
      await mailCaroCrud.eventos.obtenerContactos(func.IDEMPRESA());
      mailCaroCrud.eventos.cargarPlantilla1();

      let enviandoMailing = false;

      $("#btnAddMailing").on('click', async function (e) {
        e.preventDefault();
        if (enviandoMailing) return;
        enviandoMailing = true;

        try {
          let html = await mailCaroCrud.eventos.generarHTML_Plantilla1(true);
          await mailCaroCrud.eventos.sendMailing(html);
        } finally {
          enviandoMailing = false; // libera bloqueo
        }
      });

    },

    eventos: {
      // === PLANTILLA 1 ===
      cargarPlantilla1: () => {

        $('#formularioContainer').html(`
    <div id="formPlantilla1" class="p-3 border rounded-3 bg-white shadow-sm">


      <!-- Asunto -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Asunto <span class="text-danger">*</span></label>
        <input type="text" id="asunto1" class="form-control" placeholder="Asunto del correo" required />
      </div>

      <!-- Contactos -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Contactos</label>
        <select id="contactos1" class="form-select" multiple></select>
      </div>

      <!-- Mensaje -->
      <div class="mb-4">
        <label class="form-label fw-semibold">Mensaje</label>
        <div class="border rounded-3 quill-container bg-white">
          <div id="mensaje1" class="quill-editor" style="min-height:150px;"></div>
        </div>
      </div>

      <!-- CONTENEDOR DE ITEMS -->
      <button type="button" id="btnEnviarCorreo" class="btn btn-primary btn-sm mb-3">
        <i class="bx bx-send"></i> Enviar Correo
      </button>

      <div class="mb-3">
        <label class="form-label fw-semibold">Contenido dinámico</label>
        
        <div id="itemsContainer"></div>

        <div class="d-flex gap-2 mt-3">

          <button type="button" id="btnAddImagen" class="btn btn-outline-primary btn-sm">
            <i class="bx bx-image-add"></i> Agregar Imagen
          </button>


        </div>

      </div>

    </div>
  `);

        // --- Multiple Select ---
        let $select = $('#contactos1');
        let dataMS = [];

        for (const rubroKey in contactosPorRubro) {
          let r = contactosPorRubro[rubroKey];
          dataMS.push({
            type: 'optgroup',
            label: r.nombre,
            children: r.contactos
              .map(c => ({
                text: `${c.apllds} ${c.nmbrs} <${c.eml}>`,
                value: c.eml
              }))
              .filter(x => x.value)
          });
        }

        $select.multipleSelect({
          data: dataMS,
          width: '100%',
          placeholder: 'Selecciona contactos',
          selectAll: true
        });

        $('#contactos1').siblings('div.ms-parent').css('padding', '0');

        // --- QUILL ---
        const quill = new Quill('#mensaje1', {
          theme: 'snow',
          placeholder: 'Escribe...',
          modules: {
            toolbar: [['bold', 'italic'], ['link'], [{ list: 'ordered' }, { list: 'bullet' }]]
          }
        });

        // ======================================================
        //      ➕ AGREGAR IMAGEN
        // ======================================================
        $(document).off("click", "#btnAddImagen").on("click", "#btnAddImagen", function () {

          $("#itemsContainer").append(`
              <div class="itemElemento border rounded-3 p-3 mb-3 bg-light" data-tipo="imagen">

                <div class="d-flex justify-content-between mb-2">
                  <span class="fw-semibold">Imagen</span>
                  <button class="btn btn-sm btn-danger btnEliminarItem">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>

                <input type="file" class="itemImagen form-control mb-2" accept="image/*" />
                <input type="url" class="itemEnlace form-control mb-2" placeholder="Enlace de la imagen" />

                <!-- Márgenes dinámicos -->
                <div class="d-flex gap-2">
                  <input type="number" class="itemMT form-control" placeholder="Margin Top" value="2" min="0" />
                  <input type="number" class="itemMB form-control" placeholder="Margin Bottom" value="2" min="0" />
                  <input type="number" class="itemML form-control" placeholder="Margin Left" value="0" min="0" />
                  <input type="number" class="itemMR form-control" placeholder="Margin Right" value="0" min="0" />
                </div>

              </div>
            `);



          actualizarPreview();
        });

        // ======================================================
        //  ❌ ELIMINAR ITEM
        // ======================================================
        $(document).off("click", ".btnEliminarItem").on("click", ".btnEliminarItem", function () {
          $(this).closest('.itemElemento').remove();
          actualizarPreview();
        });

        // ======================================================
        //  📌 CAPTURAR IMAGENES Y GUARDAR BASE64 PARA EL PREVIEW
        // ======================================================
        $(document).off("change", ".itemImagen").on("change", ".itemImagen", function () {

          const input = this;

          if (!input.files || !input.files[0]) return;

          const reader = new FileReader();

          reader.onload = function (e) {
            // Guardar base64 en atributo del item
            $(input).closest('.itemElemento').attr("data-base64", e.target.result);
            actualizarPreview();
          };

          reader.readAsDataURL(input.files[0]);
        });

        // ======================================================
        // PREVIEW AUTOMÁTICO
        // ======================================================
        const actualizarPreview = async () => {
          const html = await mailCaroCrud.eventos.generarHTML_Plantilla1(false);
          $('#previewContainer').html(html);
        };

        $('#asunto1').off('input').on('input', actualizarPreview);
        $('#contactos1').off('change').on('change', actualizarPreview);
        quill.on('text-change', actualizarPreview);

        $(document).off('change input', '#itemsContainer input, #itemsContainer select')
          .on('change input', '#itemsContainer input, #itemsContainer select', actualizarPreview);

        $('#btnEnviarCorreo').off('click').on('click', async () => {
          const html = await mailCaroCrud.eventos.generarHTML_Plantilla1(true);
          await mailCaroCrud.eventos.sendMailing(html);
        });

        actualizarPreview();
      },
      generarHTML_Plantilla1: async (isEnvio = false) => {

        const asunto = $('#asunto1').val().trim();
        if (!asunto && isEnvio) return swalFire.warning('El asunto es obligatorio');

        const contactosUnicos = $('#contactos1').multipleSelect('getSelects') || [];
        const contactos = [...new Set(contactosUnicos)];

        const quill = Quill.find(document.querySelector('#mensaje1'));
        const mensajeHTML = quill.root.innerHTML;

        // Mostrar solo 4 contactos
        const visible = contactos.slice(0, 4);
        const restantes = contactos.length > 4 ? ` ... y ${contactos.length - 4} más` : '';
        const contactosMostrar = visible.join(', ') + restantes;

        // -----------------------------------------
        // 📌 LEER ITEMS INSERTADOS EN itemsContainer
        // -----------------------------------------
        let itemsHTML = "";

        $('#itemsContainer .itemElemento').each(function (index) {

          const tipo = $(this).data("tipo");

          // Márgenes dinámicos
          const mt = $(this).find('.itemMT').val() || 2;
          const mb = $(this).find('.itemMB').val() || 2;
          const ml = $(this).find('.itemML').val() || 0;
          const mr = $(this).find('.itemMR').val() || 0;

          // ---------------------------
          // 📌 IMAGEN
          // ---------------------------
          if (tipo === "imagen") {

            const link = $(this).find('.itemEnlace').val()?.trim() || "#";
            const base64 = $(this).attr("data-base64") || "";

            if (!base64) return;

            itemsHTML += `
              <table border="0" cellspacing="0" cellpadding="0"
                    style="width:100%; margin:${mt}px ${mr}px ${mb}px ${ml}px; border-collapse:collapse;">
                <tr>
                  <td align="center"> 
                    <a href="${isEnvio
                ? `replace_uri_${index + 1}&link=${encodeURIComponent(link)}&index=${index + 1}`
                : link}"
                      target="_blank">

                      <img src="${!isEnvio ? base64 : (index + 1)}"
                          style="width:100%; max-width:600px; height:auto; display:block;" 
                          alt="img" />

                    </a>
                  </td>
                </tr>
              </table>
            `;
          }

        });

        // -----------------------------
        // 📌 PLANTILLA HTML COMPLETA
        // -----------------------------
        return `
      <!-- CONTENEDOR RESPONSIVE -->
      <table border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff"
            style="width:100%; max-width:600px; margin:0 auto; border-collapse:collapse;">

        <tr>
          <td align="center" style="padding:20px;">

            <!-- CUERPO PRINCIPAL -->
            <table border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff"
                  style="width:100%; max-width:600px; border-collapse:collapse; margin:0 auto;">

              <tr>
                <td style="padding:20px; color:#333; font-size:14px;">

                  ${!isEnvio ? `
                    <!-- CONTACTOS -->
                    <p style="margin:0 0 10px 0; color:#555;">
                      <b>Para:</b> ${contactosMostrar}
                    </p>

                    <!-- ASUNTO -->
                    <h2 style="margin:0 0 20px 0; color:#222; font-size:20px;">
                      ${asunto}
                    </h2>
                  ` : ""}

                  <!-- MENSAJE PRINCIPAL -->
                  <div style="font-size:15px; line-height:1.5; color:#333;">
                    ${mensajeHTML}
                  </div>

                  <!-- ITEMS (IMÁGENES / BOTONES) -->
                  ${itemsHTML}

                  <!-- TRACKING -->
                  <img src="mailing_tracking" width="1" height="1"
                       style="display:block;" alt="" />

                  <!-- FOOTER -->
                  <table border="0" cellspacing="0" cellpadding="0"
                        style="width:100%; margin-top:20px; text-align:center;">
                    <tr>
                      <td style="font-size:12px; color:#777; line-height:1.5; text-align:center;">

                        Este correo electrónico fue enviado a <b>mailing@mailing</b><br/>

                        <div style="margin-top:5px;">
                          <a href="unsubscribe_link" 
                             style="color:#555; text-decoration:underline; font-size:12px;" 
                             target="_blank">
                             <b>Cancelar suscripción</b>
                          </a>
                        </div>

                        Caro & Asociados · Av. Víctor Andrés Belaunde N°370 San Isidro<br/>
                        Lima 27, Perú · Lima 15000

                        <div style="margin-top:20px;">
                          <a href="https://ccfirma.com/" target="_blank">
                            <img src="https://aicompliance.es/wp-content/uploads/2024/06/B6.png"
                                 alt="Logo" style="max-width:120px; height:auto;" />
                          </a>
                        </div>

                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
      },
      // ================== ENVIAR
      sendMailing: (htmlContent, plantilla = 1) => {
        const asunto = $(`#asunto1`).val().trim();
        const contactosUnicos = $(`#contactos1`).multipleSelect('getSelects') || [];
        const contactos = [...new Set(contactosUnicos)];

        if (!asunto) return swal('Atención', 'El asunto es obligatorio', 'warning');
        if (!contactos.length) return swal('Atención', 'Selecciona al menos un contacto', 'warning');


        const formData = new FormData();
        formData.append('ASNTO', asunto);
        formData.append('IDMRCA', func.IDEMPRESA());
        formData.append('CNTCTS', contactos.join(','));
        formData.append('MSJE', htmlContent);

        // const imagenes = $(`#formPlantilla1' .imagenInput`);
        // imagenes.each((i, el) => {
        //   const file = el.files[0];
        //   const link = $(el).siblings('.enlaceInput').val();
        //   if (file) {
        //     formData.append(`DATA[${i}].INDEX`, i + 1);
        //     formData.append(`DATA[${i}].URL`, link || '');
        //     formData.append(`DATA[${i}].FILE`, file);
        //   }
        // });

        const items = $('#itemsContainer .itemElemento');
        items.each((i, el) => {
          const tipo = $(el).data("tipo");
          if (tipo === "imagen") {
            const file = $(el).find('.itemImagen')[0].files[0];
            const link = $(el).find('.itemEnlace').val();
            if (file) {
              formData.append(`DATA[${i}].TYPE`, 'imagen');
              formData.append(`DATA[${i}].INDEX`, i + 1);
              formData.append(`DATA[${i}].URL`, link || '');
              formData.append(`DATA[${i}].FILE`, file);
            }
          } 
        });


        swalFire.cargando(['Espere un momento', 'Estamos enviando el correo']);
        $.ajax({
          url: uisApis.API + '=SendMailing',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: function (response) {
            if (response?.success) {
              swalFire.success('Correo enviado correctamente');

              return;
            }
            swalFire.error(response.mensaje);
          },
          error: (jqXHR, textStatus, errorThrown) => swalFire.error('Ocurrió un error al enviar el correo')
        });
      },
      obtenerContactos: async (IDMRCA) => {
        await $.ajax({
          url: uisApis.API + '=Buscar&IDMRCA=' + IDMRCA + '&CESTDO=A&length=10000&start=0',
          type: 'GET',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          success: function (response) {
            let contactos = response?.data || [];

            // Filtramos los rubros
            let GDRBROC_GROUPS = grupoDatos.filter(gd => gd.gdpdre === 'GDRBROC');

            // Objeto para agrupar contactos por rubro
            contactosPorRubro = {};

            contactos.forEach(c => {
              if (c.gdrbroc) {
                c.gdrbroc.split(',').forEach(g => {
                  let rubroVal = g.trim();
                  if (rubroVal) {
                    let rubro = GDRBROC_GROUPS.find(gr => gr.vlR1 === rubroVal);
                    let rubroNombre = rubro ? rubro.dtlle : 'Desconocido';

                    if (!contactosPorRubro[rubroVal]) {
                      contactosPorRubro[rubroVal] = {
                        nombre: rubroNombre,
                        contactos: []
                      };
                    }
                    contactosPorRubro[rubroVal].contactos.push(c);
                  }
                });
              } else {
                // Contactos sin rubro → grupo único "Sin Grupo"
                const keySinGrupo = 'sin_grupo';
                if (!contactosPorRubro[keySinGrupo]) {
                  contactosPorRubro[keySinGrupo] = {
                    nombre: 'Sin Grupo',
                    contactos: []
                  };
                }
                contactosPorRubro[keySinGrupo].contactos.push(c);
              }
            });

            // y un grupo único "Sin Grupo" para los que no tienen rubro.
          },
          error: (jqXHR, textStatus, errorThrown) => console.error('Ocurrió un error al obtener los contactos')
        });
      }
    }
  };

  const globalCrud = {
    init: async () => {
      await globalCrud.eventos.selects();
    },
    eventos: {
      selects: async () => {
        await Promise.all([
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
              grupoDatos = responseGD.data;
              let selects = document.querySelectorAll('#EditContacto select, #AddContacto select');
              selects = Array.from(selects).filter(select => select.getAttribute('name') != 'CESTDO');

              selects.forEach(select => {
                const name = select.getAttribute('name');
                const data = responseGD.data.filter(d => d.gdpdre == name);
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
              responseMR.data.forEach(d => {
                select.innerHTML += `<option value="${d.id}">${d.mrca}</option>`;
              });
            });
          })
          .catch(error => swalFire.error('Ocurrió un error al cargar los módulos y marcas'));
      }
    }
  };

  return {
    init: async () => {
      await func.select2Multiple();
      await globalCrud.init();
      contactosCrud.globales();
      mailCaroCrud.globales();
      mailingsCrud.globales();
      contactosCrud.init();

      var myTabs = document.querySelectorAll('.nav-tabs button');
      myTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const tabPane = tab.getAttribute('data-bs-target');
          if (tabPane === '#navs-email') {
            mailCaroCrud.init();
          }

          if (tabPane === '#navs-add-contacto') {
            contactosCrud.eventos.TABLACONTACTOS();
          }

          if (tabPane === '#navs-email-send') {
            mailingsCrud.init();
          }
        });
      });

      $("#condominio-actual_select").on("change", async function () {
        redirect(1, "navs-add-contacto", 1);
        await mailCaroCrud.eventos.obtenerContactos($(this).val());
      })
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
