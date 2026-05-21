const db = require('../config/db');

const mascotasMock = [
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
    tamanio: "Pequeno",
    edad_estimada: "5 meses",
    fotos: ["https://picsum.photos/500/500?random=2"],
    salud: "En tratamiento por otitis",
    estado: "Disponible",
    ubicacion: "Moron, Buenos Aires",
    descripcion: "Rescatado de una colonia, muy mimoso.",
    requisitos_adopcion: "Proteccion en ventanas con redes."
  }
];

exports.obtenerMascotas = async (req, res, next) => {
  try {
    if (db.isSimulated()) {
      console.log('[Modo Simulador] Enviando lista completa de mascotas al muro.');

      return res.status(200).json(mascotasMock);
    }

    const { rows } = await db.query(
      'SELECT * FROM mascotas ORDER BY id DESC'
    );

    return res.status(200).json(rows);

  } catch (error) {
    next(error);
  }
};

exports.crearMascota = async (req, res, next) => {
  try {
    const { nombre, especie, sexo, tamanio } = req.body;

    if (!nombre || !especie || !sexo || !tamanio) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios.'
      });
    }

    if (db.isSimulated()) {
      const nuevaMascota = {
        id: mascotasMock.length + 101,
        nombre,
        especie,
        sexo,
        tamanio,
        estado: 'Disponible'
      };

      mascotasMock.push(nuevaMascota);

      return res.status(201).json({
        mensaje: 'Mascota guardada en simulador',
        mascota: nuevaMascota
      });
    }

    const queryTexto = `
      INSERT INTO mascotas
      (nombre, especie, sexo, tamanio, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const valores = [
      nombre,
      especie,
      sexo,
      tamanio,
      'Disponible'
    ];

    const { rows } = await db.query(queryTexto, valores);

    return res.status(201).json({
      mensaje: 'Mascota guardada en Base de Datos real',
      mascota: rows[0]
    });

  } catch (error) {
    next(error);
  }
};