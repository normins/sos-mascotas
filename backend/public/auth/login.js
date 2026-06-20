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



// Renderiza, precarga (mapeo Postgres real) y guarda preferencias
async function renderPerfilForm(usuario) {
  const userId = usuario.id_usuario || usuario.id || (usuario.usuario && (usuario.usuario.id_usuario || usuario.usuario.id));

  console.log("[DEBUG] ID detectado para la consulta:", userId);

  loginContainer.innerHTML = `
    <h1>Preferencias de adopción</h1>
    <p class="welcome-text">Revisá o actualizá tus preferencias para el Match automático</p>

    <form id="perfilForm">
      
      <label for="tipoVivienda" style="font-size: 14px; color: #bbb; margin-top: 10px;">Tipo de Vivienda:</label>
      <select id="tipoVivienda" required style="margin-top: 5px;">
        <option value="">Seleccionar...</option>
        <option value="Casa">Casa</option>
        <option value="Departamento">Departamento</option>
        <option value="Quinta/Campo">Quinta/Campo</option>
      </select>

      <label for="tienePatio" style="font-size: 14px; color: #bbb; margin-top: 10px;">¿Tiene patio/balcón cerrado?:</label>
      <select id="tienePatio" required style="margin-top: 5px;">
        <option value="">Seleccionar...</option>
        <option value="true">Sí</option>
        <option value="false">No</option>
      </select>

      <label for="experiencia" style="font-size: 14px; color: #bbb; margin-top: 10px;">Experiencia previa con mascotas:</label>
      <select id="experiencia" required style="margin-top: 5px;">
        <option value="">Seleccionar...</option>
        <option value="Ninguna">Ninguna</option>
        <option value="Basica">Básica (tuve alguna vez)</option>
        <option value="Avanzada">Avanzada (sé entrenar/cuidar casos complejos)</option>
      </select>

      <label for="otrasMascotas" style="font-size: 14px; color: #bbb; margin-top: 10px;">¿Tiene otras mascotas actualmente?:</label>
      <select id="otrasMascotas" required style="margin-top: 5px;">
        <option value="">Seleccionar...</option>
        <option value="No">No, ninguna</option>
        <option value="Perros">Sí, perro/s</option>
        <option value="Gatos">Sí, gato/s</option>
        <option value="Ambos">Sí, perros y gatos</option>
      </select>

      <label for="preferenciaTamanio" style="font-size: 14px; color: #bbb; margin-top: 10px;">Preferencia de tamaño de la mascota:</label>
      <select id="preferenciaTamanio" required style="margin-top: 5px;">
        <option value="">Seleccionar...</option>
        <option value="Pequeño">Pequeño</option>
        <option value="Mediano">Mediano</option>
        <option value="Grande">Grande</option>
        <option value="Cualquiera">Me da igual el tamaño</option>
      </select>

      <button type="submit" style="margin-top: 20px;">Guardar Preferencias</button>
      
      <button type="button" id="btnVolverPerfil" class="btn-back" style="margin-top: 10px; background-color: #555; color: white;">Volver</button>
    </form>
    
    <div id="perfilMessage" style="margin-top: 15px; font-weight: bold; text-align: center;"></div>
  `;

  // Acción del botón Volver
  document.getElementById('btnVolverPerfil').addEventListener('click', () => {
    window.location.href = '../index.html'; 
  });

  if (!userId) {
    console.error("No se pudo determinar el ID del usuario.");
    return;
  }

  // 🎯 PARTE A: Consulta de precarga mapeando los nombres reales de la tabla de Postgres
  try {
    const resBD = await fetch(`http://localhost:3000/api/usuarios/perfil/${userId}`);
    const dataBD = await resBD.json();

    if (dataBD && dataBD.perfil) {
      console.log("[Precarga] Mapeando datos reales:", dataBD.perfil);
      
      document.getElementById('tipoVivienda').value = dataBD.perfil.tipo_vivienda || '';
      document.getElementById('tienePatio').value = dataBD.perfil.tiene_patio !== undefined ? String(dataBD.perfil.tiene_patio) : '';
      
      // ✨ CORRECCIÓN DE CAMPOS: Mapeamos con el guion bajo correspondiente a la BD física
      document.getElementById('experiencia').value = dataBD.perfil.experiencia_previa || dataBD.perfil.experiencia || '';
      document.getElementById('otrasMascotas').value = dataBD.perfil.otras_mascotas || '';
      document.getElementById('preferenciaTamanio').value = dataBD.perfil.preferencia_tamanio || '';
    }
  } catch (err) {
    console.error("Error al precargar:", err);
  }

  // 🎯 PARTE B: Guardado físico al hacer submit
  const perfilForm = document.getElementById('perfilForm');
  const perfilMessage = document.getElementById('perfilMessage');

  perfilForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const perfilData = {
      id_usuario: userId,
      tipo_vivienda: document.getElementById('tipoVivienda').value,
      tiene_patio: document.getElementById('tienePatio').value === 'true',
      experiencia: document.getElementById('experiencia').value,
      otras_mascotas: document.getElementById('otrasMascotas').value,
      preferencia_tamanio: document.getElementById('preferenciaTamanio').value
    };

    try {
      const response = await fetch('http://localhost:3000/api/usuarios/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfilData)
      });

      const resultado = await response.json();

      if (response.ok) {
        localStorage.setItem(`perfilAdopcion_${usuario.email}`, JSON.stringify(perfilData));
        alert("¡Preferencias guardadas con éxito en PostgreSQL! 🐾");
        window.location.href = '../index.html';
        perfilMessage.style.color = 'lightgreen';
        perfilMessage.textContent = "Sincronizado con la base de datos física.";
      } else {
        perfilMessage.style.color = 'salmon';
        perfilMessage.textContent = resultado.error || "Error al guardar.";
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      perfilMessage.style.color = 'salmon';
      perfilMessage.textContent = "Error de conexión con el servidor.";
    }
  });
}


