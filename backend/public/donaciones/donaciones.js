let montoFinal = 0;

document.addEventListener('DOMContentLoaded', () => {
    configurarSelectorMontos();
});

function configurarSelectorMontos() {
    const botonesFijos = document.querySelectorAll('.btn-monto:not(#btn-monto-personalizado)');
    const btnOtroMonto = document.getElementById('btn-monto-personalizado');
    const contenedorCustom = document.getElementById('custom-monto-container');
    const inputCustom = document.getElementById('input-monto-personalizado');
    const btnEjecutar = document.getElementById('btn-procesar-donacion');

    botonesFijos.forEach(boton => {
        boton.addEventListener('click', (e) => {
            botonesFijos.forEach(b => b.classList.remove('selected'));
            btnOtroMonto.classList.remove('selected');
            contenedorCustom.classList.add('hidden');

            e.target.classList.add('selected');
            montoFinal = parseInt(e.target.dataset.monto);
            actualizarBotonEstado(btnEjecutar, montoFinal);
        });
    });

    btnOtroMonto.addEventListener('click', (e) => {
        botonesFijos.forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        contenedorCustom.classList.remove('hidden');
        inputCustom.focus();
        
        montoFinal = parseInt(inputCustom.value) || 0;
        actualizarBotonEstado(btnEjecutar, montoFinal);
    });

    inputCustom.addEventListener('input', (e) => {
        montoFinal = parseInt(e.target.value) || 0;
        actualizarBotonEstado(btnEjecutar, montoFinal);
    });

    btnEjecutar.addEventListener('click', enviarDonacion);
}

function actualizarBotonEstado(boton, monto) {
    if (monto >= 100) {
        boton.disabled = false;
        boton.textContent = `Donar $${monto.toLocaleString('es-AR')} con Mercado Pago 💳`;
    } else {
        boton.disabled = true;
        boton.textContent = `Monto mínimo $100`;
    }
}

function enviarDonacion() {
    const contenedorMensaje = document.getElementById('donacion-mensaje');
    contenedorMensaje.innerHTML = `🐾 Conectando con Mercado Pago para procesar tus <strong>$${montoFinal.toLocaleString('es-AR')}</strong>...`;
    contenedorMensaje.classList.remove('hidden');

    setTimeout(() => {
        contenedorMensaje.innerHTML = `✨ ¡Simulación de pago exitosa! Muchas gracias por colaborar con SOS Mascotas.`;
    }, 2500);
}

function copiarAlPortapapeles(idElemento) {
    const textoACopiar = document.getElementById(idElemento).innerText.replace('CBU: ', '').replace('Alias: ', '');
    navigator.clipboard.writeText(textoACopiar).then(() => {
        alert(`¡Copiado al portapapeles!: ${textoACopiar}`);
    });
}