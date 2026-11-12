/**
 * ==============================================================================
 * PORTAFOLIO PROFESIONAL - RICHARD CORNEJO (@eldelar_)
 * Ingeniero de Software con Inteligencia Artificial & Full Stack
 * 
 * Script principal:
 * 1. Simulación WebGL Navier-Stokes de Fluidos con la librería webgl-fluid por CDN.
 * 2. Alternador interactivo de vistas ("spiral" / "list") con persistencia.
 * 3. Efecto de inclinación 3D suave (Tilt & Parallax) en tarjetas de proyectos.
 * 4. Copiado de correo al portapapeles con notificación Toast flotante.
 * ==============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización ordenada de módulos
    inicializarSimulacionFluidos();
    inicializarAlternadorVistas();
    inicializarEfectoTiltTarjetas();
    inicializarCopiadoCorreo();
});

/* ==============================================================================
   1. SIMULACIÓN DE FLUIDOS EN WEBGL CON LIBRERÍA EXTERNA WEBGL-FLUID
   Verificación robusta mediante bucle de sondeo para asegurar que la librería
   esté completamente cargada antes de inicializar sobre #fluid-canvas.
   ============================================================================== */
function inicializarSimulacionFluidos() {
    function intentarCarga() {
        if (typeof window.WebGLFluid === 'function') {
            const canvas = document.getElementById('fluid-canvas');
            if (canvas) {
                window.WebGLFluid(canvas, {
                    TRIGGER: 'hover',
                    SIM_RESOLUTION: 128,
                    DYE_RESOLUTION: 1024,
                    DENSITY_DISSIPATION: 2.5,
                    VELOCITY_DISSIPATION: 0.3,
                    CURL: 25,
                    SPLAT_RADIUS: 0.25,
                    SHADING: true,
                    COLORFUL: true,
                    TRANSPARENT: true
                });
                return true;
            }
        }
        return false;
    }

    // Si ya está disponible de inmediato, la ejecuta; de lo contrario, sondea periódicamente
    if (!intentarCarga()) {
        const intervaloVerificacion = setInterval(() => {
            if (intentarCarga()) {
                clearInterval(intervaloVerificacion);
            }
        }, 50);
    }
}

/* ==============================================================================
   2. ALTERNADOR DE VISTAS ("SPIRAL" / "LIST")
   Permite alternar entre la galería flotante con ritmo 3D y la lista minimalista.
   ============================================================================== */
function inicializarAlternadorVistas() {
    const btnSpiral = document.getElementById('btn-vista-spiral');
    const btnList = document.getElementById('btn-vista-list');
    const contenedorGaleria = document.getElementById('galeria-proyectos');
    const pistaTexto = document.getElementById('texto-pista-interaccion');

    if (!btnSpiral || !btnList || !contenedorGaleria) return;

    function activarVista(modo) {
        if (modo === 'spiral') {
            contenedorGaleria.classList.remove('vista-list');
            contenedorGaleria.classList.add('vista-spiral');

            btnSpiral.classList.add('activo');
            btnSpiral.setAttribute('aria-pressed', 'true');
            btnList.classList.remove('activo');
            btnList.setAttribute('aria-pressed', 'false');

            if (pistaTexto) {
                pistaTexto.textContent = 'Mueve el cursor sobre la pantalla para activar el fluido y la inclinación 3D';
            }
        } else {
            contenedorGaleria.classList.remove('vista-spiral');
            contenedorGaleria.classList.add('vista-list');

            btnList.classList.add('activo');
            btnList.setAttribute('aria-pressed', 'true');
            btnSpiral.classList.remove('activo');
            btnSpiral.setAttribute('aria-pressed', 'false');

            if (pistaTexto) {
                pistaTexto.textContent = 'Modo lista compacto: visualización técnica y estructurada';
            }
        }

        // Guardar preferencia del usuario en localStorage
        try {
            localStorage.setItem('eldelar_portfolio_vista', modo);
        } catch (_) {}
    }

    btnSpiral.addEventListener('click', () => activarVista('spiral'));
    btnList.addEventListener('click', () => activarVista('list'));

    // Recuperar preferencia previa si existe
    try {
        const vistaGuardada = localStorage.getItem('eldelar_portfolio_vista');
        if (vistaGuardada === 'list' || vistaGuardada === 'spiral') {
            activarVista(vistaGuardada);
        }
    } catch (_) {}
}

