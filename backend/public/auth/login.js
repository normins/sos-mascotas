const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const message = document.getElementById('message');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginContainer = document.querySelector('.login-card');

showRegister.addEventListener('click', () => {

  loginForm.style.display = 'none';

  registerForm.style.display = 'flex';

  message.textContent = '';

});
showLogin.addEventListener('click', () => {

  registerForm.style.display = 'none';

  loginForm.style.display = 'flex';

  message.textContent = '';

});



function renderPerfilForm(usuario) {
  // Buscamos si ya existen datos guardados para este usuario específico
  const perfilGuardado = JSON.parse(localStorage.getItem(`perfilAdopcion_${usuario.email}`)) || {};

  loginContainer.innerHTML = `
    <h1>Preferencias de adopción</h1>
    <p class="welcome-text">Revisá o actualizá tus preferencias para el Match automático</p>

    <form id="perfilForm">
      
      <label for="tipoVivienda" style="font-size: 14px; color: #bbb; margin-top: 10px;">Tipo de Vivienda:</label>
      <select id="tipoVivienda" required style="margin-top: 5px;">
        <option value="">Seleccione una opción</option>
        <option value="Casa" ${perfilGuardado.tipoVivienda === 'Casa' ? 'selected' : ''}>Casa</option>
        <option value="Departamento" ${perfilGuardado.tipoVivienda === 'Departamento' ? 'selected' : ''}>Departamento</option>
        <option value="PH" ${perfilGuardado.tipoVivienda === 'PH' ? 'selected' : ''}>PH</option>
      </select>

      <label for="tienePatio" style="font-size: 14px; color: #bbb; margin-top: 10px;">¿Tiene patio/balcón seguro?</label>
      <select id="tienePatio" required style="margin-top: 5px;">
        <option value="">Seleccione una opción</option>
        <option value="Sí" ${perfilGuardado.tienePatio === 'Sí' ? 'selected' : ''}>Sí</option>
        <option value="No" ${perfilGuardado.tienePatio === 'No' ? 'selected' : ''}>No</option>
      </select>

      <label for="experiencia" style="font-size: 14px; color: #bbb; margin-top: 10px;">Experiencia previa con animales:</label>
      <select id="experiencia" required style="margin-top: 5px;">
        <option value="">Seleccione una opción</option>
        <option value="Sin experiencia" ${perfilGuardado.experiencia === 'Sin experiencia' ? 'selected' : ''}>Sin experiencia</option>
        <option value="Principiante" ${perfilGuardado.experiencia === 'Principiante' ? 'selected' : ''}>Principiante (Tuve alguna vez)</option>
        <option value="Avanzado" ${perfilGuardado.experiencia === 'Avanzado' ? 'selected' : ''}>Avanzado (Tengo conocimiento/Fui transitante)</option>
      </select>

      <label for="otrasMascotas" style="font-size: 14px; color: #bbb; margin-top: 10px;">¿Convive con otros animales actualmente?</label>
      <select id="otrasMascotas" required style="margin-top: 5px;">
        <option value="">Seleccione una opción</option>
        <option value="Sí" ${perfilGuardado.otrasMascotas === 'Sí' ? 'selected' : ''}>Sí</option>
        <option value="No" ${perfilGuardado.otrasMascotas === 'No' ? 'selected' : ''}>No</option>
      </select>

      <label for="preferenciaTamano" style="font-size: 14px; color: #bbb; margin-top: 10px;">Preferencia de tamaño de la mascota:</label>
      <select id="preferenciaTamano" required style="margin-top: 5px;">
        <option value="">Seleccione una opción</option>
        <option value="Pequeño" ${perfilGuardado.preferenciaTamano === 'Pequeño' ? 'selected' : ''}>Pequeño</option>
        <option value="Mediano" ${perfilGuardado.preferenciaTamano === 'Mediano' ? 'selected' : ''}>Mediano</option>
        <option value="Grande" ${perfilGuardado.preferenciaTamano === 'Grande' ? 'selected' : ''}>Grande</option>
      </select>

      <button type="submit" style="margin-top: 20px;">Guardar preferencias</button>
      <button type="button" id="volverPerfilBtn">Volver</button>
    </form>
  `;

  // Listener para capturar el envío del nuevo set de datos
  const perfilForm = document.getElementById('perfilForm');
  perfilForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const perfilData = {
      id_usuario: usuario.id_usuario || usuario.id || 1,
      tipo_vivienda: document.getElementById('tipoVivienda').value,
      tiene_patio: document.getElementById('tienePatio').value === 'Sí',
      experiencia: document.getElementById('experiencia').value,
      otras_mascotas: document.getElementById('otrasMascotas').value === 'Sí',
      preferencia_tamanio: document.getElementById('preferenciaTamano').value
    };

    console.log(" Enviando preferencias al servidor...", perfilData);

    //  Conexión por red hacia Express
    fetch('/api/usuarios/perfil', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(perfilData)
    })
    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      return response.json();
    })
    .then(resultado => {
      console.log("Servidor respondió con éxito:", resultado);
      
      // Resguardo local para persistencia inmediata de la interfaz
      localStorage.setItem(`perfilAdopcion_${usuario.email}`, JSON.stringify(perfilData));
      
      alert(`¡Preferencias sincronizadas con el servidor! 🐾\n${resultado.mensaje}`);
      renderAdoptantePanel(usuario);
    })
    .catch(error => {
      console.error("Falló el guardado en el backend, aplicando respaldo local:", error);
      alert("No se pudo conectar con el servidor temporalmente, pero tus cambios se guardaron localmente por seguridad.");
      
      localStorage.setItem(`perfilAdopcion_${usuario.email}`, JSON.stringify(perfilData));
    renderAdoptantePanel(usuario);
    });
  });

  document.getElementById('volverPerfilBtn').addEventListener('click', () => {
    renderAdoptantePanel(usuario);
  });
}



