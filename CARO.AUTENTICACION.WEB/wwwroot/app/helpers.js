const pathFileImg = "https://resourcesasociados.caroasociados.pe/";

const Authorization = () => {
  return {
    Authorization: 'Bearer ' + localStorage.getItem('accessToken') || null
  };
};
const previewTemplate = tipo => `
  <div class="dz-preview dz-file-preview">
    <div class="dz-details">
      <div class="dz-thumbnail">
        <img data-dz-thumbnail class="centered-image" style="max-width: 200px; max-height: 200px;">
        <span class="dz-nopreview">No preview</span>
        <div class="dz-success-mark"></div>
        <div class="dz-error-mark"></div>
        <div class="dz-error-message"><span data-dz-errormessage></span></div>
        <div class="progress">
          <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
        </div>
      </div>
      <div class="dz-filename" data-dz-name></div>
      <div class="dz-size" data-dz-size></div>
    </div>
    <div class="dz-remove">
      <button class="btn btn-danger btn-sm" data-dz-remove>Quitar ${tipo}</button>
    </div>
  </div>
`;

const previewTemplateMulti = `<div class="dz-preview dz-file-preview">
  <div class="dz-details">
    <div class="dz-thumbnail">
      <img data-dz-thumbnail>
      <span class="dz-nopreview">No preview</span>
      <div class="dz-success-mark"></div>
      <div class="dz-error-mark"></div>
      <div class="dz-error-message"><span data-dz-errormessage></span></div>
      <div class="progress">
        <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
      </div>
    </div>
    <div class="dz-filename" data-dz-name></div>
    <div class="dz-size" data-dz-size></div>
  </div>
</div>`;

// agregarle botones de eliminar y descargar
const previewTemplateMultiEdit = `<div class="dz-preview dz-file-preview">
<div class="dz-details">
  <div class="dz-thumbnail">
    <img data-dz-thumbnail>
    <span class="dz-nopreview">No preview</span>
    <div class="dz-success-mark"></div>
    <div class="dz-error-mark"></div>
    <div class="dz-error-message"><span data-dz-errormessage></span></div>
    <div class="progress">
      <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
    </div>
  </div>
  <div class="dz-filename" data-dz-name></div>
  <div class="dz-size" data-dz-size></div>
  <div class="d-flex justify-content-center my-2">
    <button class="btn btn-primary btn-sm data-dz-download" data-dz-download>Descargar</button>
  </div>
</div>
</div>`;

const previewTemplateImage = (tipo = 'Imagen') => `
  <div class="dz-preview dz-file-preview" style="width: 50%; height: 80%;">
    <div class="dz-details">
        <img data-dz-thumbnail class="centered-image" style="width: 100%; height: 100%;">
        <div class="progress">
          <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
        </div>
    </div>
    <div class="dz-remove">
      <button class="btn btn-danger btn-sm" data-dz-remove>Quitar ${tipo}</button>
    </div>
  </div>
`;

const radio_group_estados =
  '<div class="radio-buttons">' +
  '<select class="form-select" id="radioGroup_estado" name="radioGroup_estado">' +
  '<option value="">Todos</option>' +
  '<option selected value="A">Activo</option>' +
  '<option value="I">Inactivo</option>' +
  '</select>' +
  '</div>';

const radio_group_estadosAll =
  '<div class="radio-buttons">' +
  '<label class="text-lg" ><input type="radio" id="radioGroup_2" name="radioGroup_estado" value="V"> Vigente</label>' +
  '<label class="text-lg" ><input type="radio" id="radioGroup_3" name="radioGroup_estado" value="A"> Anulado</label>' +
  '<label class="text-lg" ><input type="radio" id="radioGroup_1" name="radioGroup_estado" checked value=""> Todos</label>' +
  '</div>';

let GDESTDO_G = [
  { vlR1: 'A', dtlle: 'Activo' },
  { vlR1: 'I', dtlle: 'Inactivo' }
]

