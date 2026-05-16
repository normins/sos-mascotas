const express = require('express');
const app = express();
const port = 3000;

// Importamos las rutas (asegúrate que la ruta sea correcta desde donde está app.js)
const usuariosRoutes = require('./routes/usuarios');

// Middleware para poder recibir datos en formato JSON
app.use(express.json());

// Endpoint de prueba para verificar que el servidor corre
app.get('/', (req, res) => {
  res.send('API de SOS Mascotas funcionando 🐾');
});

// Usar las rutas definidas en la carpeta routes
// Ahora todas las rutas de usuarios empezarán con /api/usuarios
app.use('/api/usuarios', usuariosRoutes);

// Levantar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});