// ==================================================================
//  Listar mascotas y Gestión de baja lógica
// ==================================================================
async function renderGestionMascotas(usuario) {
  try {
    const response = await fetch('http://localhost:3000/api/mascotas');
    const data = await response.json();
    
    // Postgres nos devuelve la lista dentro de data.mascotas
    let animales = data.mascotas || [];

    // Filtramos las 'Inactivas' para que actúe como una baja lógica real en la interfaz
    const visibles = animales.filter(m => m.estado !== 'Inactiva');

    loginContainer.innerHTML = `
      <h1>Gestión de mascotas</h1>
      <div class="dashboard-buttons">
        <button id="crearMascotaBtn">Nueva mascota</button>
        <button id="volverAdminBtn">Volver</button>
      </div>

      <div class="mascotas-list">
        ${visibles.map(mascota => {
          const idActual = mascota.id_mascota || mascota.id;
          const urlFoto = mascota.especie.toLowerCase() === 'perro' 
            ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500' // Foto fija de perro
            : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'; // Foto fija de gato

        return `
            <div class="mascota-card">
              <img src="${urlFoto}" alt="${mascota.nombre}" class="match-img" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
              <h3>${mascota.nombre}</h3>
              <p>${mascota.especie}</p>
              <p>${mascota.sexo}</p>
              <p>${mascota.tamanio || 'Mediano'}</p>
              <p style="color: #ffb74d; font-size: 13px; font-weight: bold; margin: 5px 0;">Estado: ${mascota.estado}</p>
              
              <div style="display: flex; gap: 5px; width: 100%; margin-top: 10px;">
                <button class="edit-btn" data-id="${idActual}" style="flex: 1; padding: 8px; background-color: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">Editar</button>
                <button class="inactive-btn" data-id="${idActual}" data-nombre="${mascota.nombre}" style="flex: 1;">Eliminar</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('crearMascotaBtn').addEventListener('click', () => {
      renderCrearMascota(usuario); // Modo Alta puro
    });

    document.getElementById('volverAdminBtn').addEventListener('click', () => {
      renderAdminPanel(usuario);
    });

    //  CONTROLADOR DE BAJA LÓGICA (DELETE)
    document.querySelectorAll('.inactive-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const nombre = e.target.getAttribute('data-nombre');
        
        if (confirm(`¿Estás segura de dar de baja lógica a "${nombre}" en PostgreSQL?`)) {
          try {
            const deleteRes = await fetch(`http://localhost:3000/api/mascotas/${id}`, {
              method: 'DELETE'
            });
            if (deleteRes.ok) {
              e.target.textContent = 'Publicación inactiva';
              e.target.disabled = true;
              alert("Mascota dada de baja de forma exitosa. Status: Inactiva.");
              renderGestionMascotas(usuario); // Refrescamos vista
            } else {
              alert("Error al procesar la baja en el servidor.");
            }
          } catch (err) {
            console.error("Error en petición DELETE:", err);
          }
        }
      });
    });

    //  CONTROLADOR DE EDICIÓN (Pasa la mascota elegida al formulario)
    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const mascotaSeleccionada = animales.find(m => (m.id_mascota || m.id) == id);
        if (mascotaSeleccionada) {
          renderCrearMascota(usuario, mascotaSeleccionada); // Modo Edición
        }
      });
    });

  } catch (error) {
    console.error(error);
    alert('Error obteniendo mascotas relacionales');
  }
}