const swalFire = {
  cargando: (mensaje = [], isClose = true) => {
    Swal.fire({
      title: 'Cargando...',
      html: `
      ${mensaje.length > 1 ? mjsArraySwal(mensaje) : '<p class="text-lg">Espere un momento por favor.</p>'}
      <div class="spinner-container">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only"></span>
        </div>
      </div>`,
      buttonsStyling: false,
      showConfirmButton: false,
      allowOutsideClick: isClose
    });
  },
  success: (title, mensaje = '', eventos = {}, textmsj = '') => {
    Swal.fire({
      title: title,
      text: mensaje,
      icon: 'success',
      confirmButtonText: 'Ok',
      confirmButton: false,
      customClass: {
        confirmButton: 'btn btn-success'
      }
    }).then(result => {
      for (const key in eventos) {
        if (Object.hasOwnProperty.call(eventos, key)) {
          eventos[key]();
        }
      }
    });
  },
  error: (mensaje = '', eventos = {}) => {
    Swal.fire({
      icon: 'error',
      title: mensaje,
      showConfirmButton: true
    }).then(result => {
      for (const key in eventos) {
        if (Object.hasOwnProperty.call(eventos, key)) {
          eventos[key]();
        }
      }
    });
  },
  errorMensaje: (mensaje = '') => {
    Swal.fire({
      icon: 'error',
      title: '',
      html: `<p class="">${mensaje}<br></p>`,
      showConfirmButton: true,
      confirmButtonText: 'Ok',
      customClass: {
        confirmButton: 'btn btn-success'
      }
    });
  },
  warning: (mensaje = '') => {
    Swal.fire({
      icon: 'warning',
      title: mensaje,
      showConfirmButton: true
    });
  },
  cerrar: () => Swal.close(),
  cancelar: mensaje => {
    Swal.fire({
      title: 'Cancelado',
      html: `<p>¡No se ha eliminado!</p>`,
      icon: 'error',
      confirmButtonText: 'Ok',
      customClass: {
        confirmButton: 'btn btn-success'
      }
    });
  },
  delete: (mensaje, eventos) => {
    Swal.fire({
      title: '',
      html: `<p class="">${mensaje}<br></p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
      }
    }).then(result => {
      if (result.isConfirmed) {
        for (const key in eventos) {
          if (Object.hasOwnProperty.call(eventos, key)) {
            eventos[key]();
          }
        }
      } else {
        swalFire.cancelar();
      }
    });
  },
  confirmar: (mensaje, eventos = {}) => {
    Swal.fire({
      title: '',
      html: `<p class="">${mensaje}<br></p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
      }
    }).then(result => {
      if (result.isConfirmed) {
        for (const key in eventos) {
          if (Object.hasOwnProperty.call(eventos, key)) {
            eventos[key]();
          }
        }
      }
    });
    info: (mensaje = '') => {
      Swal.fire({
        icon: 'info',
        title: mensaje,
        showConfirmButton: true
      });
    };
  },
  coolToAction: (title, eventos = {}) => {
    Swal.fire({
      title,
      // poner textarea
      input: 'textarea',
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const value = Swal.getInput().value;
        if (!value) {
          Swal.showValidationMessage("Debe ingresar un valor");
          return false;
        }

        for (const key in eventos) {
          if (Object.hasOwnProperty.call(eventos, key)) {
            await eventos[key](value);
          }
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) { }
    });
  }
};

const mjsArraySwal = array => {
  let cant = array.length;
  var html = `<div class='slide-vertical m-0 p-0 elements-${cant}'><ul>`;
  for (var i = 0; i < array.length; i++) {
    // tamaño 1.6rem
    html += "<li class='text-lg'>" + array[i] + '</li>';
  }
  html += '</ul></div>';
  return html;
};

const plugins = {
  trigger: typeof FormValidation != 'undefined' ? new FormValidation.plugins.Trigger() : null,
  bootstrap5:
    typeof FormValidation != 'undefined'
      ? new FormValidation.plugins.Bootstrap5({
        eleValidClass: '',
        rowSelector: '.col-12'
      })
      : null,
  submitButton: typeof FormValidation != 'undefined' ? new FormValidation.plugins.SubmitButton() : null,
  autoFocus: typeof FormValidation != 'undefined' ? new FormValidation.plugins.AutoFocus() : null
};

const configTable = (domHelp = null, mensaje = '', lengthMenu = [10, 15, 20], all = false) => {
  return {
    order: [[1, 'desc']],
    dom:
      domHelp != null
        ? domHelp
        : '<"mx-0 d-flex flex-wrap flex-column flex-sm-row gap-2 py-4 py-sm-0"' +
        '<"d-flex align-items-center me-auto"l>' +
        '<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex flex-sm-row align-items-center justify-content-md-end gap-2 ms-n2 ms-md-2 flex-wrap flex-sm-nowrap"fB>' +
        '>t' +
        '<"row mx-4"' +
        '<"col-sm-12 col-md-6"i>' +
        '<"col-sm-12 col-md-6 pb-3 ps-0"p>' +
        '<"d-flex justify-content-center w-100"r>' +
        '>',
    lengthMenu: lengthMenu,
    displayLength: all ? -1 : lengthMenu?.[0] || 10,
    processing: true,
    serverSide: true,
    responsive: {
      details: {
        display: $.fn.dataTable.Responsive.display.modal({
          header: function (row) {
            var data = row.data();
            var $content = $(data[2]);
            var userName = $content.find('[class^="user-name-full-"]').text();
            return 'Detalles de ' + userName;
          }
        }),
        type: 'column',
        renderer: function (api, rowIdx, columns) {
          var data = $.map(columns, function (col) {
            return col.hidden // Solo mostrar las columnas ocultas
              ? '<tr data-dt-row="' +
              col.rowIndex +
              '" data-dt-column="' +
              col.columnIndex +
              '">' +
              '<td>' + col.title + ':</td> ' +
              '<td>' + col.data + '</td>' +
              '</tr>'
              : '';
          }).join('');

          return data
            ? $('<table class="table"/><tbody />').append(data)
            : false;
        }
      }
    },
    language: {
      processing:
        '<div class="sk-wave mx-auto"><div class="sk-rect sk-wave-rect"></div> <div class="sk-rect sk-wave-rect"></div> <div class="sk-rect sk-wave-rect"></div> <div class="sk-rect sk-wave-rect"></div> <div class="sk-rect sk-wave-rect"></div></div>',
      emptyTable: 'No hay registros para mostrar',
      searchPlaceholder: 'Buscar..',
      search: '',
      lengthMenu: '_MENU_',
      info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
      infoEmpty: 'Mostrando 0 a 0 de 0 registros',
      infoFiltered: '(filtrado de _MAX_ registros totales)',
      paginate: {
        previous: '<',
        next: '>',
        first: 'Primero',
        last: 'Último',
        zeroRecords: 'No se encontraron registros'
      }
    },
    rowReorder: {
      selector: 'td:nth-child(2)'
    }
  };

};

