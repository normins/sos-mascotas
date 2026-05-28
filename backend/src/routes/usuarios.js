const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosControllers');

// Ruta para registrar un usuario
router.post('/registrar', usuariosController.registrarUsuario);

// Ruta para iniciar sesión (POST)
router.post('/login', usuariosController.iniciarSesion);
module.exports = router;

// Ruta para obtener el historial de adopciones de un usuario
router.get('/:usuarioId/adopciones', usuariosController.obtenerAdopcionesUsuario);