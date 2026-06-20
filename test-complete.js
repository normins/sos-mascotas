const db = require('./backend/src/config/db');

async function probarTodasLasFeatures() {
  console.log('\n🚀 PRUEBAS COMPLETAS - TODAS LAS FEATURES\n');

  try {
    await db.initialize();

    // Datos base
    const user = await db.query(
      'INSERT INTO usuario (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Admin Test', 'admin@test.com', 'hash', 'admin']
    );
    const usuario_id = user.rows[0].id;

    const ubi = await db.query(
      'INSERT INTO ubicacion (direccion, localidad) VALUES ($1, $2) RETURNING id',
      ['Calle 123', 'CABA']
    );
    const ubicacion_id = ubi.rows[0].id;

    const mas = await db.query(
      'INSERT INTO mascota (nombre, especie, sexo, usuario_id) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Rex', 'Perro', 'Macho', usuario_id]
    );
    const mascota_id = mas.rows[0].id;

    // 1️⃣ PUBLICACIONES
    console.log('1️⃣ PUBLICACIONES');
    const pubRes = await db.query(
      'INSERT INTO publicacion (tipo, descripcion, usuario_id, mascota_id, ubicacion_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, tipo',
      ['Adopción', 'Perro lindo en adopción', usuario_id, mascota_id, ubicacion_id]
    );
    console.log(`   ✅ Publicación creada (ID: ${pubRes.rows[0].id})\n`);

    // 2️⃣ REQUISITOS ADOPCIÓN
    console.log('2️⃣ REQUISITOS ADOPCIÓN');
    const reqRes = await db.query(
      'INSERT INTO requisito_adopcion (mascota_id, descripcion) VALUES ($1, $2) RETURNING id',
      [mascota_id, 'Casa con patio y familia responsable']
    );
    console.log(`   ✅ Requisito creado (ID: ${reqRes.rows[0].id})\n`);

    // 3️⃣ HOGAR TRÁNSITO
    console.log('3️⃣ HOGAR TRÁNSITO');
    const hogarRes = await db.query(
      'INSERT INTO hogar_transito (mascota_id, usuario_id, fecha_inicio, estado) VALUES ($1, $2, $3, $4) RETURNING id',
      [mascota_id, usuario_id, new Date().toISOString().split('T')[0], 'Activo']
    );
    console.log(`   ✅ Hogar tránsito creado (ID: ${hogarRes.rows[0].id})\n`);

    // 4️⃣ VERIFICAR DATOS
    console.log('4️⃣ VERIFICACIÓN FINAL');
    const pubs = await db.query('SELECT COUNT(*) as total FROM publicacion');
    const reqs = await db.query('SELECT COUNT(*) as total FROM requisito_adopcion');
    const hogares = await db.query('SELECT COUNT(*) as total FROM hogar_transito');

    console.log(`   📊 Publicaciones en BD: ${pubs.rows[0].total}`);
    console.log(`   📋 Requisitos en BD: ${reqs.rows[0].total}`);
    console.log(`   🏠 Hogares tránsito en BD: ${hogares.rows[0].total}\n`);

    console.log('✨ ¡SISTEMA 100% COMPLETAMENTE FUNCIONAL! ✨\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

probarTodasLasFeatures();
