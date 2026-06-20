const express = require('express');
const router = express.Router();
const requisitosController = require('../controllers/requisitosControllers');

// POST /api/requisitos - Crear requisito
router.post('/', requisitosController.crearRequisito);

// GET /api/requisitos - Obtener todos
router.get('/', requisitosController.obtenerTodosRequisitos);

// GET /api/requisitos/mascota/:mascota_id - Obtener por mascota
router.get('/mascota/:mascota_id', requisitosController.obtenerRequisitosMascota);

// DELETE /api/requisitos/:id - Eliminar requisito
router.delete('/:id', requisitosController.eliminarRequisito);

module.exports = router;