// ==================================================================
// FORMULARIO DUAL: Carga de datos y modificación activa (PUT)
// ==================================================================
function renderCrearMascota(usuario, mascotaAEditar = null) {
  const esEdicion = mascotaAEditar !== null;
  const idMascota = esEdicion ? (mascotaAEditar.id_mascota || mascotaAEditar.id) : '';

  loginContainer.innerHTML = `
    <h1>${esEdicion ? `Editar a ${mascotaAEditar.nombre}` : 'Nueva mascota'}</h1>

    <form id="mascotaForm">
      <input type="text" id="nombreMascota" placeholder="Nombre" required value="${esEdicion ? mascotaAEditar.nombre : ''}">

      <select id="especieMascota" required>
        <option value="">Especie</option>
        <option value="Perro" ${esEdicion && mascotaAEditar.especie === 'Perro' ? 'selected' : ''}>Perro</option>
        <option value="Gato" ${esEdicion && mascotaAEditar.especie === 'Gato' ? 'selected' : ''}>Gato</option>
      </select>

      <select id="sexoMascota" required>
        <option value="">Sexo</option>
        <option value="Macho" ${esEdicion && mascotaAEditar.sexo === 'Macho' ? 'selected' : ''}>Macho</option>
        <option value="Hembra" ${esEdicion && mascotaAEditar.sexo === 'Hembra' ? 'selected' : ''}>Hembra</option>
      </select>

      <select id="tamanioMascota" required>
        <option value="">Tamaño</option>
        <option value="Pequeño" ${esEdicion && mascotaAEditar.tamanio === 'Pequeño' ? 'selected' : ''}>Pequeño</option>
        <option value="Mediano" ${esEdicion && mascotaAEditar.tamanio === 'Mediano' ? 'selected' : ''}>Mediano</option>
        <option value="Grande" ${esEdicion && mascotaAEditar.tamanio === 'Grande' ? 'selected' : ''}>Grande</option>
      </select>

      <input type="number" id="edadMascota" placeholder="Edad (años)" min="0" value="${esEdicion && mascotaAEditar.edad ? parseInt(mascotaAEditar.edad) : ''}">

      <select id="estadoMascota" required style="margin-bottom: 15px;">
        <option value="Disponible" ${esEdicion && mascotaAEditar.estado === 'Disponible' ? 'selected' : ''}>Disponible</option>
        <option value="Adoptado" ${esEdicion && mascotaAEditar.estado === 'Adoptado' ? 'selected' : ''}>Adoptado</option>
        <option value="En Tratamiento" ${esEdicion && mascotaAEditar.estado === 'En Tratamiento' ? 'selected' : ''}>En Tratamiento</option>
      </select>

      <textarea id="descripcionMascota" placeholder="Descripción (salud, comportamiento, etc.)" rows="3">${esEdicion ? (mascotaAEditar.descripcion || '') : ''}</textarea>

      <button type="submit">${esEdicion ? 'Guardar Cambios' : 'Guardar mascota'}</button>
      <button type="button" id="volverGestionBtn">Volver</button>
    </form>
  `;

  const mascotaForm = document.getElementById('mascotaForm');

  mascotaForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      nombre: document.getElementById('nombreMascota').value,
      especie: document.getElementById('especieMascota').value,
      sexo: document.getElementById('sexoMascota').value,
      tamanio: document.getElementById('tamanioMascota').value,
      edad: document.getElementById('edadMascota').value || null,
      estado: document.getElementById('estadoMascota').value,
      descripcion: document.getElementById('descripcionMascota').value || null,
      usuario_id: usuario.id_usuario || usuario.id || 1
    };

    // SELECCIÓN DINÁMICA DE MÉTODO (POST para crear, PUT para actualizar)
    const url = esEdicion ? `http://localhost:3000/api/mascotas/${idMascota}` : 'http://localhost:3000/api/mascotas';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(esEdicion ? "¡Mascota modificada con éxito en PostgreSQL!" : data.mensaje);
        renderGestionMascotas(usuario);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error conectando con el servidor relacional');
    }
  });

  document.getElementById('volverGestionBtn').addEventListener('click', () => {
    renderGestionMascotas(usuario);
  });
}

