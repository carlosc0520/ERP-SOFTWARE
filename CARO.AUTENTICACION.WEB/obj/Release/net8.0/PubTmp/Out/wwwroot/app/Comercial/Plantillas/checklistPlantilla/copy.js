const executeView = () => {
  const uisApis = {
    API: '/Comercial/Plantillas/proveedoresRGPD/Index?handler'
  };

  let myDropzone = null;

  const globalCrud = {
    init: () => {
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

      const dropzoneBasic = document.querySelector('#dropzone-basic');
      if (dropzoneBasic) {
        myDropzone = new Dropzone(dropzoneBasic, {
          previewTemplate: previewTemplate('Imagen'),
          parallelUploads: 1,
          maxFilesize: 1,
          acceptedFiles: '.jpg,.jpeg,.png,.gif',
          addRemoveLinks: true,
          maxFiles: 1,
          init: function () {
            this.on('addedfile', function (file) {
              if (this.files.length > 1) {
                this.removeFile(this.files[0]);
              }
            });
          }
        });
      }
    }
  };

  const plantillasCrud = {
    init: () => {},

    globales: () => {
      $('#generate-pdf').on('click', function () {
        plantillasCrud.eventos.GENERATEDOCUMENTO();
      });

      $("#clear").on("click", function () {
        myDropzone.removeAllFiles(true);
        $('#TITLE').val('');
        $('#LINK').val('');
        $('#NDOC').val('');
        $('.form-repeater [data=form-control-repeater]').each((index, element) => {
          $(element).val('');
        });

        let formRepeater = $('div [data-repeater-item]');
        formRepeater.each((index, element) => {
          if (index > 0) $(element).remove();
        });
      });
    },
    eventos: {
      GENERATEDOCUMENTO: async () => {
        // // validar que vea una imagen
        let file = myDropzone.files[0];
        let title = $('#TITLE').val();
        let link = $('#LINK').val();

        if (myDropzone.files.length === 0) return swalFire.error('Debe seleccionar una imagen');
        if (!$('#TITLE').val()) return swalFire.error('Debe ingresar un título');

        const formRepeater = $('.form-repeater [data=form-control-repeater]');
        const data = [];
        formRepeater.each((index, element) => {
          if ($(element).val()) data.push($(element).val());
        });

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Agregar imagen arriba centrado
        let dataURL = file.dataURL;

        // Dimensiones del documento A4
        const docWidth = doc.internal.pageSize.width;

        // Dimensiones de la imagen
        const imgWidth = 65; // en mm
        const imgHeight = 25; // en mm

        // Calcular posición para centrar horizontalmente
        const xPosition = (docWidth - imgWidth) / 2;
        const yPosition = 10; // posición vertical desde arriba

        const marginLeft = 15;
        const marginRight = 15;
        const tableWidth = docWidth - marginLeft - marginRight;

        const tableYPosition = yPosition + imgHeight + 10;
        const columnWidths = [10, 130, 20, 20];

        var { CheckBox, RadioButton, Appearance } = jsPDF.API.AcroForm;

        doc.autoTable({
          head: [['N°', title || 'Elementos de Seguridad', 'Si', 'No']],
          body: data.map((item, index) => {
            return [index + 1, item, '', ''];
          }),
          columnStyles: {
            0: { cellWidth: columnWidths[0] },
            1: { cellWidth: columnWidths[1] },
            2: { cellWidth: columnWidths[2] },
            3: { cellWidth: columnWidths[3] }
          },
          tableWidth: tableWidth,
          theme: 'grid',
          headStyles: {
            fillColor: [150, 150, 150],
            textColor: [255, 255, 255],
            halign: 'center',
            valign: 'middle',
            fontSize: 13,
            fontStyle: 'bold',
            font: 'Arial MT'
          },
          margin: { top: tableYPosition, left: marginLeft, right: marginRight },
          startY: tableYPosition,
          showHead: 'firstPage',
          showFoot: 'never',
          willDrawCell: function (data) {
            if (data.section !== 'head' && data.column.index == 3) {
              let radioGroupName = `radioGroup${data.row.index}`;
              let radioGroup = new RadioButton();
              radioGroup.value = radioGroupName;
              radioGroup.Subtype = 'Form';
              radioGroup.fillColor = 'black';
              doc.addField(radioGroup);

              let radioButtonSi = radioGroup.createOption('Si');
              radioButtonSi.Rect = [data.cell.x - 15, data.cell.y + 0.5, 10, 6];
              radioGroup.setAppearance(Appearance.RadioButton.Cross);
              radioButtonSi.fillColor = 'black';

              let radioButtonNo = radioGroup.createOption('No');
              radioButtonNo.Rect = [data.cell.x + 5, data.cell.y + 0.5, 10, 6];
              radioGroup.setAppearance(Appearance.RadioButton.Cross);
            }
          }
        });

        // ITERAR TODAS LAS PAGINAS
        for (let i = 1; i <= doc.getNumberOfPages(); i++) {
          doc.setPage(i);
          // Agregar imagen al PDF
          if (dataURL) {
            doc.addImage(dataURL, 'JPEG', xPosition, yPosition, imgWidth, imgHeight);
          }

          // Agregar un enlace invisible sobre la imagen
          if (link) doc.link(xPosition, yPosition, imgWidth, imgHeight, { url: link });
        }

        let nombre = $('#NDOC').val() || 'documento';
        doc.save(`${nombre}.pdf`);
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
        // Establecer la fuente y el tamaño
        doc.setFont(font, bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal');
        doc.setFontSize(size);

        // Dividir el texto si se excede el ancho máximo
        let lines = doc.splitTextToSize(text, maxWidth);

        // Dibujar cada línea
        lines.forEach((line, i) => {
          if (justify && i < lines.length - 1) {
            // Justificar todas las líneas excepto la última
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
        TITLE: agregarValidaciones({
          required: true
        })
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
