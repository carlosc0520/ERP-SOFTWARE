
$(document).ready(async function () {
  // Cache de usuario para evitar múltiples JSON.parse
  let usuarioCache = null;
  const getUsuario = () => {
    if (!usuarioCache) {
      const stored = localStorage.getItem('usuario');
      usuarioCache = stored ? JSON.parse(stored) : null;
    }
    return usuarioCache;
  };

  // Obtener fecha actual formateada (cache para evitar múltiples llamadas)
  const getFechaActual = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

  async function cargarMarcas() {
    const $select = $("#condominio-actual_select");
    if (!$select.length) return; // Evitar si no existe el elemento

    const LS_SELECTED = "selectedMarca";
    const token = localStorage.getItem("accessToken");

    $select.prop('disabled', true).html('<option value="">Cargando...</option>');

    // Registrar evento solo una vez
    if (!$select.data("has-change-listener")) {
      $select.on("change", function () {
        localStorage.setItem(LS_SELECTED, this.value);
      });
      $select.data("has-change-listener", true);
    }

    try {
      const response = await $.ajax({
        url: `/Seguridad/Marcas/Index?handler=Obtener&start=0&length=100&PROPIO=1`,
        type: "GET",
        beforeSend: (xhr) => xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      });

      if (response?.data?.length > 0) {
        const marcas = response.data;
        // Construir opciones en memoria
        $select.html(marcas.map(({ id, mrca }) => `<option value="${id}">${mrca}</option>`).join(''));

        // Determinar selección
        const selected = localStorage.getItem(LS_SELECTED);
        const valorDefecto = marcas.some(m => m.id == selected) ? selected :
          marcas.some(m => m.id == '1') ? '1' : marcas[0]?.id;

        if (valorDefecto) {
          localStorage.setItem(LS_SELECTED, valorDefecto);
          $select.val(valorDefecto);
        }
      } else {
        $select.html('<option value="">(Sin registros)</option>');
      }
    } catch (error) {
      console.error("Error al cargar las marcas:", error);
      $select.html('<option value="">(Error al cargar)</option>');
    } finally {
      $select.prop('disabled', false);
    }
  }

  await cargarMarcas();

  // Función para marcar el menú activo basado en la URL
  const marcarMenuActivo = () => {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
      const link = item.querySelector('.menu-link');
      const url = item.dataset.url;
      let isActive = false;

      // Activar Home o submenús
      if (link?.getAttribute('href') === currentPath || (url && currentPath.includes(url))) {
        isActive = true;
      }

      if (isActive) {
        item.classList.add('active');
        const parentItem = item.closest('.menu-sub')?.parentElement;
        if (parentItem) parentItem.classList.add('open', 'active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  // Función para generar el menú en el DOM
  const generarMenu = (usuario, menu) => {
    // Actualizar información del usuario
    const drow_user = document.getElementById("drow-usuario");
    const drow_role = document.getElementById("drow-rol");
    if (drow_user) drow_user.textContent = usuario?.uedcn || '';
    if (drow_role) drow_role.textContent = usuario?.desc || '';

    const menuContainer = document.querySelector('.menu-inner');
    if (!menuContainer) return;

    // Usar DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();

    // Agregar Home
    const homeItem = document.createElement('li');
    homeItem.className = 'menu-item';
    homeItem.innerHTML = `<a href="/Inicio" class="menu-link"><i class="menu-icon tf-icons bx bx-home-circle"></i><div data-i18n="Home">Home</div></a>`;
    fragment.appendChild(homeItem);

    // Ordenar y procesar menú principal
    menu.sort((a, b) => a.dscrpcn.localeCompare(b.dscrpcn)).forEach(item => {
      const submodulos = (JSON.parse(item?.submodulo) || []).sort((a, b) => a.DSCRPCN.localeCompare(b.DSCRPCN));

      const parentItem = document.createElement('li');
      parentItem.className = 'menu-item';
      parentItem.dataset.idobjto = item.id;
      parentItem.innerHTML = `<a href="javascript:void(0);" class="menu-link menu-toggle"><i class="menu-icon tf-icons ${item.icono}"></i><div>${item.dscrpcn}</div><div class="badge erp-badge-orange rounded-pill ms-auto">${submodulos.length}</div></a><ul class="menu-sub"></ul>`;

      const menuSub = parentItem.querySelector('.menu-sub');
      submodulos.forEach(submodulo => {
        const childItem = document.createElement('li');
        childItem.className = 'menu-item';
        childItem.dataset.ID = submodulo.ID;
        childItem.dataset.url = submodulo.URL;
        childItem.innerHTML = `<a href="${submodulo.URL}" class="menu-link"><div>${submodulo.DSCRPCN}</div></a>`;
        menuSub.appendChild(childItem);
      });

      fragment.appendChild(parentItem);
    });

    // Actualizar DOM de una sola vez
    menuContainer.innerHTML = '';
    menuContainer.appendChild(fragment);
    marcarMenuActivo();
  };

  // Mostrar mensaje de error en el menú
  const mostrarErrorMenu = () => {
    const menuContainer = document.querySelector('.menu-inner');
    if (menuContainer) {
      menuContainer.innerHTML = `<li class="menu-item"><div class="text-center py-5"><i class="bx bx-error-circle text-danger fs-1"></i><div class="mt-2 text-danger">Error al cargar el menú</div><button class="btn btn-sm btn-primary mt-3" onclick="location.reload()">Reintentar</button></div></li>`;
    }
  };

  async function cargarNavegacion() {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch("/Layouts/Sections/Menu/Menu?handler=Obtener", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

      const res = await response.json();
      if (res?.data) {
        generarMenu(res.usuario, res.data);
      } else {
        mostrarErrorMenu();
      }
    } catch (error) {
      console.error('Error al cargar el menú:', error);
      mostrarErrorMenu();
    }
  }

  await cargarNavegacion();

  // Actualizar auditoría (optimizado)
  const actualizarAuditoria = (isEdit = false) => {
    const $modal = $('.modal.show')?.[0];
    if (!$modal) return;

    const $collapse = $modal.querySelector('div[id*="auditoria-"]');
    if (!$collapse) return;

    const $inputs = $collapse.querySelectorAll('input');
    if (!$inputs.length) return;

    const usuario = getUsuario();
    const fecha = getFechaActual();
    const userValue = usuario?.user || 'ADMIN';

    if (isEdit) {
      $inputs.forEach(input => {
        if (input.id === 'UEDCN') input.value = '';
        else if (input.id === 'FEDCN') input.value = fecha;
      });
    } else {
      $inputs.forEach(input => {
        switch (input.id) {
          case 'CESTDO': input.value = input.value === "A" ? "A" : "I"; break;
          case 'FESTDO': case 'FCRCN': case 'FEDCN': input.value = fecha; break;
          case 'UCRCN': case 'UEDCN': input.value = userValue; break;
        }
      });
    }
  };

  // Mostrar auditoría (optimizado y corregido)
  const auditoriaShow = (modal, auditoria, isEdit = false) => {
    const $inputs = $(`#${auditoria} ${modal} input`);
    if (!$inputs.length) return;

    const usuario = getUsuario();
    const fecha = getFechaActual();
    const userValue = usuario?.user || 'ADMIN';

    if (isEdit) {
      $(`#${auditoria} ${modal} #UEDCN`).val('');
      $(`#${auditoria} ${modal} #FEDCN`).val(fecha);
    } else {
      $inputs.each(function () {
        const $input = $(this);
        switch (this.id) {
          case 'CESTDO': $input.val($input.val() === "A" ? "A" : "I"); break;
          case 'FESTDO': case 'FCRCN': case 'FEDCN': $input.val(fecha); break;
          case 'UCRCN': case 'UEDCN': $input.val(userValue); break;
        }
      });
    }
  };

  // *** AUDITORIA
  $('.modal').on('show.bs.modal', async function (e) {
    let dataIdModal = e.currentTarget.id;
    var $collapse = $(`#${dataIdModal} #auditoria-collapse`)?.[0];
    var $collapseE = $(`#${dataIdModal} #auditoria-collapse-e`)?.[0];
    var $btn = $(`#${dataIdModal} #container-auditoria`)?.[0];
    var $btnE = $(`#${dataIdModal} #container-auditoria-e`)?.[0];

    if ($collapse) {
      await auditoriaShow('#auditoria-collapse', dataIdModal, false);
      $collapse.classList.remove('show');
      $btn.innerHTML = '+ Mostrar Auditoria';
      $btn.classList.remove('bg-danger');
      $btn.classList.add('bg-success');
    }

    if ($collapseE) {
      await auditoriaShow('#auditoria-collapse-e', dataIdModal, true);
      $collapseE.classList.remove('show');
      $btnE.innerHTML = '+ Mostrar Auditoria';
      $btnE.classList.remove('bg-danger');
      $btnE.classList.add('bg-success');
    }

    $(`#${dataIdModal} #container-auditoria`).off('click');
    $(`#${dataIdModal} #container-auditoria`).on('click', async function () {
      $btn = $(`#${dataIdModal} #container-auditoria`)?.[0];
      $aria = $btn?.getAttribute('aria-expanded');

      if ($btn.textContent === '- Ocultar Auditoria') {
        $btn.innerHTML = '+ Mostrar Auditoria';
        $btn.classList.remove('bg-danger');
        $btn.classList.add('bg-success');
      } else {
        $btn.innerHTML = '- Ocultar Auditoria';
        $btn.classList.remove('bg-success');
        $btn.classList.add('bg-danger');
        await actualizarAuditoria();
      }
    })

    $(`#${dataIdModal} #container-auditoria-e`).off('click');
    $(`#${dataIdModal} #container-auditoria-e`).on('click', async function () {
      var $btn = $(`#${dataIdModal} #container-auditoria-e`)?.[0];

      if ($btn.textContent === '- Ocultar Auditoria') {
        $btn.innerHTML = '+ Mostrar Auditoria';
        $btn.classList.remove('bg-danger');
        $btn.classList.add('bg-success');
      } else {
        $btn.innerHTML = '- Ocultar Auditoria';
        $btn.classList.remove('bg-success');
        $btn.classList.add('bg-danger');
        await actualizarAuditoria(true);
      }
    });
  });

  $(".modal").on('hidden.bs.modal', function (e) {
    $(`#${e.currentTarget.id} .date-mask`).val(null);
  });


  // *** DATATABLES
  $(document).on('draw.dt', 'table', function () {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  });

  // *** AJAX
  $(document).ajaxSend(function (event, xhr, settings) {
    var url = new URL(settings.url, window.location.origin);
    let token = localStorage.getItem('accessToken');
    if (!token || ['null', 'undefined', ''].includes(token)) {
      token = url.searchParams.get('accessToken');
    }

    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  });

  // Evento delegado para mayúsculas (optimizado)
  $(document).on('input', 'input[type="text"]:not(.noMayus), textarea:not(.noMayus), input[type="email"]:not(.noMayus), input[type="search"]', function () {
    const start = this.selectionStart, end = this.selectionEnd;
    this.value = this.value.toUpperCase();
    this.setSelectionRange(start, end);
  });

  // Solo números
  $(document).on('input', '.solo-numero', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  // Quitar autocompletado
  $('input').attr('autocomplete', 'off');
  // date-mask dob-picker

  /// VALIDADORES DE INPUTS

  // TELEFONOS
  document.querySelectorAll('.phone-mask').forEach(phoneMask => {
    new Cleave(phoneMask, { phone: true, phoneRegionCode: 'PE', blocks: [3, 3, 3] });
    phoneMask.maxLength = 9;
  });


  // Configuración de locale compartida para datepickers
  const localeES = {
    firstDayOfWeek: 1,
    weekdays: {
      shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    },
    months: {
      shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    }
  };

  // Datepicker con formato fecha
  document.querySelectorAll('.dob-picker-format').forEach(datepicker => {
    datepicker.placeholder = 'DD-MM-YYYY';
    if (datepicker._flatpickr) datepicker._flatpickr.destroy();

    flatpickr(datepicker, {
      altFormat: 'd-m-Y',
      dateFormat: 'd-m-Y',
      altInput: true,
      allowInput: true,
      disableMobile: true,
      locale: localeES,
      onClose: (selectedDates, dateStr, instance) => {
        if (dateStr === '') instance.setDate(null);
      }
    });
  });

  // Datepicker con hora
  document.querySelectorAll('.dob-picker-format-hour').forEach(datepicker => {
    datepicker.placeholder = 'DD-MM-YYYY HH:mm';
    if (datepicker._flatpickr) datepicker._flatpickr.destroy();

    flatpickr(datepicker, {
      enableTime: true,
      altFormat: 'Y-m-dTH:i:S',
      locale: localeES,
      onReady: (selectedDates, dateStr, instance) => {
        if (instance.isMobile) instance.mobileInput.setAttribute('step', null);
      }
    });
  });

});

// Función global para cambiar contraseña
window.mostrarCambiarContrasena = async function () {
  const { value: formValues } = await Swal.fire({
    title: 'Cambiar Contraseña',
    html: `
      <div class="mb-3 text-start">
        <label for="swal-password-old" class="form-label fw-semibold">Contraseña Actual</label>
        <div class="input-group">
          <input type="password" id="swal-password-old" class="noMayus form-control" placeholder="Ingrese su contraseña actual" autocomplete="current-password">
          <button class="btn btn-outline-secondary toggle-password" type="button" data-target="swal-password-old">
            <i class="bx bx-hide"></i>
          </button>
        </div>
      </div>
      <div class="mb-3 text-start">
        <label for="swal-password-new" class="form-label fw-semibold">Nueva Contraseña</label>
        <div class="input-group">
          <input type="password" id="swal-password-new" class="noMayus form-control" placeholder="Ingrese su nueva contraseña" autocomplete="new-password">
          <button class="btn btn-outline-secondary toggle-password" type="button" data-target="swal-password-new">
            <i class="bx bx-hide"></i>
          </button>
        </div>
        <small class="text-muted d-block mt-1">Mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial</small>
      </div>
      <div class="mb-3 text-start">
        <label for="swal-password-confirm" class="form-label fw-semibold">Confirmar Nueva Contraseña</label>
        <div class="input-group">
          <input type="password" id="swal-password-confirm" class="noMayus form-control" placeholder="Confirme su nueva contraseña" autocomplete="new-password">
          <button class="btn btn-outline-secondary toggle-password" type="button" data-target="swal-password-confirm">
            <i class="bx bx-hide"></i>
          </button>
        </div>
      </div>
      <div id="swal-error-message" class="alert alert-danger d-none mt-3" role="alert"></div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Cambiar Contraseña',
    cancelButtonText: 'Cancelar',
    buttonsStyling: false,
    reverseButtons: false,
    customClass: {
      popup: 'rounded-4 shadow-lg',
      title: 'fw-bold fs-4 mb-3 text-center',
      htmlContainer: 'px-3',
      confirmButton: 'btn btn-primary px-4 py-2 fw-semibold',
      cancelButton: 'btn btn-secondary px-4 py-2 fw-semibold',
      actions: 'd-flex gap-3 justify-content-center mt-4'
    },
    didOpen: () => {
      // Funcionalidad para mostrar/ocultar contraseñas
      document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
          const targetId = this.getAttribute('data-target');
          const input = document.getElementById(targetId);
          const icon = this.querySelector('i');
          
          if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bx-hide');
            icon.classList.add('bx-show');
          } else {
            input.type = 'password';
            icon.classList.remove('bx-show');
            icon.classList.add('bx-hide');
          }
        });
      });
    },
    focusConfirm: false,
    preConfirm: async () => {
      const oldPassword = document.getElementById('swal-password-old').value.trim();
      const newPassword = document.getElementById('swal-password-new').value.trim();
      const confirmPassword = document.getElementById('swal-password-confirm').value.trim();
      const errorDiv = document.getElementById('swal-error-message');

      // Ocultar error previo
      errorDiv.classList.add('d-none');

      // Validar campos vacíos
      if (!oldPassword || !newPassword || !confirmPassword) {
        errorDiv.textContent = 'Todos los campos son obligatorios';
        errorDiv.classList.remove('d-none');
        return false;
      }

      // Validación completa con regex: mínimo 8 caracteres, mayúscula, minúscula y carácter especial
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      
      if (!passwordRegex.test(newPassword)) {
        if (newPassword.length < 8) {
          errorDiv.textContent = 'La contraseña debe tener al menos 8 caracteres';
        } else if (!/[A-Z]/.test(newPassword)) {
          errorDiv.textContent = 'La contraseña debe contener al menos una letra mayúscula';
        } else if (!/[a-z]/.test(newPassword)) {
          errorDiv.textContent = 'La contraseña debe contener al menos una letra minúscula';
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
          errorDiv.textContent = 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)';
        }
        errorDiv.classList.remove('d-none');
        return false;
      }

      // Validar que las contraseñas coincidan
      if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.classList.remove('d-none');
        return false;
      }

      // Validar que sea diferente de la actual
      if (oldPassword === newPassword) {
        errorDiv.textContent = 'La nueva contraseña debe ser diferente a la actual';
        errorDiv.classList.remove('d-none');
        return false;
      }

      // Mostrar loading mientras se procesa
      Swal.showLoading();

      // Realizar llamada AJAX
      try {
        const formData = new FormData();
        formData.append('PASSWORD_OLD', oldPassword);
        formData.append('PASSWORD_NEW', newPassword);

        const response = await $.ajax({
          url: '/Seguridad/Usuario/Index?handler=LoginResetPassword',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData
        });

        if (response?.codEstado > 0 && response?.esSatisfactoria) {
          // Éxito - cerrar modal y mostrar mensaje
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'Su contraseña ha sido cambiada exitosamente.',
            confirmButtonText: 'Entendido',
            buttonsStyling: false,
            customClass: {
              popup: 'rounded-4 shadow-lg',
              title: 'fw-bold fs-4 mb-2 text-center',
              confirmButton: 'btn btn-success px-4 py-2 fw-semibold'
            }
          });
          return true;
        } else {
          // Error del servidor
          errorDiv.textContent = response?.message || 'Ocurrió un error al cambiar la contraseña';
          errorDiv.classList.remove('d-none');
          Swal.hideLoading();
          return false;
        }
      } catch (error) {
        // Error de red o servidor
        errorDiv.textContent = error?.responseJSON?.message || 'Error de conexión. Intente nuevamente.';
        errorDiv.classList.remove('d-none');
        Swal.hideLoading();
        return false;
      }
    }
  });
};

// Eventos fuera del document.ready
$("#log-out").on('click', () => {
  localStorage.clear();
  window.location.href = '/login';
});

// Evento para cambiar contraseña
$(document).on('click', '#cambiar-contrasena', function (e) {
  e.preventDefault();
  window.mostrarCambiarContrasena();
});

// Trim en blur (delegado para elementos dinámicos)
$(document).on('blur', 'textarea, input[type="text"], input[type="email"]', function () {
  this.value = this.value.trim();
});

// Configuración inicial
$(".avatar-online img").attr('src', localStorage.getItem('imagenPerfil') || '/img/avatars/1.png');
$(".template-customizer-open-btn").remove();