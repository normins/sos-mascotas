const db = require('../config/db');

// Lista temporal de mascotas en memoria para el modo simulador
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

// Obtener mascotas con filtro inteligente
exports.obtenerMascotas = async (req, res, next) => {
  try {
    // 🔍 Capturar los filtros opcionales que viajan en la URL (?especie=...&sexo=...&localidad=...)
    const { especie, sexo, localidad } = req.query;

    // Comportamiento en modo simulador 
    if (db.isSimulated()) {
      console.log('[Mascotas Simulador] Aplicando filtros:', req.query);

      // Empezamos con la lista completa de mascotas simuladas
      let resultadoSimulado = [...mascotasMock];

      // Filtrar en memoria 
      if (especie) {
        resultadoSimulado = resultadoSimulado.filter(m => m.especie.toLowerCase() === especie.toLowerCase().trim());
      }
      if (sexo) {
        resultadoSimulado = resultadoSimulado.filter(m => m.sexo.toLowerCase() === sexo.toLowerCase().trim());
      }
      if (localidad) {
        resultadoSimulado = resultadoSimulado.filter(m => m.localidad.toLowerCase() === localidad.toLowerCase().trim());
      } 

      return res.status(200).json({
        mensaje: "Lista de mascotas (Modo Simulador - Filtrada)",
        total: resultadoSimulado.length,
        mascotas: resultadoSimulado
      });
    }

    // ==========================================
    //  COMPORTAMIENTO EN BASE DE DATOS REAL
    // ==========================================
    // Iniciar la consulta base de SQL
    let queryTexto = 'SELECT * FROM mascotas WHERE 1=1';
    const queryValores = [];
    let contadorParametros = 1;

    // Construir dinámicamente el WHERE de SQL según lo que pida la URL
    if (especie) {
      queryTexto += ` AND LOWER(especie) = $${contadorParametros}`;
      queryValores.push(especie.toLowerCase().trim());
      contadorParametros++;
    }
    if (sexo) {
      queryTexto += ` AND LOWER(sexo) = $${contadorParametros}`;
      queryValores.push(sexo.toLowerCase().trim());
      contadorParametros++;
    }
    if (localidad) {
      queryTexto += ` AND LOWER(localidad) = $${contadorParametros}`;
      queryValores.push(localidad.toLowerCase().trim());
      contadorParametros++;
    }

    // Ordenar para que las últimas cargadas aparezcan primero
    queryTexto += ' ORDER BY id DESC';

    const { rows } = await db.query(queryTexto, queryValores);

    return res.status(200).json({
      mensaje: "Lista de mascotas (Base de Datos Real - Filtrada)",
      total: rows.length,
      mascotas: rows
    });
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