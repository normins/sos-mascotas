const express = require('express');
const router = express.Router();
const mascotasController = require('../controllers/mascotasControllers');
const authMiddleware = require('../middlewares/authMiddleware');
const validarAdopcionMiddleware = require('../middlewares/validarAdopcionMiddleware');

// Ruta para obtener todas las mascotas (GET /api/mascotas)
// Es la que usará la Integrante C para el Muro
router.get('/', mascotasController.obtenerMascotas);

// Ruta para agregar una mascota (POST /api/mascotas)
// Es la que usará el Administrador para cargar animales (RF06)
router.post('/', mascotasController.crearMascota);

// Ruta para solicitar adopción de una mascota (POST /api/mascotas/:id/adoptar)
router.post('/:id/adoptar', validarAdopcionMiddleware.validarCamposAdopcion, mascotasController.solicitarAdopcion);

// Ruta para cambiar el estado de una adopción por su ID
router.patch('/adopciones/:solicitudId', authMiddleware.requerirAdmin, mascotasController.actualizarEstadoAdopcion);

// Ruta para cancelar una postulación de adopción
router.delete('/adopciones/:solicitudId', mascotasController.cancelarAdopcion);

// Ruta para listar todas las adopciones registradas
router.get('/adopciones/todas', mascotasController.obtenerTodasLasAdopciones);

module.exports = router