const seeder = require('./seeder');
const express = require('express');
const path = require('path');
const db = require('./config/db');
const app = express();
const port = 3000;

// Importamos las rutas de los módulos
const usuariosRoutes = require('./routes/usuarios');
const mascotasRoutes = require('./routes/mascotas');
const reportesRoutes = require('./routes/reportes');
const adopcionesRoutes = require('./routes/adopcionesRoutes');
const donacionesRoutes = require('./routes/donaciones');
const voluntariosRoutes = require('./routes/voluntarios');
const publicacionesRoutes = require('./routes/publicaciones');
const requisitosRoutes = require('./routes/requisitos');
const hogarTransitoRoutes = require('./routes/hogarTransito');

// Función principal async para inicializar la app
const inicializarApp = async () => {
  try {
    // 1. Inicializar base de datos (conexión + crear tablas)
    await db.initialize();

    // 2. Le dice a Node que busque el HTML/CSS/JS en la carpeta public
    app.use(express.static(path.join(__dirname, '../public')));

    // 3. Middleware para recibir datos en formato JSON
    app.use(express.json());

    // 4. Inyectar base de datos simulada de contingencia
    seeder.inicializarDatosSemilla();

    // 5. Configurar las rutas del frontend
    // Ruta Muro -> Catálogo de mascotas
    app.get('/muro', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/muro/index.html'));
    });

    // Ruta Donaciones -> Sección de donaciones
    app.get('/donaciones', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/donaciones/index.html'));
    });

    // Ruta Login -> Sección de autenticación
    app.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/auth/index.html'));
    });

    // 6. Registramos las rutas API
    app.use('/api/usuarios', usuariosRoutes);
    app.use('/api/mascotas', mascotasRoutes);
    app.use('/api/reportes', reportesRoutes);
    app.use('/api/adopciones', adopcionesRoutes);
    app.use('/api/donaciones', donacionesRoutes);
    app.use('/api/voluntarios', voluntariosRoutes);
    app.use('/api/publicaciones', publicacionesRoutes);
    app.use('/api/requisitos', requisitosRoutes);
    app.use('/api/hogar-transito', hogarTransitoRoutes);

    // 7. Levantar el servidor
    app.listen(port, () => {
      console.log(`
==================================================================
🚀 Servidor escuchando en http://localhost:${port}
✅ Aplicación lista para aceptar solicitudes
==================================================================
      `);
    });

  } catch (err) {
    console.error('❌ Error crítico durante la inicialización:', err.message);
    console.error('El servidor intentará continuar en MODO SIMULADOR...');

    // Iniciar servidor incluso si falla BD (para modo simulador)
    app.use(express.json());
    seeder.inicializarDatosSemilla();
    app.use('/api/usuarios', usuariosRoutes);
    app.use('/api/mascotas', mascotasRoutes);
    app.use('/api/reportes', reportesRoutes);
    app.use('/api/adopciones', adopcionesRoutes);

    app.listen(port, () => {
      console.log(`
==================================================================
⚠️ SERVIDOR EN MODO SIMULADOR
Escuchando en http://localhost:${port} (datos en memoria)
==================================================================
      `);
    });
  }
};

// Exportar la función para que server.js pueda usarla
module.exports = inicializarApp();