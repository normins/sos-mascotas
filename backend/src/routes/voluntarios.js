const express = require('express');
const router = express.Router();
const voluntariosController = require('../controllers/voluntariosControllers');

// POST /api/voluntarios - Registrar voluntario
router.post('/', voluntariosController.registrarVoluntario);

// GET /api/voluntarios - Obtener todos los voluntarios
router.get('/', voluntariosController.obtenerVoluntarios);

// GET /api/voluntarios/:id - Obtener voluntario por ID
router.get('/:id', voluntariosController.obtenerVoluntarioPorId);

module.exports = router;
