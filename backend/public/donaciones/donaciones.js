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
    contenedorMensaje.innerHTML = `🐾 Procesando donación de $${montoFinal.toLocaleString('es-AR')}...`;
    contenedorMensaje.classList.remove('hidden');

    // Obtener usuario del localStorage
    const usuarioData = JSON.parse(localStorage.getItem('usuario')) || {};
    const usuario_id = usuarioData.id_usuario || usuarioData.id || 1;

    const datosDonacion = {
        usuario_id,
        monto: montoFinal,
        medio: 'Mercado Pago'
    };

    fetch('http://localhost:3000/api/donaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosDonacion)
    })
    .then(res => res.json())
    .then(data => {
        if (data.donacion || data.mensaje) {
            contenedorMensaje.innerHTML = `✨ ¡Donación registrada! Muchas gracias por colaborar con SOS Mascotas.`;
            console.log('Donación guardada:', data);
        } else {
            throw new Error(data.error);
        }
    })
    .catch(error => {
        contenedorMensaje.innerHTML = `⚠️ Error al guardar donación: ${error.message}. Reintenta.`;
        console.error(error);
    });
}

function copiarAlPortapapeles(idElemento) {
    const textoACopiar = document.getElementById(idElemento).innerText.replace('CBU: ', '').replace('Alias: ', '');
    navigator.clipboard.writeText(textoACopiar).then(() => {
        alert(`¡Copiado al portapapeles!: ${textoACopiar}`);
    });
}