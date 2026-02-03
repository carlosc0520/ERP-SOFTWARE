/**
 * Modern Forms - Mejoras adicionales de UX
 */

(function() {
    'use strict';

    // Función para calcular y actualizar el progreso del formulario
    function updateFormProgress() {
        const totalQuestions = $('.question-card').length;
        if (totalQuestions === 0) return;

        let answeredQuestions = 0;
        
        $('.question-card').each(function() {
            const card = $(this);
            const hasAnswer = checkIfQuestionAnswered(card);
            
            if (hasAnswer) {
                answeredQuestions++;
            }
        });

        const progress = (answeredQuestions / totalQuestions) * 100;
        $('.form-progress-bar').css('width', progress + '%');
        
        if (progress > 0) {
            $('.form-progress').show();
        }
    }

    // Función para verificar si una pregunta ha sido respondida
    function checkIfQuestionAnswered(questionCard) {
        // Radio buttons
        if (questionCard.find('input[type="radio"]:checked').length > 0) {
            return true;
        }
        
        // Checkboxes
        if (questionCard.find('input[type="checkbox"]:checked').length > 0) {
            return true;
        }
        
        // Text inputs
        if (questionCard.find('input[type="text"]').val().trim() !== '') {
            return true;
        }
        
        // Textareas
        if (questionCard.find('textarea').val().trim() !== '') {
            return true;
        }
        
        // Selects
        if (questionCard.find('select').val() !== '' && questionCard.find('select').val() !== null) {
            return true;
        }
        
        // Star ratings
        const starInput = questionCard.find('input[type="hidden"][id*="_valor"]');
        if (starInput.length > 0 && parseFloat(starInput.val()) > 0) {
            return true;
        }
        
        return false;
    }

    // Animación suave al enfocar un input
    function addFocusAnimations() {
        $('.modern-input, .modern-textarea, .modern-select').on('focus', function() {
            $(this).closest('.question-card, .modern-card').addClass('focused');
        }).on('blur', function() {
            $(this).closest('.question-card, .modern-card').removeClass('focused');
        });
    }

    // Validación en tiempo real para campos requeridos
    function addRealtimeValidation() {
        // Validar email en tiempo real
        $('#CORREO').on('blur', function() {
            const email = $(this).val().trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && !emailRegex.test(email)) {
                $(this).addClass('is-invalid');
                if ($(this).next('.invalid-feedback').length === 0) {
                    $(this).after('<div class="invalid-feedback">Por favor, ingresa un correo válido.</div>');
                }
            } else {
                $(this).removeClass('is-invalid');
                $(this).next('.invalid-feedback').remove();
            }
        });

        // Validar campos requeridos
        $('.question-card').each(function() {
            const card = $(this);
            const isRequired = card.find('.modern-label-required').length > 0;
            
            if (isRequired) {
                card.attr('data-required', 'true');
            }
        });
    }

    // Guardar respuestas en localStorage (auto-guardado)
    function enableAutoSave() {
        const formId = window.location.search.match(/IDFORM=([^&]*)/)?.[1] || 'default';
        const storageKey = `form_answers_${formId}`;

        // Cargar respuestas guardadas
        function loadSavedAnswers() {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    const answers = JSON.parse(saved);
                    
                    // Restaurar valores
                    Object.keys(answers).forEach(key => {
                        const element = $(`[name="${key}"]`);
                        if (element.length > 0) {
                            if (element.attr('type') === 'radio' || element.attr('type') === 'checkbox') {
                                element.filter(`[value="${answers[key]}"]`).prop('checked', true);
                            } else {
                                element.val(answers[key]);
                            }
                        }
                    });
                    
                    console.log('Respuestas restauradas desde auto-guardado');
                }
                catch (e) {
                    console.error('Error al cargar respuestas guardadas:', e);
                }
            }
        }

        // Guardar respuestas
        function saveAnswers() {
            const answers = {};
            
            // Recopilar todas las respuestas
            $('.question-card').each(function() {
                const card = $(this);
                
                // Inputs de texto
                card.find('input[type="text"], textarea').each(function() {
                    const input = $(this);
                    if (input.val().trim() !== '') {
                        answers[input.attr('name')] = input.val();
                    }
                });
                
                // Radio buttons
                card.find('input[type="radio"]:checked').each(function() {
                    const radio = $(this);
                    answers[radio.attr('name')] = radio.val();
                });
                
                // Checkboxes
                card.find('input[type="checkbox"]:checked').each(function() {
                    const checkbox = $(this);
                    const name = checkbox.attr('name');
                    if (!answers[name]) {
                        answers[name] = [];
                    }
                    answers[name].push(checkbox.val());
                });
                
                // Selects
                card.find('select').each(function() {
                    const select = $(this);
                    if (select.val() !== '' && select.val() !== null) {
                        answers[select.attr('name')] = select.val();
                    }
                });
            });
            
            // Guardar correo y nombre
            const correo = $('#CORREO').val();
            const nombre = $('#NOMBRE_USUARIO').val();
            if (correo) answers['CORREO'] = correo;
            if (nombre) answers['NOMBRE_USUARIO'] = nombre;
            
            localStorage.setItem(storageKey, JSON.stringify(answers));
        }

        // Cargar respuestas al iniciar
        setTimeout(loadSavedAnswers, 500);

        // Guardar cada vez que cambia algo (con debounce)
        let saveTimeout;
        $(document).on('input change', '.question-card input, .question-card textarea, .question-card select, #CORREO, #NOMBRE_USUARIO', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveAnswers, 1000);
            updateFormProgress();
        });

        // Limpiar al enviar el formulario
        $('#btnGuardar').on('click', function() {
            localStorage.removeItem(storageKey);
        });
    }

    // Smooth scroll a la siguiente pregunta sin responder
    function addNavigationHelpers() {
        // Crear botón de ayuda (opcional)
        const helpButton = $(`
            <button type="button" class="btn btn-sm btn-outline-primary" id="btnNextUnanswered" 
                    style="position: fixed; bottom: 80px; right: 20px; z-index: 1000; border-radius: 50%; 
                           width: 50px; height: 50px; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <i class="bi bi-arrow-down"></i>
            </button>
        `);
        
        $('body').append(helpButton);

        // Mostrar botón si hay preguntas sin responder
        $(document).on('input change', '.question-card input, .question-card textarea, .question-card select', function() {
            const unanswered = $('.question-card').filter(function() {
                return !checkIfQuestionAnswered($(this));
            });
            
            if (unanswered.length > 0) {
                $('#btnNextUnanswered').show();
            } else {
                $('#btnNextUnanswered').hide();
            }
        });

        // Scroll a la siguiente pregunta sin responder
        $('#btnNextUnanswered').on('click', function() {
            const unanswered = $('.question-card').filter(function() {
                return !checkIfQuestionAnswered($(this));
            });
            
            if (unanswered.length > 0) {
                $('html, body').animate({
                    scrollTop: unanswered.first().offset().top - 100
                }, 500);
                
                // Hacer focus en el primer input de esa pregunta
                setTimeout(() => {
                    unanswered.first().find('input, textarea, select').first().focus();
                }, 500);
            }
        });
    }

    // Agregar tooltips informativos
    function addTooltips() {
        // Agregar tooltip al botón de enviar si hay campos requeridos sin llenar
        $('#btnGuardar').on('mouseenter', function() {
            const requiredCards = $('.question-card[data-required="true"]');
            const unanswered = requiredCards.filter(function() {
                return !checkIfQuestionAnswered($(this));
            });
            
            if (unanswered.length > 0) {
                $(this).attr('title', `Faltan ${unanswered.length} pregunta(s) requerida(s)`);
            }
        });
    }

    // Animación de éxito al completar todas las preguntas
    function showCompletionAnimation() {
        $(document).on('input change', '.question-card input, .question-card textarea, .question-card select', function() {
            const totalQuestions = $('.question-card').length;
            const answeredQuestions = $('.question-card').filter(function() {
                return checkIfQuestionAnswered($(this));
            }).length;
            
            if (totalQuestions > 0 && answeredQuestions === totalQuestions) {
                // Mostrar mensaje de éxito
                if ($('.completion-message').length === 0) {
                    const message = $(`
                        <div class="completion-message success-message fade-in" style="position: sticky; top: 20px; z-index: 100;">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            ¡Excelente! Has completado todas las preguntas. Ahora puedes enviar el formulario.
                        </div>
                    `);
                    $('#preguntas-container').before(message);
                    
                    // Scroll al botón de enviar
                    setTimeout(() => {
                        $('html, body').animate({
                            scrollTop: $('#btnGuardar').offset().top - 200
                        }, 500);
                    }, 1000);
                }
            } else {
                $('.completion-message').remove();
            }
        });
    }

    // Inicializar todas las mejoras cuando el documento esté listo
    $(document).ready(function() {
        // Esperar un momento para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
            addFocusAnimations();
            addRealtimeValidation();
            enableAutoSave();
            addNavigationHelpers();
            addTooltips();
            showCompletionAnimation();
            updateFormProgress();
        }, 500);
    });

})();
