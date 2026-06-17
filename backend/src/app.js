const seeder = require('./seeder');
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;


// Al requerir el archivo de configuración, se ejecuta la prueba de conexión inmediatamente
require('./config/db');

// Le dice a Node que busque el HTML/CSS/JS en la carpeta public
app.use(express.static(path.join(__dirname, '../public')));


// Importamos las rutas de los módulos
const usuariosRoutes = require('./routes/usuarios');
const mascotasRoutes = require('./routes/mascotas');
const reportesRoutes = require('./routes/reportes');
const adopcionesRoutes = require('./routes/adopcionesRoutes');

// Middleware para recibir datos en formato JSON
app.use(express.json());

// Inyectar base de datos simulada de contingencia
seeder.inicializarDatosSemilla();

// Configurar las rutas del frontend
// 2. Ruta Muro -> Catálogo de mascotas
app.get('/muro', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/muro/index.html'));
});

// 3. Ruta Donaciones -> Sección de donaciones
app.get('/donaciones', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/donaciones/index.html'));
});

// 4. Ruta Login -> Sección de autenticación
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/auth/index.html'));
});

// Registramos las rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/adopciones', adopcionesRoutes);

// Levantar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});