const agregarValidaciones = (valid = {}) => {
  let validators = {};

  if (valid?.required) {
    validators = { ...validators, notEmpty: { message: 'El campo es requerido' } };
  }

  if (valid?.minlength) {
    validators = {
      ...validators,
      stringLength: { min: valid.minlength, message: `El campo debe tener al menos ${valid.minlength} caracteres` }
    };
  }

  if (valid?.maxlength) {
    if (validators.stringLength) {
      validators.stringLength.max = valid.maxlength;
    } else {
      validators = {
        ...validators,
        stringLength: { max: valid.maxlength, message: `El campo no puede tener más de ${valid.maxlength} caracteres` }
      };
    }
  }

  if (valid?.regexp) {
    validators = {
      ...validators,
      regexp: { regexp: valid.regexp, message: valid?.message || `El campo no cumple con el formato requerido` }
    };
  }

  if (valid?.email) {
    validators = { ...validators, emailAddress: { message: `El campo no es un correo válido` } };
  }

  if (valid?.number) {
    validators = { ...validators, numeric: { message: `El campo debe ser un número` } };
  }

  if (valid?.numberMin) {
    validators = {
      ...validators,
      greaterThan: { value: valid.numberMin, message: `El campo debe ser mayor a ${valid.numberMin}` }
    };
  }

  return { validators };
};

const paramsUrl = (url, form, del = '') => {
  let formData = {};
  form.find('input, select, textarea, checkbox, radio').each(function () {
    if ($(this).val() != '') {
      let name = $(this).attr('name')?.replace(del, '');
      let type = $(this).attr('type');

      if (name) {
        if (['checkbox'].includes(type)) {
          formData[name] = $(this).is(':checked');
        } else if (['radio'].includes(type)) {
          if ($(this).is(':checked')) {
            formData[name] = $(this).val();
          }
        } else {
          formData[name] = $(this).val();
        }
      }
    }
  });

  return url + $.param(formData);
};

const postForm = form => {
  let token = $('input[name="__RequestVerificationToken"]').val();

  let formData = {};
  form.find('input, select, textarea, checkbox').each(function () {
    if ($(this).val() != '') {
      let name = $(this).attr('name');
      let type = $(this).attr('type');

      if (name) {
        if (['checkbox', 'radio'].includes(type)) {
          formData[name] = $(this).is(':checked');
        } else {
          formData[name] = $(this).val();
        }
      }
    }
  });

  return formData;
};

const configFormVal = (form, campos, thisEvent = () => { }) => {
  func.selects2(form);

  // limpiar todos los select2
  $(`#${form} .select2`).val(null).trigger('change');

  try {
    FormValidation.formValidation(document.getElementById(form)).destroy();

    $(`#${form}`).trigger('reset');
    Object.keys(campos).forEach(key => {
      $(`#${form}`).find(`[name=${key}]`).removeClass('is-invalid');
      $(`#${form}`).find(`[name=${key}]`).siblings('.dob-picker-format').removeClass('is-invalid');
      $(`#${form}`).find(`[data-field=${key}]`).remove();
      if ($(`#${form}`).find(`[name=${key}]`).hasClass('select2')) {
        $(`#${form}`).find(`[name=${key}]`).val(null).trigger('change');
      }
    });

    FormValidation.formValidation(document.getElementById(form), {
      fields: campos,
      plugins: plugins
    })
      .on('core.form.valid', function (e) {
        thisEvent();
      })
      .on('core.form.invalid', function (e) { })
      .on('core.field.invalid', function (e) {
        let input = $(`#${form} [name=${e}]`);
        if (input.length > 0) {
          if (input[0].classList.contains('dob-picker-format')) {
            $(`#${form} [name=${e}]`).siblings('.dob-picker-format').addClass('is-invalid');
          }
        }
      })
      .on('core.field.valid', function (e) {
        let input = $(`#${form} [name=${e}]`);
        if (input.length > 0) {
          if (input[0].classList.contains('dob-picker-format')) {
            $(`#${form} [name=${e}]`).siblings('.dob-picker-format').removeClass('is-invalid');
          }
        }
      });
  } catch (error) {
    console.log(error);
  }
};

