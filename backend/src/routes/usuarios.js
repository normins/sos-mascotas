const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosControllers');


// Ruta para registrar un usuario (RF01)
router.post('/registrar', usuariosController.registrarUsuario);

// Ruta para iniciar sesión (RF03)
router.post('/login', usuariosController.iniciarSesion);

// Ruta para obtener el historial de adopciones de un usuario
router.get('/:usuarioId/adopciones', usuariosController.obtenerAdopcionesUsuario);

// POST /api/usuarios/perfil
// Guarda o actualiza las preferencias extendidas del adoptante (RF05)
router.post('/perfil', usuariosController.guardarPerfilAdopcion);

module.exports = router;