async function renderGestionMascotas(usuario) {

  try {

    const response = await fetch('http://localhost:3000/api/mascotas'
    );

    let mascotas = await response.json();

    // Si lo que vuelve no es una lista, la convertimos en una lista vacía
    if (!Array.isArray(mascotas)) {
      mascotas = [];
    } 


    loginContainer.innerHTML = `

      <h1>Gestión de mascotas</h1>

      <div class="dashboard-buttons">

        <button id="crearMascotaBtn">
          Nueva mascota
        </button>

        <button id="volverAdminBtn">
          Volver
        </button>

      </div>

      <div class="mascotas-list">

        ${mascotas.map(mascota => `

          <div class="mascota-card">

            <img
              src="${mascota.fotos?.[0] || 'https://picsum.photos/400'}"
              class="mascota-img"
            >
            <h3>${mascota.nombre}</h3>

            <p>${mascota.especie}</p>

            <p>${mascota.sexo}</p>

            <p>${mascota.tamanio || mascota.raza || 'Mediano'}</p>

            <button
              class="inactive-btn"
            >
              Marcar inactiva
            </button>

          </div>

        `).join('')}

      </div>

    `;

    document
      .getElementById('crearMascotaBtn')
      .addEventListener('click', () => {

        renderCrearMascota(usuario);

      });

    document
      .getElementById('volverAdminBtn')
      .addEventListener('click', () => {

        renderAdminPanel(usuario);

      });

    const inactiveButtons =
      document.querySelectorAll('.inactive-btn');

    inactiveButtons.forEach(button => {

      button.addEventListener('click', () => {

        button.textContent = 'Publicación inactiva';

        button.disabled = true;

      });

    });

  } catch (error) {

    console.error(error);

    alert('Error obteniendo mascotas');

  }

}

