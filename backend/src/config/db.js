// db.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sos_mascotas',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

let usandoSimulador = false;

// Verificar conexión
pool
  .query('SELECT NOW()')
  .then(() => {
    console.log(`
==================================================================
✨ [EpicaSoft]: Conexión establecida con PostgreSQL local
📦 Base de datos "sos_mascotas" lista para operar
==================================================================
`);
  })
  .catch((err) => {
    usandoSimulador = true;

    console.log(`
==================================================================
⚠️ [AVISO]: La base de datos "sos_mascotas" aún no está creada
🧪 Backend ejecutándose en MODO SIMULADOR
📄 Se usarán datos temporales
==================================================================
`);

    console.error('Detalle del error:', err.message);
  });

module.exports = {
  query: async (text, params) => {
    if (usandoSimulador) {
      return { rows: [] };
    }

    return pool.query(text, params);
  },

  isSimulated: () => usandoSimulador,
};