function renderAdminPanel(usuario) {

  loginContainer.innerHTML = `

    <h1>Panel administrador</h1>

    <p class="welcome-text">
      Bienvenida ${usuario.nombre}
    </p>

    <div class="dashboard-buttons" style="display: flex; flex-direction: column; gap: 10px;">

      <button id="managePetsBtn">
        Gestionar mascotas
      </button>

      <button id="manageRequestsBtn" style="background-color: #ff9800; color: white;">
        Revisar Solicitudes
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

  // Abre el panel de control de adopciones
  document
    .getElementById('manageRequestsBtn')
    .addEventListener('click', () => {

      renderControlSolicitudes(usuario);

  });

  document
    .getElementById('logoutBtn')
    .addEventListener('click', logout);

}


// 📋 PANEL DE CONTROL: Auditoría de solicitudes de adopción (PATCH)
async function renderControlSolicitudes(usuario) {
  try {
    // Buscamos todas las solicitudes reales usando la ruta GET del backend
    const response = await fetch('http://localhost:3000/api/mascotas/adopciones/todas');
    const data = await response.json();
    
    const solicitudes = data.adopciones || [];

    loginContainer.innerHTML = `
      <h1>Solicitudes de Adopción</h1>
      <p class="welcome-text">Auditoría y control de postulaciones en PostgreSQL</p>
      
      <div class="dashboard-buttons" style="margin-bottom: 15px;">
        <button id="volverAdminDesdeSolBtn" style="background-color: #555;">Volver al Panel</button>
      </div>

      <div class="solicitudes-list" style="display: flex; flex-direction: column; gap: 15px; width: 100%;">
        ${solicitudes.length === 0 
          ? `<p style="color: #888; text-align: center;">No hay solicitudes de adopción registradas en el sistema.</p>`
          : solicitudes.map(sol => `
            <div class="solicitud-card" style="background: #222; border-left: 4px solid #ff9800; padding: 15px; border-radius: 6px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h3 style="margin: 0; color: #fff; font-size: 16px;">Solicitud #${sol.id}</h3>
                  <p style="margin: 2px 0; font-size: 13px; color: #aaa;"><strong>ID Adoptante:</strong> ${sol.usuarioId || sol.id_usuario}</p>
                  <p style="margin: 2px 0; font-size: 13px; color: #aaa;"><strong>ID Mascota:</strong> ${sol.mascotaId || sol.id_mascota}</p>
                  <p style="margin: 5px 0; font-size: 14px; color: #eee; font-style: italic;">"${sol.mensaje || 'Sin observaciones'}"</p>
                </div>
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
                  background-color: ${sol.estado === 'Aprobada' ? '#2e7d32' : sol.estado === 'Rechazada' ? '#c62828' : '#ef6c00'}; color: white;">
                  ${sol.estado}
                </span>
              </div>

              ${sol.estado === 'Pendiente' ? `
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                  <button class="btn-aprobar" data-id="${sol.id}" style="flex: 1; padding: 6px; background-color: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Aprobar 🟢</button>
                  <button class="btn-rechazar" data-id="${sol.id}" style="flex: 1; padding: 6px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Rechazar 🔴</button>
                </div>
              ` : ''}
            </div>
          `).join('')
        }
      </div>
    `;

    document.getElementById('volverAdminDesdeSolBtn').addEventListener('click', () => {
      renderAdminPanel(usuario);
    });

    // MANEJADOR DINÁMICO PARA ACTUALIZAR ESTADO (PATCH)
    const procesarEstado = async (solicitudId, nuevoEstado) => {
      try {
        const resPatch = await fetch(`http://localhost:3000/api/mascotas/adopciones/${solicitudId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': usuario.rol
          },
          body: JSON.stringify({ nuevo_estado: nuevoEstado }) // 'Aprobada' o 'Rechazada'
        });

        if (resPatch.ok) {
          alert(`¡Solicitud #${solicitudId} cambiada a estado: ${nuevoEstado}! 🐾`);
          renderControlSolicitudes(usuario); // Recarga la lista en tiempo real
        } else {
          const errData = await resPatch.json();
          alert(`Error del servidor: ${errData.error || 'No se pudo procesar el cambio.'}`);
        }
      } catch (err) {
        console.error("Error en petición PATCH:", err);
        alert("Error de conexión con el backend.");
      }
    };

    // Vincular clics de aprobación
    document.querySelectorAll('.btn-aprobar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        procesarEstado(id, 'Aprobada');
      });
    });

    // Vincular clics de rechazo
    document.querySelectorAll('.btn-rechazar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        procesarEstado(id, 'Rechazada');
      });
    });

  } catch (error) {
    console.error("Error cargando panel de control de solicitudes:", error);
    alert("Error al conectar con las rutas de adopciones.");
  }
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

      const urlFoto = mascota.especie.toLowerCase() === 'perro' 
        ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500'
        : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500';

      loginContainer.innerHTML = `

        <div class="match-card">

          <img
            src="${urlFoto?.[0] || 'https://picsum.photos/400'}"
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

  const telefono = 
    document.getElementById('registerPhone').value;  

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
          password,
          telefono
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