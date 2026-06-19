const db = require('./backend/src/config/db');

async function probarBD() {
  console.log('\n🧪 PRUEBAS DE BD - FLUJOS CRÍTICOS\n');

  try {
    // Inicializar BD
    await db.initialize();

    // 1. USUARIO
    console.log('1️⃣ Creando usuario...');
    const userRes = await db.query(
      'INSERT INTO usuario (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      ['Juan Test', 'juan@test.com', '$2b$10$hashedpass', 'adoptante']
    );
    const usuario_id = userRes.rows[0].id;
    console.log(`✓ Usuario creado (ID: ${usuario_id})\n`);

    // 2. PERFIL ADOPCIÓN
    console.log('2️⃣ Creando perfil de adopción...');
    const perfilRes = await db.query(
      'INSERT INTO perfil_adopcion (usuario_id, tipo_vivienda, tiene_patio, experiencia, otras_mascotas, preferencia_tamanio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [usuario_id, 'Casa', true, 'Avanzado', false, 'Mediano']
    );
    console.log(`✓ Perfil guardado\n`);

    // 3. MASCOTA
    console.log('3️⃣ Creando mascota...');
    const mascRes = await db.query(
      'INSERT INTO mascota (nombre, especie, sexo, edad, tamanio, estado, descripcion, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      ['Luna', 'Perro', 'Hembra', 3, 'Mediano', 'Disponible', 'Muy cariñosa', usuario_id]
    );
    const mascota_id = mascRes.rows[0].id;
    console.log(`✓ Mascota creada (ID: ${mascota_id})\n`);

    // 4. DONACIÓN
    console.log('4️⃣ Creando donación...');
    const donRes = await db.query(
      'INSERT INTO donacion (usuario_id, monto, medio) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, 5000, 'Transferencia']
    );
    console.log(`✓ Donación guardada\n`);

    // 5. VERIFICAR TODO
    console.log('5️⃣ Verificando datos guardados...');
    const usuarios = await db.query('SELECT * FROM usuario WHERE email = $1', ['juan@test.com']);
    const perfiles = await db.query('SELECT * FROM perfil_adopcion WHERE usuario_id = $1', [usuario_id]);
    const mascotas = await db.query('SELECT * FROM mascota WHERE usuario_id = $1', [usuario_id]);
    const donaciones = await db.query('SELECT * FROM donacion WHERE usuario_id = $1', [usuario_id]);

    console.log(`✓ ${usuarios.rows.length} usuario(s) encontrado(s)`);
    console.log(`✓ ${perfiles.rows.length} perfil(es) de adopción`);
    console.log(`✓ ${mascotas.rows.length} mascota(s)`);
    console.log(`✓ ${donaciones.rows.length} donación(es)\n`);

    console.log('✨ ¡TODO FUNCIONA PERFECTO! ✨\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

probarBD();
