const express = require('express');
const router = express.Router();
const publicacionesController = require('../controllers/publicacionesControllers');

// POST /api/publicaciones - Crear publicación
router.post('/', publicacionesController.crearPublicacion);

// GET /api/publicaciones - Obtener todas
router.get('/', publicacionesController.obtenerTodasPublicaciones);

// GET /api/publicaciones/tipo/:tipo - Obtener por tipo
router.get('/tipo/:tipo', publicacionesController.obtenerPublicacionesPorTipo);

// PATCH /api/publicaciones/:id - Actualizar estado
router.patch('/:id', publicacionesController.actualizarEstadoPublicacion);

module.exports = router;
