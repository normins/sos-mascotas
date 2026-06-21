const API = "http://localhost:3000/api/mascotas";

document.addEventListener("DOMContentLoaded", cargar);

async function cargar() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    // Reutilizamos tus mascotas de PostgreSQL
    const mascotas = data.mascotas || data;
    render(mascotas);

  } catch (error) {
    console.error("Error cargando reportes comunitarios:", error);
    document.getElementById("muro-mascotas").innerHTML = 
      "<p style='color: white; text-align: center; padding: 20px;'>Error al conectar con el servidor de reportes comunitarios.</p>";
  }
}

function render(lista) {
  const cont = document.getElementById("muro-mascotas");
  if (!cont) return;
  cont.innerHTML = "";

  // Filtramos para no mostrar mascotas inactivas o ya adoptadas
  const comunitarias = lista.filter(m => m.estado !== 'Inactiva' && m.estado !== 'Adoptado');

  comunitarias.forEach(m => {
    // Si está 'En Tratamiento' simulamos que fue ENCONTRADA.
    // Si está 'Disponible', simulamos que está PERDIDA.
    const tipo = m.estado === 'En Tratamiento' ? "encontrada" : "perdida";
    
    // Asignamos las fotos fijas de perro o gato que nos funcionaron antes
    const foto = m.especie.toLowerCase() === 'perro' 
      ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600' 
      : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600';

    const card = document.createElement("div");
    card.className = "card-mascota";

    card.innerHTML = `
      <img src="${foto}" alt="${m.nombre}" style="width: 100%; height: 180px; object-fit: cover;">

      <div class="info-mascota" style="padding: 15px; color: white;">
        <h3 style="margin: 0 0 10px 0; font-size: 20px;">${m.nombre}</h3>

        <span class="estado ${tipo}" style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 12px; background-color: ${tipo === 'perdida' ? '#f44336' : '#2e7d32'}; color: white;">
          ${tipo === "perdida" ? "🔍 Perdida" : "🐾 Encontrada"}
        </span>

        <p style="margin: 5px 0; font-size: 14px; color: #ccc;"><strong>Especie:</strong> ${m.especie}</p>
        <p style="margin: 5px 0; font-size: 14px; color: #ccc;"><strong>Tamaño:</strong> ${m.tamanio || 'Mediano'}</p>

        <div class="acciones-card" style="margin-top: 15px;">
          ${
            tipo === "encontrada"
              ? `<button onclick="reclamar('${m.nombre}')" style="width: 100%; padding: 8px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Reclamar Mascota 🏠</button>`
              : `<button onclick="informar('${m.nombre}')" style="width: 100%; padding: 8px; background-color: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Aportar Información 📞</button>`
          }
        </div>
      </div>
    `;

    cont.appendChild(card);
  });
}

/* Acciones controladas por alertas para el MVP */
window.reclamar = function(nombre) {
  const mensaje = prompt(`¿Por qué creés que ${nombre} es tu mascota? Dejá tu mensaje descriptivo para la ONG:`);
  if (!mensaje) return;
  alert(` Reclamo recibido con éxito. La ONG validará tus datos de propiedad para la restitución de ${nombre}.`);
}

window.informar = function(nombre) {
  const mensaje = prompt(`Ingresá los datos del avistamiento o información de contacto relevante sobre ${nombre}:`);
  if (!mensaje) return;
  alert(`¡Muchas gracias! Tu información sobre ${nombre} fue registrada. Nos comunicaremos inmediatamente con el rescatista.`);
}