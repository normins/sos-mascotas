console.log('Frontend funcionando');

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

      <button id="manageUsersBtn">
        Gestionar usuarios
      </button>

      <button id="logoutBtn">
        Cerrar sesión
      </button>

    </div>

  `;

  document
    .getElementById('managePetsBtn')
    .addEventListener('click', () => {

      alert('CRUD mascotas próximamente');

    });

  document
    .getElementById('manageUsersBtn')
    .addEventListener('click', () => {

      alert('CRUD usuarios próximamente');

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

      alert('Formulario RF05 próximamente');

    });

  document
    .getElementById('matchesBtn')
    .addEventListener('click', () => {

      alert('Matches próximamente');

    });

  document
    .getElementById('logoutBtn')
    .addEventListener('click', logout);

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