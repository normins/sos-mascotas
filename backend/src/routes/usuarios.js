const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Cuando el frontend mande un POST a /api/usuarios/registro, se dispara esta función
router.post('/registro', usuariosController.registrarUsuario);

module.exports = router;