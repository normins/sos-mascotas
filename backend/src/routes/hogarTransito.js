const express = require('express');
const router = express.Router();
const hogarController = require('../controllers/hogarTransitoControllers');

// POST /api/hogar-transito - Crear hogar tránsito
router.post('/', hogarController.crearHogarTransito);

// GET /api/hogar-transito - Obtener todos
router.get('/', hogarController.obtenerTodosHogares);

// GET /api/hogar-transito/usuario/:usuario_id - Obtener hogares de usuario
router.get('/usuario/:usuario_id', hogarController.obtenerHogaresUsuario);

// GET /api/hogar-transito/mascota/:mascota_id - Obtener hogares de mascota
router.get('/mascota/:mascota_id', hogarController.obtenerHogaresMascota);

// PATCH /api/hogar-transito/:id - Actualizar hogar
router.patch('/:id', hogarController.actualizarHogarTransito);

module.exports = router;