const convertirImageToWebp = file => {
  return new Promise((resolve, reject) => {
    // devolver la base64 de la imagen en webp
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      const img = new Image();
      img.src = reader.result;
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        resolve(canvas.toDataURL('image/webp'));
      };
    };

    reader.onerror = function (error) {
      reject(-1);
    };
  });
};

const func = {
  formatearFechaA: fecha => {
    if ([null, undefined, '', "-"].includes(fecha)) return '';

    let fechaArray = fecha.split(' ');
    let fechaPartes = fechaArray[0].split('-');
    let horaPartes = fechaArray[1].split(':');
    let hora = parseInt(horaPartes[0]);
    let minutos = parseInt(horaPartes[1]);
    let ampm = hora >= 12 ? 'pm' : 'am';
    let hora12 = hora % 12;
    hora12 = hora12 ? hora12 : 12;
    return `${fechaPartes[2]}-${fechaPartes[1]}-${fechaPartes[0]} ${hora12.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')} ${ampm}`;

  },
  getURLParameter: name => {
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
  },
  formatFecha: (fecha, config) => {
    if (["", null, undefined, "-"].includes(fecha)) return "";
    return (!fecha ? '' : moment(fecha).format(config));
  },
  actualizarForm: (form, rowData) => {
    const fechasKeys = ['FEDCN', 'FCRCN', 'FESTDO'];
    Object.keys(rowData).forEach(key => {
      const uppercaseKey = key.toUpperCase();
      if (fechasKeys.includes(uppercaseKey)) {
        if (uppercaseKey === 'FESTDO')
          $(`#${form} [name="${uppercaseKey}"]`).val(func.formatFecha(new Date(), 'DD-MM-YYYY HH:mm a').toString());
        if (uppercaseKey === 'FEDCN')
          $(`#${form} [name="${uppercaseKey}"]`).val(func.formatFecha(rowData[key], 'DD-MM-YYYY HH:mm a').toString());
        if (uppercaseKey === 'FCRCN')
          $(`#${form} [name="${uppercaseKey}"]`).val(func.formatFecha(rowData[key], 'DD-MM-YYYY HH:mm a').toString());
        return;
      } else {
        const value = rowData[key];
        const typeInput = $(`#${form} [name="${uppercaseKey}"]`).attr('type');
        if (uppercaseKey !== 'UEDCN') {
          if (typeInput === 'checkbox') $(`#${form} [name="${uppercaseKey}"]`).prop('checked', value);
          else if (typeInput === 'radio') {
            $(`#${form} [name="${uppercaseKey}"][value="${value}"]`).prop('checked', true);
          } else
            $(`#${form} [name="${uppercaseKey}"]`).val(['undefined', undefined, null].includes(value) ? '' : value);

          try {
            if ($(`#${form} [name="${uppercaseKey}"]`).hasClass('dob-picker')) {
              $(`#${form} [name="${uppercaseKey}"]`).flatpickr({
                value: value
              });
            }
          } catch (error) { }
        } else {
          $(`#${form} [name="${uppercaseKey}"]`).val(['undefined', undefined, null].includes(value) ? '' : value);
        }

        if ($(`#${form} [name="${uppercaseKey}"]`).hasClass('select2')) {
          $(`#${form} [name="${uppercaseKey}"]`).val(value).trigger('change');
        }

        if ($(`#${form} [name="${uppercaseKey}"]`).hasClass('dob-picker-format')) {
          if (!['', null, undefined, '-'].includes(value)) {
            let nuevoValor = value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}:\d{2})/, '$3-$2-$1T$4');
            $(`#${form} [name="${uppercaseKey}"]`)[0]._flatpickr.setDate(nuevoValor);
          }
        }

        if ($(`#${form} [name="${uppercaseKey}"]`).hasClass('flatpickr-timeout')) {
          $(`#${form} [name="${uppercaseKey}"]`).flatpickr({
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            defaultDate: value,
          });
        }

        if ($(`#${form} #${uppercaseKey}`).find('.ql-editor').length > 0) {
          $(`#${form} #${uppercaseKey}`).find('.ql-editor').html(value);
        }
      }

      // actualziar select2
    });
  },
  generateQRCode: async (url, width = 128, margin = 1) => {
    return await new Promise((resolve, reject) => {
      QRCode.toDataURL(url, { width, margin }, function (err, url) {
        if (err) reject(err);
        resolve(url);
      });
    });
  },
  generateChart: async (data, index) => {
    const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const formatLabel = period => {
      const monthIndex = parseInt(period.split('-')[1], 10) - 1;
      return MESES[monthIndex] || period;
    };

    const labels = data.map(item => formatLabel(item.PRDO));
    const values = data.map(item => item.CNSMO);

    const container = document.createElement('div');
    container.style.position = 'absolute'; // Posición absoluta para que no afecte el layout
    container.style.top = '-10000px'; // Fuera de la vista
    container.style.left = '-10000px'; // Fuera de la vista
    container.style.border = '2px solid black';
    container.style.padding = '10px';
    container.style.margin = '10px';
    container.style.width = '800px'; // Ancho en píxeles
    container.style.height = '400px'; // Alto en píxeles
    container.style.overflow = 'hidden'; // Evita que el canvas se desborde

    const canvas = document.createElement('canvas');
    canvas.id = `chart-${index}`;
    canvas.width = 800; // Ancho en píxeles
    canvas.height = 400; // Alto en píxeles
    container.appendChild(canvas);

    document.body.appendChild(container); // Añadir al body para evitar conflictos de CSS

    const baseColor = 'gray';
    const lastBarColor = 'darkgray';
    const backgroundColors = values.map((value, i) => (i === values.length - 1 ? baseColor : lastBarColor));

    const maxValue = Math.max(...values);

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'CNSMO',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: 'black',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: false, // Desactiva la responsividad
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'ULT. CARGOS',
            color: 'black',
            font: {
              size: 24,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 10
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: 'black',
              font: {
                size: 24
              }
            }
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: maxValue,
            ticks: {
              color: 'black',
              font: {
                size: 24
              },
              callback: function (value) {
                return `S/.${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
              }
            }
          }
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Promise(resolve => {
      html2canvas(canvas).then(canvas => {
        const img = canvas.toDataURL('image/png');
        // Limpiar el contenedor después de la conversión
        document.body.removeChild(container);
        resolve(img);
      });
    });
  },
  sumarMeses: meses => {
    let fecha = new Date();
    fecha.setMonth(fecha.getMonth() + meses);
    return moment(fecha).format('YYYY-MM-DD');
  },
  resetAll: (form, all = true) => {
    const fieldsToReset = all
      ? 'input:not(.no-reset), textarea:not(.no-reset), select:not(.no-reset), checkbox:not(.no-reset)'
      : 'input, textarea, select, checkbox';
    $(`${form}`).find(fieldsToReset).val('');
  },
  obtenerCESTDO: (tableName, all = false) => {
    const existe = $(`#${tableName}_filter .radio-buttons #radioGroup_estado`);
    if (existe.length == 0) {
      return all ? '' : 'A';
    }

    return existe.val() || null;
  },
  titleTable: (referencia, array = []) => {
    $(referencia).html('');
    let html = '';
    array.forEach(element => {
      let split = element.split(':') || [];
      if (split.length == 2) {
        html += `<p class="text-lg mb-1"><span class="fw-bold">${split[0]}:</span> ${split[1]}</p>`;
      }
    });
    $(referencia).html(html);
  },
  p: (NOBJTO = null) => {
    let decrypted = CryptoJS.AES.decrypt($('#TK_PRMSS_USER').val(), window.location.pathname).toString(
      CryptoJS.enc.Utf8
    );

    try {
      let data = JSON.parse(decrypted);
      return NOBJTO ? data.find(x => x.NOBJTO === NOBJTO && x.ESTDO == 1) : data;
    } catch (error) {
      return [];
    }
  },
  IDEMPRESA: async () => {
    try {
      return await $("#condominio-actual_select").val() || null;
    } catch (error) {
      return null;
    }
  },
  condominio: () => {
    try {
      let condominioStore = localStorage.getItem('CNDMNIOGBL');
      condominioStore = JSON.parse(condominioStore);
      return condominioStore?.ID || null;
    } catch (error) {
      return null;
    }
  },
  selects2: (formId, bandera = false) => {
    if (!bandera) {
      $(`#${formId} .select2`).select2({
        placeholder: 'Seleccione',
        dropdownParent: $(`#${formId}`)
      });
    }
    else {
      console.log("deleting")
      $(`#${formId} .select2`).select2({
        placeholder: 'Seleccione',
        allowClear: true,
        templateResult: function (data) {
          if (!data.id) { return data.text; }
          return $(`<span>${data.text} <i class="bx bx-trash text-red-500"></i></span>`);
        },
        templateSelection: function (data) {
          if (!data.id) { return data.text; }
          return $(`<span>${data.text} <i class="bx bx-trash text-red-500"></i></span>`);
        }
      });

    }
  },
  limitarCaracteres: () => {
    // LONGITUD CARACTERES
    let inputs = $('input[type="text"].max-length, textarea.max-length');
    inputs.each(function () {
      let max = parseInt($(this).data('maxlength'));
      $(this).on('input', function () {
        let value = $(this).val();
        if (value.length > max) {
          $(this).val(value.substring(0, max));
        }
      });
    });

    let sinEspacios = $('input[type="text"].sin-espacios, textarea.sin-espacios');
    sinEspacios.each(function () {
      $(this).on('input', function () {
        let value = $(this).val();
        if (value.includes(' ')) {
          $(this).val(value.replace(/\s/g, ''));
        }
      });
    });

    // LONGITUD DECIMALES
    // LONGITUD DECIMALES
    let soloDecimales = $('input[type="text"].solo-decimales, textarea.solo-decimales');
    soloDecimales.each(function () {
      let max = parseInt($(this).data('maxlength'));
      $(this).on('input', function () {
        let value = $(this).val();
        value = value.replace(/[^0-9.]/g, '');
        let decimal = value.split('.');
        if (decimal.length > 2) {
          value = decimal[0] + '.' + decimal[1];
        } else if (decimal.length === 2 && decimal[1].length > max) {
          value = decimal[0] + '.' + decimal[1].substring(0, max);
        }

        $(this).val(value);
      });
    });
  },
  llenarcombos: async (url, referencia = [], removeAll = []) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      referencia.forEach(selectRef => {
        const select = $(selectRef);
        select.empty();
        select.append($('<option>').text('- Seleccione -').val(''));
        data.forEach(item => {
          if (removeAll.includes(item.dscrpcn)) return;

          const option = $('<option>').text(item.dscrpcn).val(item.value);
          select.append(option);
        });
      });
    } catch (error) {
      swalFire.error('Ocurrió un error al cargar los datos');
    }
  },
  renderCombos: (GRUPODATOS = null) => {
    if (!GRUPODATOS) return;

    $.ajax({
      url: '/Seguridad/GrupoDato/Index?handler=ObtenerAll',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
      },
      type: 'GET',
      data: {
        GDTOS: GRUPODATOS
      },
      success: function (response) {
        if (response?.data) {
          // todos los selects dentro EditPlantilla AddPlantilla, que no sea CESTDO
          let selects = document.querySelectorAll('select');
          selects = Array.from(selects).filter(select => select.getAttribute('name') != 'CESTDO');

          selects.forEach(select => {
            const name = select.getAttribute('name');
            const data = response.data.filter(d => d.gdpdre == name);
            select.innerHTML = `<option value="">-- Seleccione</option>`;

            if (data.length > 0) {
              data.forEach(d => {
                select.innerHTML += `<option value="${d.vlR1}">${d.dtlle}</option>`;
              });
            }
          });
        }
      },
      error: error => swalFire.error('Ocurrió un error al cargar los módulos')
    });
  },
  actualizarAuditoria: (form, rowData) => {
    // selecconar input y select
    let $inputs = $(`#${form} #auditoria-collapse input, #${form} #auditoria-collapse select`);
    let idRowData = ![undefined, null, ''].includes(rowData?.id);
    let localUsuario = localStorage.getItem('usuario');
    if (localUsuario !== null) {
      localUsuario = JSON.parse(localUsuario);
    } else {
      localUsuario = null;
    }

    $inputs.each(function () {
      let name = $(this).attr('name');
      switch (name) {
        case 'CESTDO':
          $(this).val(idRowData ? rowData[name.toLowerCase()] : 'V');
          break;
        case 'UCRCN':
          $(this).val(idRowData ? rowData[name.toLowerCase()] : localUsuario?.['user']);
          break;
        case 'UEDCN':
          $(this).val(localUsuario?.['user']);
          break;
        case 'FCRCN':
          $(this).val(
            idRowData
              ? func.formatFecha(rowData[name.toLowerCase()], 'DD-MM-YYYY HH:mm:ss a')
              : func.formatFecha(new Date(), 'DD-MM-YYYY HH:mm:ss a')
          );
          break;
        case 'FEDCN':
          $(this).val(func.formatFecha(new Date(), 'DD-MM-YYYY HH:mm:ss a'));
          break;
        case 'FESTDO':
          $(this).val(func.formatFecha(new Date(), 'DD-MM-YYYY HH:mm:ss a'));
          break;
        default:
          break;
      }
    });
  },
  downloadFiles: files => {
    files.forEach(file => {
      $(`${file}`).on('click', function () {
        new Promise((resolve, reject) => {
          swalFire.cargando();
          resolve();
        })
          .then(() => {
            swalFire.success('Descarga exitosa', 'El archivo se ha descargado correctamente');
          })
          .catch(() => {
            swalFire.error('Ocurrió un error al descargar el archivo');
          });
      });
    });
  },
  formatMonto: (monto, moneda = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: moneda
    }).format(monto);
  },
  datepickerListModify: () => {
    const datepickerListModify = document.querySelectorAll('.dob-picker-format');
    datepickerListModify.forEach(function (datepicker) {
      datepicker.placeholder = 'DD-MM-YYYY';
      if (datepicker._flatpickr) {
        datepicker._flatpickr.destroy();
      }

      flatpickr(datepicker, {
        altFormat: 'd-m-Y',
        dateFormat: 'd-m-Y',
        altInput: true,
        allowInput: true,
        disableMobile: true,
        locale: {
          firstDayOfWeek: 1,
          weekdays: {
            shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
            longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
          },
          months: {
            shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            longhand: [
              'Enero',
              'Febrero',
              'Marzo',
              'Abril',
              'Mayo',
              'Junio',
              'Julio',
              'Agosto',
              'Septiembre',
              'Octubre',
              'Noviembre',
              'Diciembre'
            ]
          }
        },
        onClose: function (selectedDates, dateStr, instance) {
          if (dateStr === '') {
            instance.setDate(null);
          }
        }
      });
    });

    const flatpickrTime = document.querySelectorAll('.flatpickr-timeout');
    flatpickrTime.forEach(function (time) {
      flatpickr(time, {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true,
        disableMobile: true
      });
    });
  },
  formatoSolesPEN: monto => {
    if (isNaN(monto)) {
      monto = 0;
    }

    try {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(monto);
    } catch (error) {
      return monto;
    }
  },
  pickCreate: (referencia) => {
    return pickr.create({
      el: referencia,
      theme: 'classic',
      default: '#f6f6f6',
      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          clear: true,
          save: true
        }
      }
    });
  }
};

