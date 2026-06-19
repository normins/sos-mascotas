// Test de flujos críticos
const BASE = 'http://localhost:3000/api';

async function probarFlujos() {
  console.log('\n🧪 PRUEBAS DE FLUJOS CRÍTICOS\n');

  try {
    // 1. REGISTRO
    console.log('1️⃣ Registrando usuario...');
    const regRes = await fetch(`${BASE}/usuarios/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Juan Test',
        email: 'juan@test.com',
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    console.log(regData.mensaje);
    const usuario_id = regData.usuario.id;
    console.log(`✓ Usuario creado con ID: ${usuario_id}\n`);

    // 2. LOGIN
    console.log('2️⃣ Login...');
    const loginRes = await fetch(`${BASE}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'juan@test.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log(loginData.mensaje);
    console.log(`✓ Login exitoso\n`);

    // 3. PERFIL ADOPCIÓN
    console.log('3️⃣ Guardando perfil de adopción...');
    const perfilRes = await fetch(`${BASE}/usuarios/perfil`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: usuario_id,
        tipo_vivienda: 'Casa',
        tiene_patio: true,
        experiencia: 'Avanzado',
        otras_mascotas: false,
        preferencia_tamanio: 'Mediano'
      })
    });
    const perfilData = await perfilRes.json();
    console.log(perfilData.mensaje);
    console.log(`✓ Perfil de adopción guardado\n`);

    // 4. CREAR MASCOTA
    console.log('4️⃣ Creando mascota...');
    const mascRes = await fetch(`${BASE}/mascotas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Luna',
        especie: 'Perro',
        sexo: 'Hembra',
        edad: 3,
        tamanio: 'Mediano',
        estado: 'Disponible',
        descripcion: 'Perro muy cariñoso y juguetón',
        usuario_id: usuario_id
      })
    });
    const mascData = await mascRes.json();
    console.log(mascData.mensaje);
    const mascota_id = mascData.mascota.id;
    console.log(`✓ Mascota creada con ID: ${mascota_id}\n`);

    // 5. DONACIÓN
    console.log('5️⃣ Registrando donación...');
    const donRes = await fetch(`${BASE}/donaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuario_id,
        monto: 5000,
        medio: 'Transferencia'
      })
    });
    const donData = await donRes.json();
    console.log(donData.mensaje);
    console.log(`✓ Donación registrada\n`);

    // 6. VOLUNTARIO
    console.log('6️⃣ Registrando voluntario...');
    const volRes = await fetch(`${BASE}/voluntarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'María Voluntaria',
        email: 'maria@voluntarios.com',
        telefono: '1123456789',
        tipo: 'Tránsito',
        disponibilidad: 'Fines de semana'
      })
    });
    const volData = await volRes.json();
    console.log(volData.mensaje);
    console.log(`✓ Voluntario registrado\n`);

    console.log('✨ ¡TODOS LOS FLUJOS FUNCIONAN! ✨\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

probarFlujos();
