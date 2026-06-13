// MIDDLEWARE PARA VALIDAR LA SOLICITUD DE ADOPCIÓN (POST)
exports.validarCamposAdopcion = (req, res, next) => {
  const { mensaje } = req.body;

  console.log("\n[Middleware Validacion] Analizando carta de motivación para la adopcion.");

  // 1. Validar que el mensaje exista y sea texto
  if (!mensaje || typeof mensaje !== 'string' || mensaje.trim() === '') {
    return res.status(400).json({ 
      error: "Validación fallida: El campo 'mensaje' es obligatorio para que el refugio evalúe tu solicitud." 
    });
  }

  // 2. Validar que la justificación tenga sustancia (mínimo 15 caracteres)
  // Queremos evitar que pongan solo "la quiero" o "adoptar"
  if (mensaje.trim().length < 15) {
    return res.status(400).json({
      error: "Validación fallida: Por favor, escribe un mensaje más detallado (mínimo 15 caracteres) explicando donde vivirá la mascota."
    });
  }

  // ✅ Todo en orden, limpiamos espacios extras y damos paso al controlador
  req.body.mensaje = mensaje.trim();
  console.log("Validación de adopción exitosa. Datos seguros.");
  next();
};