const createModalImage = src => {
  let modal = document.createElement('div');
  modal.classList.add('modal', 'fade');
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('role', 'dialog');

  let modalDialog = document.createElement('div');
  modalDialog.classList.add('modal-dialog', 'modal-dialog-centered');
  modalDialog.classList.add('modal-xl');
  modalDialog.setAttribute('role', 'document');
  let modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  let modalBody = document.createElement('div');
  modalBody.classList.add('modal-body', 'text-center');
  let image = document.createElement('img');
  image.src = src;
  image.classList.add('img-fluid');
  modalBody.appendChild(image);
  modalContent.appendChild(modalBody);
  modalDialog.appendChild(modalContent);
  modal.appendChild(modalDialog);
  document.body.appendChild(modal);
  $(modal).modal('show');
  $(modal).on('hidden.bs.modal', function () {
    $(this).remove();
  });
};

const fullToolbar = [
  [
    {
      font: []
    },
    {
      size: []
    }
  ],
  ['bold', 'italic', 'underline', 'strike'],
  [
    {
      color: []
    },
    {
      background: []
    }
  ],
  [
    {
      script: 'super'
    },
    {
      script: 'sub'
    }
  ],
  [
    {
      header: '1'
    },
    {
      header: '2'
    },
    'blockquote',
    'code-block'
  ],
  [
    {
      list: 'ordered'
    },
    {
      list: 'bullet'
    },
    {
      indent: '-1'
    },
    {
      indent: '+1'
    }
  ],
  [{ direction: 'rtl' }],
  ['link', 'image', 'video', 'formula'],
  ['clean']
];

