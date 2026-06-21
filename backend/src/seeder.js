const db = require('./config/db');

// SIMULADOR DE DATOS SEMILLA (PLAN DE CONTINGENCIA)
exports.inicializarDatosSemilla = () => {
  console.log("\n [Seeder] Poblando memoria RAM con datos de contingencia...");

// 1. Usuarios Semilla reales con contraseñas encriptadas de tu proyecto
  global.usuariosCompartidos = [
  { 
    id: 1, 
    nombre: "Admin SOS", 
    email: "admin@sosmascotas.org", 
    password: "$2b$10$$2b$10$JkYOusKZOO7rT24Zt1OZJeX14UQlHyR1Soz9UNHZA1TSAmlWr5R/W",
    
    rol: "admin" 
  },
  { 
    id: 2, 
    nombre: "Juan Adoptante", 
    email: "juan@correo.com", 
    password: "$2b$10$$2b$10$JkYOusKZOO7rT24Zt1OZJeX14UQlHyR1Soz9UNHZA1TSAmlWr5R/W",
    rol: "adoptante" 
  }
];

// 2. Mascotas Semilla reales de tu proyecto
  global.mascotasCompartidas = [
  {
    id: 101,
    nombre: "Luna",
    especie: "Perro",
    sexo: "Hembra",
    tamanio: "Mediano",
    edad_estimada: "2 anos",
    fotos: ["https://placedog.net/500/500?id=1"],
    salud: "Vacunada y desparasitada",
    estado: "Disponible",
    ubicacion: "Castelar, Buenos Aires",
    descripcion: "Muy juguetona, ideal para familias con ninos.",
    requisitos_adopcion: "Patio cercado, compromiso de castracion."
  },
  {
    id: 102,
    nombre: "Simba",
    especie: "Gato",
    sexo: "Macho",
    tamanio: "Pequeño",
    edad_estimada: "5 meses",
    fotos: ["https://picsum.photos/500/500?random=2"],
    salud: "En tratamiento por otitis",
    estado: "Disponible",
    ubicacion: "Morón, Buenos Aires",
    descripcion: "Rescatado de una colonia, muy mimoso.",
    requisitos_adopcion: "Protección en ventanas con redes."
  }
];

  // 3. Solicitudes de Adopción Semilla (Circuitos listos para probar)
  global.adopcionesCompartidas = [
    { id: 1, mascota_id: 101, usuario_id: 2, mensaje: "Tengo patio grande para Luna.", estado: "Pendiente", fecha_creacion: new Date().toISOString() },
  ];

  // 4. Reportes Comunitarios de Emergencia Semilla
  global.reportesCompartidos = [
    { id: 1, tipoReporte: "Extravío", descripcion: "Caniche blanco zona plaza central. Collar rojo.", anonimo: false, estado: "Pendiente", fecha_creacion: new Date().toISOString() },
    { id: 2, tipoReporte: "Maltrato", descripcion: "Ovejero amarrado en balcon sin agua.", anonimo: true, estado: "En Revision", fecha_creacion: new Date().toISOString() }
  ];

  console.log("[Seeder] ¡Sistema inicializado con éxito! Listo para la defensa.");
};


exports.inicializarDatosPostgres = async () => {
  try {

    // Usuarios
    const usuarios = await db.query('SELECT COUNT(*) FROM usuario');

    if (parseInt(usuarios.rows[0].count) === 0) {

      await db.query(`
        INSERT INTO usuario (nombre, email, password, rol)
        VALUES
        (
          'Admin SOS',
          'admin@sosmascotas.org',
          '$2b$10$JkYOusKZOO7rT24Zt1OZJeX14UQlHyR1Soz9UNHZA1TSAmlWr5R/W',
          'admin'
        ),
        (
          'Juan Adoptante',
          'juan@correo.com',
          '$2b$10$JkYOusKZOO7rT24Zt1OZJeX14UQlHyR1Soz9UNHZA1TSAmlWr5R/W',
          'adoptante'
        )
      `);

      console.log('[Seeder] Usuarios semilla cargados.');
    }


    // Mascotas
    const mascotas = await db.query('SELECT COUNT(*) FROM mascotas');

    if (parseInt(mascotas.rows[0].count) === 0) {
      
      
      const admin = await db.query(
  "SELECT id FROM usuario WHERE email = 'admin@sosmascotas.org'"
);

const adminId = admin.rows[0].id;


await db.query(`
INSERT INTO mascotas
(nombre, especie, sexo, edad, tamanio, estado, descripcion, usuario_id)
VALUES
(
  'Luna',
  'Perro',
  'Hembra',
  2,
  'Mediano',
  'Disponible',
  'Muy juguetona, ideal para familias con niños.',
  $1
),
(
  'Simba',
  'Gato',
  'Macho',
  1,
  'Pequeño',
  'Disponible',
  'Rescatado de una colonia, muy mimoso.',
  $1
)
`, [adminId]);

      console.log('[Seeder] Mascotas semilla cargadas.');
    }

  } catch (err) {
    console.error('[Seeder] Error cargando datos semilla:', err.message);
  }
};