function renderCrearMascota(usuario) {

  loginContainer.innerHTML = `

    <h1>Nueva mascota</h1>

    <form id="mascotaForm">

      <input
        type="text"
        id="nombreMascota"
        placeholder="Nombre"
        required
      >

      <select id="especieMascota" required>

        <option value="">
          Especie
        </option>

        <option value="Perro">
          Perro
        </option>

        <option value="Gato">
          Gato
        </option>

      </select>

      <select id="sexoMascota" required>

        <option value="">
          Sexo
        </option>

        <option value="Macho">
          Macho
        </option>

        <option value="Hembra">
          Hembra
        </option>

      </select>

      <select id="tamanioMascota" required>

        <option value="">
          Tamaño
        </option>

        <option value="Pequeño">
          Pequeño
        </option>

        <option value="Mediano">
          Mediano
        </option>

        <option value="Grande">
          Grande
        </option>

      </select>

      <input
        type="number"
        id="edadMascota"
        placeholder="Edad (años)"
        min="0"
      >

      <textarea
        id="descripcionMascota"
        placeholder="Descripción (salud, comportamiento, etc.)"
        rows="3"
      ></textarea>

      <button type="submit">
        Guardar mascota
      </button>

      <button
        type="button"
        id="volverGestionBtn"
      >
        Volver
      </button>

    </form>

  `;

  const mascotaForm =
    document.getElementById('mascotaForm');

  mascotaForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const nombre =
      document.getElementById('nombreMascota').value;

    const especie =
      document.getElementById('especieMascota').value;

    const sexo =
      document.getElementById('sexoMascota').value;

    const tamanio =
      document.getElementById('tamanioMascota').value;

    const edad = document.getElementById('edadMascota').value || null;

    const descripcion = document.getElementById('descripcionMascota').value || null;

    try {

      const response = await fetch(
        'http://localhost:3000/api/mascotas',
        {

          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            nombre,
            especie,
            sexo,
            tamanio,
            edad: edad ? parseInt(edad) : null,
            descripcion,
            usuario_id: usuario.id_usuario || usuario.id || 1,
            estado: 'Disponible'
          })

        }
      );

      const data = await response.json();

      if (response.ok) {

        alert(data.mensaje);

        renderGestionMascotas(usuario);

      } else {

        alert(data.error);

      }

    } catch (error) {

      console.error(error);

      alert('Error conectando con servidor');

    }

  });

  document
    .getElementById('volverGestionBtn')
    .addEventListener('click', () => {

      renderGestionMascotas(usuario);

    });

}

function renderAdminPanel(usuario) {

  loginContainer.innerHTML = `

    <h1>Panel administrador</h1>

    <p class="welcome-text">
      Bienvenida ${usuario.nombre}
    </p>

    <div class="dashboard-buttons">

      <button id="managePetsBtn">
        Gestionar mascotas
      </button>

      <button id="logoutBtn">
        Cerrar sesión
      </button>

    </div>

  `;

  document
    .getElementById('managePetsBtn')
    .addEventListener('click', () => {

      renderGestionMascotas(usuario);

    });

  document
    .getElementById('logoutBtn')
    .addEventListener('click', logout);

}

function renderAdoptantePanel(usuario) {
  console.log(usuario);
  loginContainer.innerHTML = `

    <h1>Mi perfil</h1>

    <p class="welcome-text">
      Hola ${usuario.nombre}
    </p>

    <div class="dashboard-buttons">

      <button id="editProfileBtn">
        Editar preferencias
      </button>

      <button id="matchesBtn">
        Ver matches
      </button>

      <button id="irInicioBtn" style="background-color: #2e7d32; color: white;">
        Ver Mascotas (Inicio) 🐾
      </button>

      <button id="logoutBtn">
        Cerrar sesión
      </button>

    </div>

  `;

  document
    .getElementById('editProfileBtn')
    .addEventListener('click', () => {

      renderPerfilForm(usuario);

    });

  document
    .getElementById('matchesBtn')
    .addEventListener('click', () => {

      renderMatches(usuario);

    });

    document
      .getElementById('irInicioBtn')
      .addEventListener('click', () => {
        window.location.href = "../index.html";
    });


  document
    .getElementById('logoutBtn')
    .addEventListener('click', logout);

}


