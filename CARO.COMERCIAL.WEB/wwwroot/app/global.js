
$(document).ready(function () {
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


  // FECHAS
  const datepickerList = document.querySelectorAll('.dob-picker');
  datepickerList.forEach(function (datepicker) {
    // PONERLE PLACEHOLDER DD-MM-YYYY
    datepicker.placeholder = 'DD-MM-YYYY';
    if (datepicker._flatpickr) {
      datepicker._flatpickr.destroy();
    }

    flatpickr(datepicker, {
      altFormat: 'Y-m-d',
      dateFormat: 'Y-m-d',
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
