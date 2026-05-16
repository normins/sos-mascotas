const express = require('express');
const app = express();
const port = 3000;

// Importamos las rutas de los módulos
const usuariosRoutes = require('./routes/usuarios');
const mascotasRoutes = require('./routes/mascotas');

// Middleware para recibir datos en formato JSON
app.use(express.json());

// Endpoint de prueba
app.get('/', (req, res) => {
  res.send('API de SOS Mascotas funcionando 🐾');
});

// Registramos las rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/mascotas', mascotasRoutes);

// Levantar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});