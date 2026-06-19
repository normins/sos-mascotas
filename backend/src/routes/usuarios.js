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
router.post('/perfil', (req, res) => {
  const { id_usuario, tipoVivienda, tienePatio, experiencia, otrasMascotas, preferenciaTamano } = req.body;

  console.log("➡️ Servidor recibió datos de PerfilAdopcion:", req.body);

  // Simulamos la respuesta estructurada exacta de la base de datos
  res.status(200).json({
    success: true,
    mensaje: "Perfil de adopción guardado correctamente (Simulado de contingencia)",
    data: {
      id: 999, // ID simulado
      id_usuario: id_usuario || 1,
      tipoVivienda,
      tienePatio,
      experiencia,
      otrasMascotas,
      preferenciaTamano
    }
  });
});

module.exports = router;