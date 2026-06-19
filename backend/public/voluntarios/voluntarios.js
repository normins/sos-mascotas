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

  fetch('http://localhost:3000/api/voluntarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(respuesta => {
    if (respuesta.voluntario || respuesta.mensaje) {
      alert(`¡Gracias ${data.nombre}! Tu postulación fue registrada con éxito.`);
      console.log('Voluntario registrado:', respuesta);
      e.target.reset();
    } else {
      throw new Error(respuesta.error);
    }
  })
  .catch(error => {
    alert(`Error al registrar: ${error.message}`);
    console.error(error);
  });
}