/* ==============================================================================
   3. EFECTO DE INCLINACIÓN 3D SUAVE (TILT & PARALLAX) EN TARJETAS
   Genera una sensación de profundidad física al interactuar con el mouse.
   ============================================================================== */
function inicializarEfectoTiltTarjetas() {
    const tarjetas = document.querySelectorAll('.tarjeta-proyecto');
    const contenedor = document.getElementById('galeria-proyectos');

    tarjetas.forEach(tarjeta => {
        // Seguimiento suave de la posición del cursor sobre la tarjeta
        tarjeta.addEventListener('mousemove', (e) => {
            // Solo aplicar inclinación 3D en modo spiral
            if (contenedor && contenedor.classList.contains('vista-list')) {
                tarjeta.style.transform = '';
                return;
            }

            const rect = tarjeta.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Actualizar variables CSS para el resplandor de borde reactivo
            tarjeta.style.setProperty('--mouse-x', `${x}px`);
            tarjeta.style.setProperty('--mouse-y', `${y}px`);

            // Cálculo de ángulos de inclinación (rango sutil de ±7 grados)
            const centroX = rect.width / 2;
            const centroY = rect.height / 2;
            const rotacionX = ((y - centroY) / centroY) * -6.5;
            const rotacionY = ((x - centroX) / centroX) * 6.5;

            tarjeta.style.transform = `perspective(1000px) rotateX(${rotacionX.toFixed(2)}deg) rotateY(${rotacionY.toFixed(2)}deg) translateZ(10px)`;
        });

        // Restaurar posición natural al salir
        tarjeta.addEventListener('mouseleave', () => {
            tarjeta.style.transform = '';
        });
    });
}

/* ==============================================================================
   4. FUNCIÓN PARA COPIAR CORREO AL PORTAPAPELES CON NOTIFICACIÓN TOAST
   ============================================================================== */
function inicializarCopiadoCorreo() {
    const botonesCopiar = document.querySelectorAll('.btn-copiar-trigger');
    const toast = document.getElementById('toast-notificacion');
    const toastMensaje = document.getElementById('toast-mensaje');
    let timeoutToast = null;

    if (!toast) return;

    function mostrarToast(mensaje) {
        if (toastMensaje) {
            toastMensaje.textContent = mensaje;
        }

        toast.classList.add('activo');

        if (timeoutToast) clearTimeout(timeoutToast);
        timeoutToast = setTimeout(() => {
            toast.classList.remove('activo');
        }, 3400);
    }

    botonesCopiar.forEach(boton => {
        boton.addEventListener('click', async (e) => {
            e.preventDefault();
            const correo = boton.getAttribute('data-correo') || 'eldelar.dev@gmail.com';

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(correo);
                } else {
                    // Fallback para navegadores antiguos
                    const inputTemp = document.createElement('textarea');
                    inputTemp.value = correo;
                    inputTemp.style.position = 'fixed';
                    inputTemp.style.opacity = '0';
                    document.body.appendChild(inputTemp);
                    inputTemp.select();
                    document.execCommand('copy');
                    document.body.removeChild(inputTemp);
                }

                mostrarToast(`¡Correo copiado: ${correo}!`);

                // Efecto visual momentáneo en el botón pulsado
                boton.style.transform = 'scale(0.96)';
                setTimeout(() => {
                    boton.style.transform = '';
                }, 180);

            } catch (err) {
                console.error('Error al copiar correo:', err);
                mostrarToast(`Correo: ${correo}`);
            }
        });
    });
}