const redirect = (isView = false, selector = '', valor) => {
  try {
    const button = document.querySelector(`.nav-tabs button[data-bs-target="#${selector}"]`);
    if (isView && valor) {
      button.removeAttribute('disabled');
      button.click();
    } else {
      button.setAttribute('disabled', 'disabled');
    }
  } catch (error) { }
};

function agregarArchivoADropzone(rutaArchivo, dropzoneInstance) {
  if (!rutaArchivo || !dropzoneInstance) {
    console.error('Se requiere una ruta válida y una instancia de Dropzone.');
    return;
  }

  let filename = 'archivo_' + new Date().getTime() + '.jpg';
  let fileOfBlob = new File([], filename, { type: 'image/jpeg' });
  dropzoneInstance.files.push(fileOfBlob);
  dropzoneInstance.emit('addedfile', fileOfBlob);
  dropzoneInstance.emit('thumbnail', fileOfBlob, '');
  dropzoneInstance.emit('complete', fileOfBlob);

  setTimeout(() => {
    dropzoneInstance.emit('thumbnail', fileOfBlob, rutaArchivo);
    fileOfBlob.dataURL = rutaArchivo;
    fileOfBlob.isExist = true;
  }, 500);
}

function agregarArchivoADropzoneFile(rutaArchivo, dropzoneInstance, formRef) {
  if (!rutaArchivo || !dropzoneInstance) {
    console.error('Se requiere una ruta válida y una instancia de Dropzone.');
    return;
  }

  // agregar archivo es pdf, word, excel
  let filename = rutaArchivo.split('/').pop();
  let fileOfBlob = new File([], filename, { type: 'application/pdf' });

  dropzoneInstance.files.push(fileOfBlob);
  dropzoneInstance.emit('addedfile', fileOfBlob);
  dropzoneInstance.emit('complete', fileOfBlob);

  let preview = $(`#${formRef}`).find('.dz-preview');
  if (preview.length > 0) {
    let download = preview.find('.dz-download');
    if (download.length <= 0) {
      preview.append(`<div
        style="display: flex; justify-content: center; align-items: center; margin: 10px"
        ><a href="${rutaArchivo}" class="dz-download btn btn-primary btn-sm text-white"
        target="_blank"
        download="${filename}">Descargar</a></div>`);
    }

    download.attr('href', rutaArchivo);
  }

  setTimeout(() => {
    fileOfBlob.isExist = true;
  }, 500);
}

