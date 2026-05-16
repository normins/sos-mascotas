const express = require('express');
const router = express.Router();

// IMPORTANTE: Aquí estaba el error. El archivo tiene una 's' al final: usuariosControllers
const usuariosController = require('../controllers/usuariosControllers');

// Cuando el frontend mande un POST a /api/usuarios/registro, se dispara la función del controlador
router.post('/registro', usuariosController.registrarUsuario);

module.exports = router;