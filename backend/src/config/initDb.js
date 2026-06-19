// initDb.js - Inicialización automática de tablas en PostgreSQL

const { Pool } = require('pg');

const asegurarBaseDeDatosExiste = async () => {
  // Creamos un pool temporal conectado a la base de datos por defecto 'postgres'
  const poolTemporal = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres2026',
    port: 5432,
    database: 'postgres', // Base de datos por defecto para poder conectarnos
  });

  const dbName = 'sos_mascotas';

  try {
    // Verificar si la base de datos ya existe
    const res = await poolTemporal.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`\n La base de datos "${dbName}" no existe. Creándola...`);
      await poolTemporal.query(`CREATE DATABASE ${dbName}`);
      console.log(` Base de datos "${dbName}" creada con éxito.`);
    } else {
      console.log(`\n La base de datos "${dbName}" ya existe.`);
    }
  } catch (err) {
    console.error(' Error al verificar/crear la base de datos:', err.message);
    throw err;
  } finally {
    // Cerramos la conexión temporal obligatoriamente
    await poolTemporal.end();
  }
};

const crearTablasAutomaticamente = async (pool) => {
  try {
    // --- NUEVO: Ejecutamos la verificación/creación de la BD antes de las tablas ---
    await asegurarBaseDeDatosExiste();

    console.log('\n [InitDB] Verificando e inicializando estructura de base de datos...\n');

    // Array de queries en orden (respetando dependencias de FK)
    const queries = [
      // 1. TABLA BASE: Usuario
      `CREATE TABLE IF NOT EXISTS usuario (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 2. Administrador (hereda de Usuario)
      `CREATE TABLE IF NOT EXISTS administrador (
        id SERIAL PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE
      )`,

      // 3. Voluntario (hereda de Usuario)
      `CREATE TABLE IF NOT EXISTS voluntario (
        id SERIAL PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE
      )`,

      // 4. PerfilAdopcion
      `CREATE TABLE IF NOT EXISTS perfil_adopcion (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
        tipo_vivienda VARCHAR(100),
        tiene_patio BOOLEAN,
        experiencia TEXT,
        otras_mascotas BOOLEAN,
        preferencia_tamanio VARCHAR(50),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 5. Donacion
      `CREATE TABLE IF NOT EXISTS donacion (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
        monto NUMERIC(10, 2) NOT NULL,
        fecha DATE DEFAULT CURRENT_DATE,
        medio VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 6. Ubicacion (sin FKs)
      `CREATE TABLE IF NOT EXISTS ubicacion (
        id SERIAL PRIMARY KEY,
        direccion VARCHAR(255) NOT NULL,
        localidad VARCHAR(100) NOT NULL,
        referencia TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 7. Mascota
      `CREATE TABLE IF NOT EXISTS mascota (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        especie VARCHAR(50) NOT NULL,
        sexo VARCHAR(20),
        edad INTEGER,
        tamanio VARCHAR(50),
        estado VARCHAR(100),
        descripcion TEXT,
        usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 8. Publicacion
      `CREATE TABLE IF NOT EXISTS publicacion (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(100) NOT NULL,
        descripcion TEXT NOT NULL,
        fecha DATE DEFAULT CURRENT_DATE,
        estado VARCHAR(100),
        usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
        mascota_id INTEGER NOT NULL REFERENCES mascota(id) ON DELETE CASCADE,
        ubicacion_id INTEGER NOT NULL REFERENCES ubicacion(id) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 9. Interes
      `CREATE TABLE IF NOT EXISTS interes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
        mascota_id INTEGER NOT NULL REFERENCES mascota(id) ON DELETE CASCADE,
        fecha DATE DEFAULT CURRENT_DATE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 10. Match (Enuelto en comillas por ser palabra reservada)
      `CREATE TABLE IF NOT EXISTS "match" (
        id SERIAL PRIMARY KEY,
        interes_id INTEGER NOT NULL UNIQUE REFERENCES interes(id) ON DELETE CASCADE,
        fecha DATE DEFAULT CURRENT_DATE,
        estado VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 11. SolicitudAdopcion (Actualizado el FK hacia "match")
      `CREATE TABLE IF NOT EXISTS solicitud_adopcion (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
        mascota_id INTEGER NOT NULL REFERENCES mascota(id) ON DELETE CASCADE,
        administrador_id INTEGER REFERENCES administrador(id) ON DELETE SET NULL,
        match_id INTEGER REFERENCES "match"(id) ON DELETE SET NULL,
        fecha DATE DEFAULT CURRENT_DATE,
        estado VARCHAR(100),
        observaciones TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 12. RequisitoAdopcion
      `CREATE TABLE IF NOT EXISTS requisito_adopcion (
        id SERIAL PRIMARY KEY,
        mascota_id INTEGER NOT NULL REFERENCES mascota(id) ON DELETE CASCADE,
        descripcion TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 13. HogarTransito
      `CREATE TABLE IF NOT EXISTS hogar_transito (
        id SERIAL PRIMARY KEY,
        mascota_id INTEGER NOT NULL REFERENCES mascota(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE,
        estado VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 14. TipoVoluntariado
      `CREATE TABLE IF NOT EXISTS tipo_voluntariado (
        id SERIAL PRIMARY KEY,
        voluntario_id INTEGER NOT NULL REFERENCES voluntario(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // Ejecutar cada query en secuencia
    for (let i = 0; i < queries.length; i++) {
      try {
        await pool.query(queries[i]);
        const numeroTabla = i + 1;
        console.log(` Tabla ${numeroTabla}/14 verificada/creada`);
      } catch (err) {
        console.error(` Error en query ${i + 1}:`, err.message);
        throw err;
      }
    }

    console.log(`
==================================================================
 [InitDB] ¡Base de datos inicializada exitosamente!
 Todas las 14 tablas y relaciones están listas
==================================================================
    `);

    return {
      success: true,
      mensaje: 'Base de datos inicializada correctamente'
    };

  } catch (err) {
    console.error(`
==================================================================
 [InitDB] Error durante la inicialización de la BD
Detalle: ${err.message}
Sistema continuará en MODO SIMULADOR
==================================================================
    `);
    return {
      success: false,
      mensaje: `Error inicializando BD: ${err.message}`
    };
  }
};

module.exports = {
  crearTablasAutomaticamente
};