const tagsTagify = (referencia, datos) => {
  function tagTemplate(tagData) {
    return `
    <tag title="${tagData.title || tagData.email}"
      contenteditable='false'
      spellcheck='false'
      tabIndex="-1"
      class="${this.settings.classNames.tag} ${tagData.class ? tagData.class : ''}"
      ${this.getAttributes(tagData)}
    >
      <x title='' class='tagify__tag__removeBtn' role='button' aria-label='remove tag'></x>
      <div>
        <div class='tagify__tag__avatar-wrap'>
          <img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
        </div>
        <span class='tagify__tag-text'>${tagData.name}</span>
      </div>
    </tag>
  `;
  }

  function suggestionItemTemplate(tagData) {
    return `
    <div ${this.getAttributes(tagData)}
      class='tagify__dropdown__item align-items-center ${tagData.class ? tagData.class : ''}'
      tabindex="0"
      role="option"
    >
      ${tagData.avatar
        ? `<div class='tagify__dropdown__item__avatar-wrap'>
          <img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
        </div>`
        : ''
      }
      <div class="fw-medium">${tagData.name}</div>
    </div>
  `;
  }

  function dropdownHeaderTemplate(suggestions) {
    return `
        <div class="${this.settings.classNames.dropdownItem} ${this.settings.classNames.dropdownItem}__addAll">
            <strong>${this.value.length ? `Agregar ${suggestions.length} miembros` : 'Todos los miembros'}</strong>
            <span>${suggestions.length} members</span>
        </div>
    `;
  }

  // initialize Tagify on the above input node reference
  let TagifyUserList = new Tagify(referencia, {
    tagTextProp: 'name', // very important since a custom template is used with this property as text. allows typing a "value" or a "name" to match input with whitelist
    enforceWhitelist: true,
    skipInvalid: true, // do not remporarily add invalid tags
    dropdown: {
      closeOnSelect: false,
      enabled: 0,
      classname: 'users-list',
      searchKeys: ['name', 'email'] // very important to set by which keys to search for suggesttions when typing
    },
    templates: {
      tag: tagTemplate,
      dropdownItem: suggestionItemTemplate,
      dropdownHeader: dropdownHeaderTemplate
    },
    whitelist: datos
  });

  // attach events listeners
  TagifyUserList.on('dropdown:select', onSelectSuggestion) // allows selecting all the suggested (whitelist) items
    .on('edit:start', onEditStart); // show custom text in the tag while in edit-mode

  function onSelectSuggestion(e) {
    // custom class from "dropdownHeaderTemplate"
    if (e.detail.elm.classList.contains(`${TagifyUserList.settings.classNames.dropdownItem}__addAll`))
      TagifyUserList.dropdown.selectAll();
  }

  function onEditStart({ detail: { tag, data } }) {
    TagifyUserList.setTagTextNode(tag, `${data.name} <${data.email}>`);
  }
};

