const express = require('express');
const router = express.Router();
const mascotasController = require('../controllers/mascotasControllers');

// Ruta para obtener todas las mascotas (GET /api/mascotas)
// Es la que usará la Integrante C para el Muro
router.get('/', mascotasController.obtenerMascotas);

// Ruta para agregar una mascota (POST /api/mascotas)
// Es la que usará el Administrador para cargar animales (RF06)
router.post('/', mascotasController.crearMascota);

module.exports = router;