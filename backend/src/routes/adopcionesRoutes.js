const express = require('express');
const router = express.Router();
const adopcionesController = require('../controllers/adopcionesController');

// Ruta para el botón del corazón (Like)
//router.post('/postular', adopcionesController.registrarInteres);
// 🛠️ LA REEMPLAZAMOS POR ESTA SIMULACIÓN DE CONTINGENCIA:
router.post('/postular', (req, res) => {
  res.status(200).json({
    success: true,
    mensaje: "¡Match generado con éxito! (Simulado interino)"
  });
});

// Ruta para ver el historial del adoptante
router.get('/usuario/:id_usuario', adopcionesController.obtenerPostulacionesUsuario);

// Registra una SolicitudAdopcion cuando ocurre el Match (RF14)
router.post('/solicitar', (req, res) => {
  const { id_usuario, id_mascota, observaciones } = req.body;

  console.log(`➡️ Servidor procesando Solicitud Formal: Usuario ${id_usuario} para Mascota ${id_mascota}`);

  // Retornamos los atributos exactos del diagrama de clases (fecha, estado, observaciones)
  res.status(201).json({
    success: true,
    mensaje: "¡Solicitud registrada con éxito! Pendiente de revisión por el Administrador (Simulado)",
    data: {
      id_solicitud: 888, // ID simulado interino
      id_usuario: id_usuario || 1,
      id_mascota: id_mascota || 10,
      fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      estado: "EnRevision", // Estado inicial del ciclo de vida del TP
      observaciones: observaciones || "Sin comentarios adicionales"
    }
  });
});


module.exports = router;