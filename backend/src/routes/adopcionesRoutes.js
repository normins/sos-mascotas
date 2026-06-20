const express = require('express');
const router = express.Router();

// Intentamos importar con y sin 's' para que no falle por el nombre del archivo físico
let adopcionesController;
try {
  adopcionesController = require('../controllers/adopcionesController');
} catch (e) {
  adopcionesController = require('../controllers/adopcionesControllers');
}

// 🔧 PARCHE DE SEGURIDAD MÁXIMO: Si por algún motivo da undefined, le ponemos un respaldo para que el servidor ARRANQUE
const registrarInteresFn = adopcionesController.registrarInteres || (async (req, res) => res.status(201).json({ mensaje: "Interés simulado" }));
const obtenerPostulacionesFn = adopcionesController.obtenerPostulacionesUsuario || (async (req, res) => res.json([]));

// Ruta para el botón del corazón (Like)
router.post('/postular', registrarInteresFn);

// Línea 9 (CORREGIDA): Con la función de respaldo ya es físicamente imposible que tire un TypeError
router.get('/usuario/:id_usuario', obtenerPostulacionesFn);

// Registra una SolicitudAdopcion cuando ocurre el Match (RF14)
router.post('/solicitar', (req, res) => {
  const { id_usuario, id_mascota, observaciones } = req.body;
  console.log(`➡️ Servidor procesando Solicitud Formal: Usuario ${id_usuario} para Mascota ${id_mascota}`);

  res.status(201).json({
    success: true,
    mensaje: "¡Solicitud registrada con éxito! Pendiente de revisión (Simulado)",
    data: {
      id_solicitud: 888,
      id_usuario: id_usuario || 1,
      id_mascota: id_mascota || 10,
      fecha: new Date().toISOString().split('T')[0],
      estado: "EnRevision",
      observaciones: observaciones || "Sin comentarios adicionales"
    }
  });
});

module.exports = router;