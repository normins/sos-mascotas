// Mock de datos (Datos de prueba hasta que conectemos la base de datos PostgreSQL)
const mascotasDePrueba = [
  {
    id: 101,
    nombre: "Luna",
    especie: "Perro",
    sexo: "Hembra",
    tamanio: "Mediano",
    edad_estimada: "2 años",
    fotos: ["https://placedog.net/500/500?id=1"],
    salud: "Vacunada y desparasitada",
    estado: "Disponible",
    ubicacion: "Castelar, Buenos Aires",
    descripcion: "Muy juguetona, ideal para familias con niños.",
    requisitos_adopcion: "Patio cercado, compromiso de castración."
  },
  {
    id: 102,
    nombre: "Simba",
    especie: "Gato",
    sexo: "Macho",
    tamanio: "Pequeño",
    edad_estimada: "5 meses",
    fotos: ["https://placekitten.com/500/500?id=2"],
    salud: "En tratamiento por otitis",
    estado: "En tránsito",
    ubicacion: "Morón, Buenos Aires",
    descripcion: "Rescatado de una colonia, muy mimoso.",
    requisitos_adopcion: "Protección en ventanas (redes)."
  }
];

// Obtener todas las mascotas
exports.obtenerMascotas = (req, res) => {
  console.log("Solicitando lista de mascotas para el muro...");
  res.status(200).json(mascotasDePrueba);
};

// Crear una nueva mascota
exports.crearMascota = (req, res) => {
  const nuevaMascota = req.body;
  
  if (!nuevaMascota.nombre || !nuevaMascota.especie) {
    return res.status(400).json({ error: "Faltan datos obligatorios de la mascota" });
  }

  console.log(`Nueva mascota cargada: ${nuevaMascota.nombre}`);
  
  // En el futuro, aquí se insertará en PostgreSQL
  res.status(201).json({
    mensaje: "Mascota registrada correctamente en el sistema",
    mascota: nuevaMascota
  });
};