const { Pool } = require('pg');
const initDb = require('./initDb'); // Asegúrate de que la ruta apunte bien a tu archivo initDb.js

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sos_mascotas',
  password: 'Mushu',
  port: 5432,
});

let usandoSimulador = false;

// Función de inicialización async
const initialize = async () => {
  try {
    // 1. Intentamos asegurar que la BD exista y creamos las tablas automáticamente primero
    const resultado = await initDb.crearTablasAutomaticamente(pool);

    if (!resultado.success) {
      throw new Error('No se pudo inicializar la estructura de la base de datos.');
    }

    // 2. Ahora que sabemos que la BD existe, probamos la conexión real del Pool principal
    await pool.query('SELECT NOW()');
    
    console.log(`
==================================================================
✨ [EpicaSoft]: ¡CONEXIÓN EXITOSA CON POSTGRESQL REAL!
📦 Base de datos "sos_mascotas" conectada en el puerto 5432
==================================================================
`);

    usandoSimulador = false;
    return { success: true };

  } catch (err) {
    usandoSimulador = true;
    console.log(`
==================================================================
⚠️ [AVISO]: Hubo un problema al conectar a la base física
🧪 El sistema cayó en MODO SIMULADOR
==================================================================
`);
    console.error('Detalle técnico del error:', err.message);
    
    // Lanzamos el error para que app.js sepa que falló y monte su propio catch de contingencia
    throw err; 
  }
};

// Exportación limpia para tus controladores
module.exports = {
  initialize,
  query: async (text, params) => {
    if (usandoSimulador) {
      return { rows: [] };
    }
    return pool.query(text, params);
  },
  isSimulated: () => usandoSimulador,
  getPool: () => pool
};