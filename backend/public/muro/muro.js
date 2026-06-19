const API_URL = 'http://localhost:3000/api/mascotas';

document.addEventListener('DOMContentLoaded', () => {
    fetchMascotas();
    document.getElementById('btn-buscar').addEventListener('click', aplicarFiltros);
});

async function fetchMascotas(queryParams = '') {
    const muroContainer = document.getElementById('muro-mascotas');
    muroContainer.innerHTML = '<p class="loading">Buscando peluditos en el simulador...</p>';

    try {
        const response = await fetch(`${API_URL}${queryParams}`);
        if (!response.ok) throw new Error('Error al conectar con la API.');

        const data = await response.json();
        // El backend responde con un objeto que contiene el array en la propiedad 'mascotas' o directo el array
        const listaMascotas = data.mascotas || data;
        renderMascotas(listaMascotas);
    } catch (error) {
        console.error(error);
        muroContainer.innerHTML = `
            <div class="error-box">
                <p>⚠️ No se pudieron sincronizar las mascotas con el servidor.</p>
                <small>Verificá que el backend esté corriendo en el puerto 3000 o activa CORS.</small>
            </div>`;
    }
}

function renderMascotas(listaMascotas) {
    const muroContainer = document.getElementById('muro-mascotas');
    muroContainer.innerHTML = '';

    if (!listaMascotas || listaMascotas.length === 0) {
        muroContainer.innerHTML = '<p class="no-results">No se encontraron mascotas con esos filtros</p>';
        return;
    }

    listaMascotas.forEach(mascota => {
        const card = document.createElement('div');
        card.classList.add('card-mascota');

        // Mapeo adaptado exacto a los nombres de propiedades del seeder
        card.innerHTML = `
            <div class="wrapper-imagen">
                <img src="${mascota.fotos && mascota.fotos[0] ? mascota.fotos[0] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600'}" alt="${mascota.nombre}">
            </div>
            <div class="info-mascota">
                <div class="info-header">
                    <h3>${mascota.nombre}</h3>
                    <span class="huella-btn">🐾</span>
                </div>
                <p class="detalles-p"><strong>Especie:</strong> ${mascota.especie} | <strong>Sexo:</strong> ${mascota.sexo || 'No especificado'}</p>
                <p class="detalles-p"><strong>Tamaño:</strong> ${mascota.tamanio || 'Mediano'}</p>
                <p class="detalles-p"><strong>Edad estimada:</strong> ${mascota.edad_estimada || 'N/A'}</p>
                <button class="btn-primary" onclick="postularAdopcion(${mascota.id_mascota})">Postular Adopción</button>
            </div>
        `;
        muroContainer.appendChild(card);
    });
}

function aplicarFiltros() {
    const especie = document.getElementById('filter-especie').value;
    const tamanio = document.getElementById('filter-tamanio').value;

    const queryParams = new URLSearchParams();
    if (especie) queryParams.append('especie', especie);
    if (tamanio) queryParams.append('tamanio', tamanio); // Cambiado a 'tamanio' igual que el controlador backend

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    fetchMascotas(queryString);
}

async function postularAdopcion(idMascota) {
    // 1. Validamos de forma real si el usuario está en el LocalStorage
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));

    if (!usuarioGuardado) {
        alert("Debes estar logueado como adoptante para postularte.");
        // Redireccionar al login si no está logueada
        window.location.href = '../auth/index.html'; 
        return;
    }

    // 2. Apuntamos al endpoint real de Express
    const urlAdoptar = 'http://localhost:3000/api/adopciones/postular';
    
    try {
        const response = await fetch(urlAdoptar, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_usuario: usuarioGuardado.id_usuario, // Pasamos el ID real de la sesión
                id_mascota: idMascota                 // Pasamos el ID del animal seleccionado
            })
        });

        const resultado = await response.json();

        if (response.ok) {
            alert(`¡Postulación Exitosa!\n${resultado.mensaje || 'Tu solicitud fue recibida.'}`);
        } else {
            alert(`Validación del Servidor:\n${resultado.error || 'No se pudo procesar.'}`);
        }
    } catch (error) {
        console.error("Error en la postulación:", error);
        alert('Error en la red al enviar la solicitud.');
    }
}