let base64toBlob = async (base64, type) => {
  let byteString = await atob(base64);
  let arrayBuffer = await new ArrayBuffer(byteString.length);
  let intArray = await new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  let blob = await new Blob([intArray], { type: type });
  return blob;
};

const convertirMontoATexto = (monto, moneda) => {
  const parteEntera = Math.floor(monto);
  const centavos = Math.round((monto - parteEntera) * 100);

  const textoEntero = numeroATexto(parteEntera);
  const textoMoneda = moneda.toUpperCase().startsWith("SOL")
    ? (parteEntera === 1 ? "SOL" : "SOLES")
    : (parteEntera === 1 ? "DÓLAR" : "DÓLARES");

  const textoCentavos = `CON ${centavos.toString().padStart(2, '0')}/100`;

  return `${textoEntero} ${textoMoneda} ${textoCentavos}`;
};

const numeroATexto = (numero) => {
  const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = {
    10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE",
    15: "QUINCE", 16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
    25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
  };
  const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  if (numero === 0) return "CERO";
  if (numero === 100) return "CIEN";

  let resultado = "";

  if (numero >= 1000000) {
    const millones = Math.floor(numero / 1000000);
    resultado += `${numeroATexto(millones)} MILLÓN${millones > 1 ? "ES" : ""} `;
    numero %= 1000000;
  }
  if (numero >= 1000) {
    const miles = Math.floor(numero / 1000);
    resultado += miles === 1 ? "MIL " : `${numeroATexto(miles)} MIL `;
    numero %= 1000;
  }
  if (numero >= 100) {
    const c = Math.floor(numero / 100);
    resultado += `${centenas[c]} `;
    numero %= 100;
  }

  if (especiales[numero]) {
    resultado += especiales[numero] + " ";
    numero = 0; // ❗ Evitar duplicación
  } else if (numero >= 30) {
    const d = Math.floor(numero / 10);
    resultado += `${decenas[d]} `;
    numero %= 10;
    if (numero > 0) resultado += `Y ${unidades[numero]} `;
  } else if (numero > 0) {
    resultado += `${unidades[numero]} `;
  }

  return resultado.trim();
};

