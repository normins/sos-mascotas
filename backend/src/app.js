const express = require('express');
const app = express();
const port = 3000;

// Al requerir el archivo de configuración, se ejecuta la prueba de conexión inmediatamente
require('./config/db');

// Importamos las rutas de los módulos
const usuariosRoutes = require('./routes/usuarios');
const mascotasRoutes = require('./routes/mascotas');
const reportesRoutes = require('./routes/reportes');

// Middleware para recibir datos en formato JSON
app.use(express.json());

// Endpoint de prueba
app.get('/', (req, res) => {
  res.send('API de SOS Mascotas funcionando 🐾');
});

// Registramos las rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/reportes', reportesRoutes);

// Levantar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});