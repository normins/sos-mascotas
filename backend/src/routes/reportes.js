const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesControllers');
const authMiddleware = require('../middlewares/authMiddleware'); 

// Ruta para ver todos los reportes comunitarios
router.get('/', reportesController.obtenerReportes);

// Ruta para registrar una nueva emergencia
router.post('/', reportesController.crearReporte);

// Ruta protegida para cambiar el estado de un reporte (Solo Admin) 
router.patch('/:id/estado', authMiddleware.requerirAdmin, reportesController.actualizarEstadoReporte);

module.exports = router;