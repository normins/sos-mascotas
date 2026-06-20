const API = "http://localhost:3000/api/mascotas";

let mascotas = [];
let index = 0;

// Recuperamos el usuario logueado desde el localStorage
const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));

document.addEventListener("DOMContentLoaded", cargar);

async function cargar() {
  const cont = document.getElementById("contenedor");

  if (!usuarioGuardado) {
      cont.innerHTML = `
        <div class="fin-lista">
           Debes estar logueada como adoptante para ver los matches.
          <br><br>
          <a href="../auth/index.html" class="btn-primary" style="padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 10px;">Ir al Login</a>
        </div>`;
      return;
    }

  try {
    const res = await fetch(API);
    const data = await res.json();

    mascotas = data.mascotas || data;
    mostrar();
  } catch {
    cont.innerHTML = "<div class='fin-lista'>Error cargando mascotas </div>";
  }
}

function mostrar() {
  const cont = document.getElementById("contenedor");

  if (!mascotas[index]) {
    cont.innerHTML = "<div class='fin-lista'>No hay más mascotas disponibles por el momento 🐾</div>";
    return;
  }

  const m = mascotas[index];

  // Seleccionamos la foto según la especie real de PostgreSQL
  const urlFoto = m.especie.toLowerCase() === 'perro' 
    ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600' // Foto fija de perro
    : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600'; // Foto fija de gato

  cont.innerHTML = `
    <div class="tarjeta-container" style="display: flex; justify-content: center; width: 100%; margin-top: 10px;">
      <div class="tarjeta-match" style="background: #111; border: 1px solid #333; border-radius: 12px; overflow: hidden; width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 15px; padding-bottom: 20px;">
        
        <div class="imagen-match" style="position: relative; width: 100%; height: 250px; background-color: #222;">
          <img src="${urlFoto}" alt="${m.nombre}" style="width: 100%; height: 100%; object-fit: cover;">
          <div class="nombre-match" style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; padding: 15px; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">
            ${m.nombre}
          </div>
        </div>

        <div class="detalles-match" style="padding: 0 20px; display: flex; flex-direction: column; gap: 6px; color: #fff;">
          <p style="margin: 0; font-size: 15px;"><strong style="color: #aaa;">Especie:</strong> ${m.especie}</p>
          <p style="margin: 0; font-size: 15px;"><strong style="color: #aaa;">Sexo:</strong> ${m.sexo || 'No especificado'}</p>
          <p style="margin: 0; font-size: 15px;"><strong style="color: #aaa;">Tamaño:</strong> ${m.tamanio || m.raza || 'Mediano'}</p> 
          <p style="margin: 0; font-size: 15px;"><strong style="color: #aaa;">Edad:</strong> ${m.edad || m.edad_estimada || 'N/A'}</p>
          <p style="margin-top: 12px; margin-bottom: 5px; font-style: italic; color: #ddd; font-size: 14px; border-left: 2px solid #ff9800; padding-left: 10px;">
            "${m.descripcion || 'Sin descripción disponible.'}"
          </p>
        </div>

        <div class="acciones-match" style="display: flex; justify-content: center; gap: 25px; margin-top: 10px; padding: 0 20px;">
          <button class="btn-match btn-no" onclick="next()" style="width: 50px; height: 50px; border-radius: 50%; border: none; background-color: #333; color: #f44336; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: background 0.2s;">
            ✖
          </button>
          <button class="btn-match btn-like" onclick="like()" style="width: 50px; height: 50px; border-radius: 50%; border: none; background-color: #2e7d32; color: #fff; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
            ❤
          </button>
        </div>

      </div>
    </div>
  `;
}

async function like() {
  const m = mascotas[index];
  const urlAdoptar = 'http://localhost:3000/api/adopciones/postular';

  try {
    // Petición real al backend conectando las dos puntas de la base de datos
    const response = await fetch(urlAdoptar, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: usuarioGuardado.id_usuario, // Tu sesión real
        id_mascota: m.id_mascota // El ID real que viene de tu PostgreSQL
      })
    });

    const resultado = await response.json();

    if (response.ok) {
      alert(`¡Postulación exitosa para ${m.nombre}!\n${resultado.mensaje || 'Match registrado.'}`);
      next();
    } else {
      alert(`Servidor: ${resultado.error || 'No se pudo procesar.'}`);
    }
  } catch (error) {
    console.error("Error en la postulación:", error);
    alert('Error en la red al enviar el interés.');
  }
}

function next() {
  index++;
  mostrar();
}