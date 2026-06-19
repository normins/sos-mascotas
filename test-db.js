const db = require('./backend/src/config/db');

async function probar() {
  try {
    await db.initialize();

    console.log('\n📋 USUARIOS:');
    const usuarios = await db.query('SELECT * FROM usuario;');
    console.table(usuarios.rows);

    console.log('\n🐕 MASCOTAS:');
    const mascotas = await db.query('SELECT * FROM mascota;');
    console.table(mascotas.rows);

    console.log('\n✅ Base de datos funcionando correctamente');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

probar();
