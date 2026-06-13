// SIMULADOR DE DATOS SEMILLA (PLAN DE CONTINGENCIA)
exports.inicializarDatosSemilla = () => {
  console.log("\n [Seeder] Poblando memoria RAM con datos de contingencia...");

// 1. Usuarios Semilla reales con contraseñas encriptadas de tu proyecto
  global.usuariosCompartidos = [
  { 
    id: 1, 
    nombre: "Admin SOS", 
    email: "admin@sosmascotas.org", 
    password: "$2b$10$7R6Vb4vM2X6qXG8H7KzOueW6vN3hD7r4YeE89r6M5N4y4v4v4v2S",
    
    rol: "admin" 
  },
  { 
    id: 2, 
    nombre: "Juan Adoptante", 
    email: "juan@correo.com", 
    password: "$2b$10$7R6Vb4vM2X6qXG8H7KzOueW6vN3hD7r4YeE89r6M5N4y4v4v4v2S",
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