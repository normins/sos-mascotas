const loginForm = document.getElementById('loginForm');

const registerForm = document.getElementById('registerForm');

const message = document.getElementById('message');

const showRegister = document.getElementById('showRegister');

const loginContainer =
  document.querySelector('.login-card');

showRegister.addEventListener('click', () => {

  loginForm.style.display = 'none';

  registerForm.style.display = 'flex';

  message.textContent = '';

});

function renderPerfilForm(usuario) {

  loginContainer.innerHTML = `

    <h1>Perfil de adopción</h1>

    <p class="welcome-text">
      Completa tus preferencias
    </p>

    <form id="perfilForm">

      <select id="tipoMascota" required>
        <option value="">
          Tipo de mascota
        </option>

        <option value="Perro">
          Perro
        </option>

        <option value="Gato">
          Gato
        </option>
      </select>

      <select id="tamanioPreferido" required>

        <option value="">
          Tamaño preferido
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

      <select id="patio" required>

        <option value="">
          ¿Tenés patio?
        </option>

        <option value="Sí">
          Sí
        </option>

        <option value="No">
          No
        </option>

      </select>

      <textarea
        id="descripcionUsuario"
        placeholder="Contanos un poco sobre vos"
      ></textarea>

      <button type="submit">
        Guardar preferencias
      </button>

      <button
        type="button"
        id="volverPerfilBtn"
      >
        Volver
      </button>

    </form>

  `;

  const perfilForm =
    document.getElementById('perfilForm');

  perfilForm.addEventListener('submit', (event) => {

    event.preventDefault();

    const perfil = {

      tipoMascota:
        document.getElementById('tipoMascota').value,

      tamanio:
        document.getElementById('tamanioPreferido').value,

      patio:
        document.getElementById('patio').value,

      descripcion:
        document.getElementById(
          'descripcionUsuario'
        ).value

    };

    localStorage.setItem(
      'perfilAdopcion',
      JSON.stringify(perfil)
    );

    alert('Preferencias guardadas');

  });

  document
    .getElementById('volverPerfilBtn')
    .addEventListener('click', () => {

      renderAdoptantePanel(usuario);

    });

}

async function renderGestionMascotas(usuario) {

  try {

    const response = await fetch(
      'http://localhost:3000/api/mascotas'
    );

    const mascotas = await response.json();

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

            <p>${mascota.tamanio}</p>

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
            tamanio
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

      if (currentIndex >= mascotas.length) {

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

            <h2>${mascota.nombre}</h2>

            <p>
              ${mascota.especie}
            </p>

            <p>
              ${mascota.sexo}
            </p>

            <p>
              ${mascota.tamanio}
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
        .getElementById('likeBtn')
        .addEventListener('click', () => {

          alert(
            `Te interesó ${mascota.nombre}`
          );

          currentIndex++;

          renderCard();

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

  location.reload();

}

loginForm.addEventListener('submit', async (event) => {

  event.preventDefault();

  const email =
    document.getElementById('email').value;

  const password =
    document.getElementById('password').value;

  try {

    const response = await fetch(
      'http://localhost:3000/api/usuarios/login',
      {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          email,
          password
        })

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