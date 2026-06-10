const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const mascotasController = require('../controllers/mascotasControllers');

// Ruta para obtener todas las mascotas (GET /api/mascotas)
// Es la que usará la Integrante C para el Muro
router.get('/', mascotasController.obtenerMascotas);

// Ruta para agregar una mascota (POST /api/mascotas)
// Es la que usará el Administrador para cargar animales (RF06)
router.post('/', mascotasController.crearMascota);

// Ruta para solicitar adopción de una mascota (POST /api/mascotas/:id/adoptar)
router.post('/:id/adoptar', mascotasController.solicitarAdopcion);

// Ruta para cambiar el estado de una adopción por su ID
router.patch('/adopciones/:solicitudId', authMiddleware.requerirAdmin, mascotasController.actualizarEstadoAdopcion);

module.exports = router