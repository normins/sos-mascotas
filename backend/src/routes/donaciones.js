const express = require('express');
const router = express.Router();
const donacionesController = require('../controllers/donacionesControllers');

// POST /api/donaciones - Crear donación
router.post('/', donacionesController.crearDonacion);

// GET /api/donaciones/usuario/:usuario_id - Obtener donaciones de un usuario
router.get('/usuario/:usuario_id', donacionesController.obtenerDonacionesUsuario);

// GET /api/donaciones - Obtener todas las donaciones (admin)
router.get('/', donacionesController.obtenerTodasDonaciones);

module.exports = router;
