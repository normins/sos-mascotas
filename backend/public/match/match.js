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
        id_usuario: usuarioGuardado.id_usuario || usuarioGuardado.id || 1, // Tu sesión real
        id_mascota: m.id_mascota // El ID real que viene de tu PostgreSQL
      })
    });

    const resultado = await response.json();

    if (response.ok) {
      // EVALUACIÓN AUTOMÁTICA (RF11): El backend de contingencia responde un éxito simétrico
      alert(`¡Postulación exitosa para ${m.nombre}!\n${resultado.mensaje || 'Match registrado.'}`);
     // Capturamos el panel inferior de la tarjeta actual en pantalla
      const accionesContenedor = document.querySelector('.acciones-match');
      if (accionesContenedor) {
        // Redibujamos los botones sin avanzar el índice del recorrido
        accionesContenedor.innerHTML = `
          <button id="solicitarFormBtn" style="background-color: #2e7d32; color: white; border: none; padding: 10px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">
            Iniciar Solicitud de Adopción 📄
          </button>
          <button id="skipBtn" style="background-color: #444; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 8px;">
            Siguiente ➡️
          </button>
        `;

        // Acoplamos los nuevos listeners dinámicos de este estado intermedio
        document.getElementById('solicitarFormBtn').addEventListener('click', () => {
          renderFormularioSolicitud(m);
        });

        document.getElementById('skipBtn').addEventListener('click', () => {
          next();
        });
      }
    } else {
      alert(`Servidor: ${resultado.error || 'No se pudo procesar.'}`);
    }
  } catch (error) {
    console.error("Error en la postulación:", error);
    alert('Error en la red al enviar el interés.');
  }
}

// 📄 Dibuja el formulario de la Solicitud Formal (RF14) reutilizando los estilos oscuros
function renderFormularioSolicitud(mascota) {
  const contenedor = document.querySelector('.card-match');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="padding: 20px; display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
      <h3 style="margin-top: 0; color: #fff;">Solicitud para ${mascota.nombre} 🐾</h3>
      <p style="color: #bbb; font-size: 13px; margin-bottom: 15px;">Tu perfil es compatible. Completá el campo de observaciones obligatorias para la ONG:</p>
      
      <form id="solicitudFormalForm" style="display: flex; flex-direction: column; width: 100%;">
        <textarea 
          id="observacionesSolicitud" 
          placeholder="Escribí acá comentarios sobre tu entorno, horarios de preferencia para visitas, o cualquier detalle relevante..."
          required
          style="width: 100%; padding: 10px; background-color: #222; color: white; border: 1px solid #333; border-radius: 6px; min-height: 100px; resize: none; font-family: inherit; box-sizing: border-box; margin-bottom: 15px;"
        ></textarea>
        
        <button type="submit" style="background-color: #304ffe; color: white; padding: 12px; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; width: 100%;">
          Enviar Solicitud Formal
        </button>
        
        <button type="button" id="cancelarSolicitudBtn" style="background-color: #444; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; margin-top: 8px; width: 100%;">
          Volver
        </button>
      </form>
    </div>
  `;

  // Listener para capturar y enviar el formulario de observaciones formalizado al Servidor Express
  document.getElementById('solicitudFormalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const obs = document.getElementById('observacionesSolicitud').value;

    fetch('/api/adopciones/solicitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: usuarioGuardado.id_usuario || usuarioGuardado.id || 1,
        id_mascota: mascota.id_mascota || 1,
        observaciones: obs
      })
    })
    .then(res => res.json())
    .then(resultado => {
      console.log(" Solicitud registrada en el backend:", resultado);
      alert(`🎉 ${resultado.mensaje}\n\nFecha de alta: ${resultado.data.fecha}\nEstado inicial: ${resultado.data.estado}`);
      next(); // Al completarse de forma exitosa, avanza limpio al siguiente animal del carrusel
    })
    .catch(err => {
      console.error(" Error enviando solicitud formal:", err);
      alert("Hubo un problema de red al procesar la solicitud en el servidor.");
    });
  });

  document.getElementById('cancelarSolicitudBtn').addEventListener('click', () => {
    mostrar(); // Si cancela, redibuja la ficha tal cual estaba
  });
}

function next() {
  index++;
  mostrar();
}