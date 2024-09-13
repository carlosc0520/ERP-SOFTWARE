const executeView = () => {
  const uisApis = {
    API: '/Comercial/Plantillas/proveedoresRGPD/Index?handler'
  };

  let meses = [
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
  ];

  const globalCrud = {
    init: () => {
      const wizardModern = document.querySelector('.wizard-modern-example'),
        wizardModernBtnNextList = [].slice.call(wizardModern.querySelectorAll('.btn-next')),
        wizardModernBtnPrevList = [].slice.call(wizardModern.querySelectorAll('.btn-prev')),
        wizardModernBtnSubmit = wizardModern.querySelector('.btn-submit');
      if (typeof wizardModern !== undefined && wizardModern !== null) {
        const modernStepper = new Stepper(wizardModern, {
          linear: false
        });
        if (wizardModernBtnNextList) {
          wizardModernBtnNextList.forEach(wizardModernBtnNext => {
            wizardModernBtnNext.addEventListener('click', event => {
              modernStepper.next();
            });
          });
        }
        if (wizardModernBtnPrevList) {
          wizardModernBtnPrevList.forEach(wizardModernBtnPrev => {
            wizardModernBtnPrev.addEventListener('click', event => {
              modernStepper.previous();
            });
          });
        }
        if (wizardModernBtnSubmit) {
          wizardModernBtnSubmit.addEventListener('click', event => {
            alert('Submitted..!!');
          });
        }
      }
    }
  };

  const plantillasCrud = {
    init: () => {},

    globales: () => {

      configFormVal('formPlantillaProveedor', plantillasCrud.validaciones.GENERATE, () =>
        plantillasCrud.eventos.GENERATEDOCUMENTO()
      );

      $("#limpiar1").on('click', function (e) {
        e.preventDefault();
        plantillasCrud.eventos.LIMPIAR();
      });
      $("#limpiar2").on('click', function (e) {
        e.preventDefault();
        plantillasCrud.eventos.LIMPIAR();
      });
      $("#limpiar3").on('click', function (e) {
        e.preventDefault();
        plantillasCrud.eventos.LIMPIAR();
      });
      $("#limpiar4").on('click', function (e) {
        e.preventDefault();
        plantillasCrud.eventos.LIMPIAR();
      });
      $("#limpiar5").on('click', function (e) {
        e.preventDefault();
        plantillasCrud.eventos.LIMPIAR();
      });

    },  
    eventos: {
      GENERATEDOCUMENTO: async () => {
        let formData = new FormData();
        let fecha = new Date();
        formData.append('UBICATION', 'Barcelona');
        formData.append('DAY', fecha.getDate().toString());
        formData.append('ONTH', meses[fecha.getMonth()]);
        formData.append('YEAR', fecha.getFullYear().toString());
        formData.append('AFF', $('#IDENT').val() || 'D.');
        formData.append('USERNAME', $('#USERNAME').val() || '--------');
        formData.append('NAF', $('#NIF').val() || '--------');
        formData.append('RZNSCL', $('#RZNSCL').val() || '--------');
        formData.append('AFAF', $('#CIF').val() || '--------');
        formData.append('DALE', $('#CDAD').val() || '--------');
        formData.append('DALA', $('#DRCCN').val() || '--------');
        formData.append('NUMI', $('#NMRO').val() || '--------');
        formData.append('NOMBRES', $('#NOMBRES').val() || '--------');
        formData.append('CORREO', $('#CRRO').val() || '--------');
        formData.append('MOVIL', $('#TLFNO').val() || '--------');

        let tableTratamientos = $('#tableTratamientos')[0];
        let inputsChecks = tableTratamientos.querySelectorAll('input[type="checkbox"]');
        let tratamientos = {};
        inputsChecks.forEach(input => {
          tratamientos[input.id] = input.checked ? 'X' : '';
        });
        formData.append('STAPLICABLE', JSON.stringify(tratamientos));


        let tableTratamientosInteresados = $('#tableTratamientosInteresado')[0];
        let inputsChecksInteresados = tableTratamientosInteresados.querySelectorAll('input[type="checkbox"]');
        let tratamientosInteresados = {};
        inputsChecksInteresados.forEach(input => {
          tratamientosInteresados[input.id] = input.checked ? 'X' : '';
        });
        formData.append('STINTERESADO', JSON.stringify(tratamientosInteresados));

        let tableTratamientosInterno = $('#tableTratamientosInterno')[0];
        let inputsChecksInterno = tableTratamientosInterno.querySelectorAll('input[type="checkbox"]');
        let tratamientosInterno = {};
        inputsChecksInterno.forEach(input => {
          tratamientosInterno[input.id] = input.checked ? 'X' : '';
        });
        formData.append('STTRANSFERENCIA', JSON.stringify(tratamientosInterno));


        let tableSubEncargados = $('#tableSubEncargados')[0];
        let inputsChecksSubEncargados = tableSubEncargados.querySelectorAll('input[type="text"]');
        let subEncargados = {};
        inputsChecksSubEncargados.forEach(input => {
          subEncargados[input.id] = input.value || '';
        });
        formData.append('STTRATAMIENTO', JSON.stringify(subEncargados));

        swalFire.cargando();
        $.ajax({
          url: uisApis.API + '=GenerateDocument',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('XSRF-TOKEN', localStorage.getItem('accessToken'));
          },
          type: 'POST',
          dataType: 'json',
          contentType: false,
          processData: false,
          data: formData,
          success: data => {
            let nombre = `Compromiso RGPD_${$('#RZNSCL').val() || ""}_${fecha.getFullYear()}${fecha.getMonth()}${fecha.getDate()}.docx`;

            if(data.base64Word){
              var link = document.createElement('a');
              link.href = 'data:application/octet-stream;base64,' + data.base64Word;
              link.download = nombre || 'Compromiso RGPD.docx';
              link.click();
              return;
            }

            swalFire.error('Error al generar el documento');

          },
          error: error => swalFire.error('Error al generar el documento'),
          complete: () => swalFire.cerrar()
        });

      },
      LIMPIAR: () => {
        $('#formPlantillaProveedor')[0].reset();

        $('#tableTratamientos')[0].querySelectorAll('input[type="checkbox"]').forEach(input => {
          input.checked = false;
        });
        $('#tableTratamientosInteresado')[0].querySelectorAll('input[type="checkbox"]').forEach(input => {
          input.checked = false;
        });
        $('#tableTratamientosInterno')[0].querySelectorAll('input[type="checkbox"]').forEach(input => {
          input.checked = false;
        });
        $('#tableSubEncargados')[0].querySelectorAll('input[type="text"]').forEach(input => {
          input.value = '';
        });
      },
      LOADIMAGE: src => {
        return new Promise((resolve, reject) => {
          let img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      },
      CONFIGTEXT: (
        doc,
        text = '',
        size = 11,
        font = 'Calibri',
        bold = false,
        italic = false,
        x = 10,
        y = 10,
        centrarH = false,
        maxWidth = 180,
        justify = false
      ) => {
        doc.setFont(font, bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal');
        doc.setFontSize(size);

        let lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line, i) => {
          if (justify && i < lines.length - 1) {
            let words = line.split(' ');
            let spaceWidth =
              (maxWidth - (doc.getStringUnitWidth(line) * size) / doc.internal.scaleFactor) / (words.length - 1);
            let justifiedText = '';
            words.forEach((word, index) => {
              if (index > 0)
                justifiedText += ' '.repeat(Math.ceil((spaceWidth * doc.internal.scaleFactor) / size)) + word;
              else justifiedText += word;
            });
            doc.text(justifiedText, x, y + i * size * 1.2);
          } else {
            doc.text(line, x, y + i * size * 1.2);
          }
        });
      }
    },
    validaciones: {
      GENERATE: {
        IDENT: agregarValidaciones({
          required: true
        }),
        USERNAME: agregarValidaciones({
          required: true
        }),
        NIF: agregarValidaciones({
          required: true
        }),
        RZNSCL: agregarValidaciones({
          required: true
        }),
        CIF: agregarValidaciones({
          required: true
        }),
        CDAD: agregarValidaciones({
          required: true
        }),
        DRCCN: agregarValidaciones({
          required: true
        }),
        NMRO: agregarValidaciones({
          required: true
        }),
        NOMBRES: agregarValidaciones({
          required: true
        }),
        CRRO: agregarValidaciones({
          required: true,
          regexp:  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        }),
        TLFNO: agregarValidaciones({
          required: true
        }),
      }
    }
  };

  return {
    init: () => {
      plantillasCrud.init();
      plantillasCrud.globales();

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
