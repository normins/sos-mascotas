const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesControllers');

// Ruta para ver todos los reportes comunitarios
router.get('/', reportesController.obtenerReportes);

// Ruta para registrar una nueva emergencia
router.post('/', reportesController.crearReporte);

module.exports = router;