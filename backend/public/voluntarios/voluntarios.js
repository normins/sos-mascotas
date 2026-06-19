document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-voluntario");
  
  if (formulario) {
    formulario.addEventListener("submit", enviar);
  }
});

function enviar(e) {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    telefono: document.getElementById("telefono").value,
    tipo: document.getElementById("tipo").value,
    disponibilidad: document.getElementById("disponibilidad").value
  };

  // Muestra en consola la estructura limpia lista para asociar a una API futura
  console.log("Datos capturados para el módulo de voluntarios:", data);

  alert(`¡Gracias ${data.nombre}! Tu postulación como voluntario fue enviada con éxito.`);

  e.target.reset();
}