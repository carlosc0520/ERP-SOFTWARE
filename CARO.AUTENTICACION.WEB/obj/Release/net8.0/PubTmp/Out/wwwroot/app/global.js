
$(document).ready(function () {
  const actualizarAuditoria = (isEdit = false) => {
    var $modal = $('.modal.show')?.[0];
    if ($modal) {
      var $collapse = $modal.querySelector('div[id*="auditoria-"]');
      if ($collapse) {
        var $inputs = $collapse.querySelectorAll('input');

        if (!isEdit) {
          if ($inputs) {
            let localUsuario = localStorage.getItem('usuario');
            if (localUsuario !== null) {
              localUsuario = JSON.parse(localUsuario);
            } else {
              localUsuario = null;
            }

            $inputs.forEach(input => {
              switch (input.id) {
                case 'CESTDO':
                  input.value = (input.value == "A") ? "A" : "I";
                  break;
                case 'FESTDO':
                  input.value = new Date().toISOString().slice(0, 19).replace('T', ' ');
                  break;
                case 'UCRCN':
                  input.value = localUsuario?.user || 'ADMIN';
                  break;
                case 'UEDCN':
                  input.value = localUsuario?.user || 'ADMIN';
                  break;
                case 'FCRCN':
                  input.value = new Date().toISOString().slice(0, 19).replace('T', ' ');
                  break;
                case 'FEDCN':
                  input.value = new Date().toISOString().slice(0, 19).replace('T', ' ');
                  break;
              }
            });
          }
        }

        if (isEdit) {
          if ($inputs) {
            $inputs.forEach(input => {
              switch (input.id) {
                case 'UEDCN':
                  input.value = '';
                  break;
                case 'FEDCN':
                  input.value = new Date().toISOString().slice(0, 19).replace('T', ' ');
                  break;
              }
            });
          }
        }
      }
    }
  }

  const auditoriaShow = (collapse, isEdit = false, modal, auditoria) => {
    var $collapse = collapse;

    if ($collapse) {
      var $inputs_obj = $(`#${auditoria} ${modal} input`)

      // covnertir objeto a array
      var $inputs = Array.from($inputs_obj);

      if (!isEdit) {
        if ($inputs) {
          let localUsuario = localStorage.getItem('usuario');
          if (localUsuario !== null) {
            localUsuario = JSON.parse(localUsuario);
          } else {
            localUsuario = null;
          }

          $inputs.forEach(input => {
            let data_id = input.id;
            switch (input.id) {
              case 'CESTDO':
                $(`#${auditoria} ${modal} #CESTDO`).val(input.value == "A" ? "A" : "I");
                break;
              case 'FESTDO':
                $(`#${auditoria} ${modal} #FESTDO`).val(new Date().toISOString().slice(0, 19).replace('T', ' '));
                break;
              case 'UCRCN':
                // input.value = 'ADMIN';
                $(`#${auditoria} ${modal} #UCRCN`).val(localUsuario?.user || 'ADMIN');
                break;
              case 'UEDCN':
                $(`#${auditoria} ${modal} #UEDCN`).val(localUsuario?.user || 'ADMIN');
                break;
              case 'FCRCN':
                $(`#${auditoria} ${modal} #FCRCN`).val(new Date().toISOString().slice(0, 19).replace('T', ' '));
                break;
              case 'FEDCN':
                $(`#${auditoria} ${modal} #FEDCN`).val(new Date().toISOString().slice(0, 19).replace('T', ' '));
                break;
            }
          });
        }
      }

      if (isEdit) {
        if ($inputs) {
          $inputs.forEach(input => {
            switch (input.id) {
              case 'UEDCN':
                $(`#${auditoria} ${modal} #UEDCN`).val('');
                break;
              case 'FEDCN':
                $(`#${auditoria} ${modal} #FEDCN`).val(new Date().toISOString().slice(0, 19).replace('T', ' '));
                break;
            }
          });
        }
      }
    }
  }

  // *** AUDITORIA
  $('.modal').on('show.bs.modal', async function (e) {
    let dataIdModal = e.currentTarget.id;
    var $collapse = $(`#${dataIdModal} #auditoria-collapse`)?.[0];
    var $collapseE = $(`#${dataIdModal} #auditoria-collapse-e`)?.[0];
    var $btn = $(`#${dataIdModal} #container-auditoria`)?.[0];
    var $btnE = $(`#${dataIdModal} #container-auditoria-e`)?.[0];

    if ($collapse) {
      await auditoriaShow($collapse, false, '#auditoria-collapse', dataIdModal);
      $collapse.classList.remove('show');
      $btn.innerHTML = '+ Mostrar Auditoria';
      $btn.classList.remove('bg-danger');
      $btn.classList.add('bg-success');
    }

    if ($collapseE) {
      await auditoriaShow($collapseE, true, `#auditoria-collapse-e`, dataIdModal);
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
    $(`${dataIdModal} #container-auditoria-e`).on('click', async function () {
      var $btn = $(`${dataIdModal} #container-auditoria-e`)?.[0];

      if ($btn.textContent === '- Ocultar Auditoria') {
        $btn.innerHTML = '+ Mostrar Auditoria';
        $btn.classList.remove('bg-danger');
        $btn.classList.add('bg-success');
      } else {
        $btn.innerHTML = '- Ocultar Auditoria';
        $btn.classList.remove('bg-success');
        $btn.classList.add('bg-danger');
        await ctualizarAuditoria(true);
      }
    });
  });

  $(".modal").on('hidden.bs.modal', function (e) {
    const datepickerList = document.querySelectorAll(`#${e.currentTarget.id} .date-mask`);
    datepickerList.forEach(function (datepicker) {
      datepicker.value = null;
    });
  })


  // *** DATATABLES
  $(document).on('draw.dt', 'table', function () {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  });

  // *** AJAX
  $(document).ajaxSend(function (event, xhr, settings) {
    xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('accessToken') || null));
  });

  $('input[type="text"], textarea, input[type="email"]').not('.noMayus').on('input', function () {
    try {
      var startPos = this.selectionStart;
      var endPos = this.selectionEnd;

      this.value = this.value.toUpperCase();

      this.setSelectionRange(startPos, endPos);
    } catch (error) {

    }
  });

  $('.solo-numero').on('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  $('input[type="search"]').on('input', function () {
    var startPos = this.selectionStart;
    var endPos = this.selectionEnd;

    this.value = this.value.toUpperCase();

    this.setSelectionRange(startPos, endPos);
  });

  // QUITAR AUTOCOMPLETADO A TODOS LOS INPUTS DE CUALQUIER TIPO
  $('input').each(function () {
    $(this).attr('autocomplete', 'off');
  });
  // date-mask dob-picker

  /// VALIDADORES DE INPUTS

  // TELEFONOS
  const phoneMaskList = document.querySelectorAll('.phone-mask');
  phoneMaskList.forEach(function (phoneMask) {
    new Cleave(phoneMask, {
      phone: true,
      phoneRegionCode: 'PE',
      blocks: [3, 3, 3],
    });

    phoneMask.maxLength = 9;
  });


  const datepickerListModify = document.querySelectorAll('.dob-picker-format');
  datepickerListModify.forEach(function (datepicker) {
    // PONERLE PLACEHOLDER DD-MM-YYYY
    datepicker.placeholder = 'DD-MM-YYYY';
    if (datepicker._flatpickr) {
      datepicker._flatpickr.destroy();
    }

    flatpickr(datepicker, {
      altFormat: 'd-m-Y',
      dateFormat: 'd-m-Y',
      // altFormat: 'd-m-Y',
      // dateFormat: 'd-m-Y',
      altInput: true,
      allowInput: true,
      disableMobile: true,
      locale: {
        firstDayOfWeek: 1,
        weekdays: {
          shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
          longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        },
        months: {
          shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        },
      },
      onClose: function (selectedDates, dateStr, instance) {
        if (dateStr === '') {
          instance.setDate(null);
        }
      },
    });
  });


});
