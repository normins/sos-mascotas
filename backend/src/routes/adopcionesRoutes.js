const express = require('express');
const router = express.Router();
const adopcionesController = require('../controllers/adopcionesController');

// Ruta para el botón del corazón (Like)
router.post('/postular', adopcionesController.registrarInteres);

// Ruta para ver el historial del adoptante
router.get('/usuario/:id_usuario', adopcionesController.obtenerPostulacionesUsuario);

module.exports = router;