async function renderMatches(usuario) {

  try {

    const response = await fetch(
      'http://localhost:3000/api/mascotas'
    );

    const mascotas = await response.json();

    let currentIndex = 0;

    function renderCard() {

      if (currentIndex >= mascotas.length || !mascotas[currentIndex]) {

        loginContainer.innerHTML = `

          <h1>Sin más matches</h1>

          <p class="welcome-text">
            Ya viste todas las mascotas disponibles
          </p>

          <button id="volverPerfilBtn">
            Volver
          </button>

        `;

        document
          .getElementById('volverPerfilBtn')
          .addEventListener('click', () => {

            renderAdoptantePanel(usuario);

          });

        return;

      }

      const mascota = mascotas[currentIndex];

      loginContainer.innerHTML = `

        <div class="match-card">

          <img
            src="${mascota.fotos?.[0] || 'https://picsum.photos/400'}"
            class="match-img"
          >


          <div class="match-info">
            <h2>${mascota.nombre || 'Sin nombre'}</h2>
            <p>
              ${mascota.especie || 'No especificada'} • ${mascota.sexo || 'No especificado'}
            </p>
            <p>
              <strong>Raza:</strong> ${mascota.raza || 'Mezcla'}  </p>
            <p>
              <strong>Edad:</strong> ${mascota.edad || 'N/A'} meses </p>
            <p>
              <strong>Estado:</strong> ${mascota.estado || 'Disponible'}
            </p>
            <p>
              ${mascota.descripcion || 'Sin descripción'}
            </p>
          </div>



          <div class="match-buttons">

            <button
              id="rejectBtn"
              class="reject-btn"
            >
              ✖
            </button>

            <button
              id="likeBtn"
              class="like-btn"
            >
              ❤
            </button>

            <button
              id="volverMatchesBtn"
            >
              Volver
            </button>

          </div>

        </div>

      `;

      document
        .getElementById('rejectBtn')
        .addEventListener('click', () => {

          currentIndex++;

          renderCard();

        });

      document
        .getElementById('volverMatchesBtn')
        .addEventListener('click', () => {

          renderAdoptantePanel(usuario);

        });

      document
        .getElementById('likeBtn')
        .addEventListener('click', async () => {
          try {
            // Enviamos el id_usuario (que viene del login) y el id_mascota actual de PostgreSQL
            const postularResponse = await fetch('http://localhost:3000/api/adopciones/postular', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id_usuario: usuario.id_usuario,
                id_mascota: mascota.id_mascota
              })
            });

            const data = await postularResponse.json();

            if (postularResponse.ok) {
              alert(`¡Postulación exitosa para ${mascota.nombre}! `);
              currentIndex++;
              renderCard();
            } else {
              alert(`Error: ${data.error || 'No se pudo registrar la postulación'}`);
            }

          } catch (error) {
            console.error("Error al enviar la postulación:", error);
            alert("Error de red al intentar postularse.");
          }
        });

    }

    renderCard();

  } catch (error) {

    console.error(error);

    alert('Error obteniendo matches');

  }

}

function logout() {

  localStorage.removeItem('usuario');
  alert("Sesión cerrada correctamente. ¡Hasta luego! 🐾");
  window.location.href = "../index.html";

}

loginForm.addEventListener('submit', async (event) => {

  event.preventDefault();

  const email =
    document.getElementById('email').value;

  const password =
    document.getElementById('password').value;

  try {

    const response = await fetch('http://localhost:3000/api/usuarios/login',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      }
    );

    const data = await response.json();

    if (response.ok) {

      localStorage.setItem(
        'usuario',
        JSON.stringify(data.usuario)
      );

      const usuario = data.usuario;

      if (usuario.rol === 'admin') {

        renderAdminPanel(usuario);

      } else {

        renderAdoptantePanel(usuario);

      }

    } else {

      message.style.color = 'salmon';

      message.textContent = data.error;

    }

  } catch (error) {

    message.style.color = 'salmon';

    message.textContent =
      'Error conectando con el servidor';

    console.error(error);

  }

});

registerForm.addEventListener('submit', async (event) => {

  event.preventDefault();

  const nombre =
    document.getElementById('registerName').value;

  const email =
    document.getElementById('registerEmail').value;

  const password =
    document.getElementById('registerPassword').value;

  try {

    const response = await fetch(
      'http://localhost:3000/api/usuarios/registrar',
      {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          nombre,
          email,
          password
        })

      }
    );

    const data = await response.json();

    if (response.ok) {

      message.style.color = 'lightgreen';

      message.textContent = data.mensaje;

      registerForm.reset();

    } else {

      message.style.color = 'salmon';

      message.textContent = data.error;

    }

  } catch (error) {

    message.style.color = 'salmon';

    message.textContent =
      'Error conectando con servidor';

    console.error(error);

  }

});

const usuarioGuardado =
  JSON.parse(localStorage.getItem('usuario'));

if (usuarioGuardado) {

  if (usuarioGuardado.rol === 'admin') {

    renderAdminPanel(usuarioGuardado);

  } else {

    renderAdoptantePanel(usuarioGuardado);

  }

}