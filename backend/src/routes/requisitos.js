const express = require('express');
const router = express.Router();
const requisitosController = require('../controllers/requisitosControllers'); 

// POST /api/requisitos - Crear requisito
router.post('/', requisitosController.crearRequisito);

// GET /api/requisitos - Obtener todos
router.get('/', requisitosController.obtenerTodosRequisitos || ((req, res) => res.json([])));

// 🔧 CORREGIDO: Empatado con "obtenerRequisitosMascota" que es el nombre real en tu controlador
router.get('/mascota/:mascota_id', requisitosController.obtenerRequisitosMascota || ((req, res) => res.json([])));

// DELETE /api/requisitos/:id - Eliminar requisito
router.delete('/:id', requisitosController.eliminarRequisito || ((req, res) => res.send('Ok')));

module.exports = router;