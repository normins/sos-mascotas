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

  // Usamos una foto por defecto si el registro viene null
  const fotoUrl = m.fotos && m.fotos[0] ? m.fotos[0] : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600";

  cont.innerHTML = `
    <div class="wrapper-match">
      <div class="card-match">
        <div class="imagen-match">
          <img src="${fotoUrl}" alt="${m.nombre}">
        </div>
        
        <div class="info-match">
          <h3>${m.nombre}</h3>
          <p><strong>Especie:</strong> ${m.especie} | <strong>Sexo:</strong> ${m.sexo || 'No especificado'}</p>
          <p><strong>Tamaño:</strong> ${m.tamanio || m.raza || 'Mediano'}</p> <p><strong>Edad:</strong> ${m.edad || m.edad_estimada || 'N/A'}</p>
          <p style="margin-top: 10px; font-style: italic;">"${m.descripcion || 'Sin descripción disponible.'}"</p>
        </div>

        <div class="acciones-match">
          <button class="btn-match btn-no" onclick="next()">✖</button>
          <button class="btn-match btn-like" onclick="like()">❤</button>
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