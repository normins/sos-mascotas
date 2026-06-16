// db.js

// db.js - Conexión directa y forzada al puerto real
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sos_mascotas',
  password: 'Mushu', 
  port: 5432,        
});

let usandoSimulador = false;

// Forzar la verificación física de inmediato
pool
  .query('SELECT NOW()')
  .then(() => {
    console.log(`
==================================================================
✨ [EpicaSoft]: ¡CONEXIÓN EXITOSA CON POSTGRESQL REAL!
📦 Base de datos "sos_mascotas" conectada en el puerto 5432
==================================================================
`);
    usandoSimulador = false;
  })
  .catch((err) => {
    usandoSimulador = true;
    console.log(`
==================================================================
⚠️ [AVISO]: Hubo un problema al conectar a la base física
🧪 El sistema cayó en MODO SIMULADOR
==================================================================
`);
    console.error('Detalle técnico del error:', err.message);
  });

// Exportación limpia para tus controladores
module.exports = {
  query: async (text, params) => {
    if (usandoSimulador) {
      return { rows: [] };
    }
    return pool.query(text, params);
  },
  isSimulated: () => usandoSimulador
};