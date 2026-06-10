const db = require('../config/db');

// Array en memoria para el simulador de reportes comunitarios
let reportesMock = [
  { id: 1, tipoReporte: "Extravío", descripcion: "Se busca a un caniche blanco por la zona de la plaza central. Tiene collar rojo.", anonimo: false, estado: "Pendiente", fecha_creacion: new Date().toISOString() },
  { id: 2, tipoReporte: "Maltrato", descripcion: "Perrito atado en un balcón sin agua ni sombra hace dos dias.", anonimo: true, estado: "En Revision", fecha_creacion: new Date().toISOString() }
];

// 1. CREAR UN NUEVO REPORTE (POST)
exports.crearReporte = async (req, res, next) => {
  try {
    const { tipoReporte, descripcion, anonimo } = req.body;

    // Validaciones básicas obligatorias
    if (!tipoReporte || !descripcion) {
      return res.status(400).json({ error: "El tipo de reporte y la descripción son campos obligatorios." });
    }

    // ...........................................
    // MODO SIMULADOR
    // ...........................................
    if (db.isSimulated()) {
      console.log(`[Reportes Simulador] Recibiendo alerta comunitaria de tipo: ${tipoReporte}`);

      const nuevoReporte = {
        id: reportesMock.length + 1,
        tipoReporte,
        descripcion,
        anonimo: anonimo === undefined ? false : anonimo, // Por defecto falso si no se envia
        estado: "Pendiente", // Todo reporte nace en estado pendiente
        fecha_creacion: new Date().toISOString()
      };

      reportesMock.push(nuevoReporte);

      return res.status(201).json({
        mensaje: "¡Alerta comunitaria registrada con éxito en el Simulador!",
        reporte: nuevoReporte
      });
    }

    // .........................................
    // COMPORTAMIENTO EN BASE DE DATOS REAL
    // .........................................
    const queryInsert = `
      INSERT INTO reportes (tipo_reporte, descripcion, anonimo, estado) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, tipo_reporte as "tipoReporte", descripcion, anonimo, estado, fecha_creacion
    `;
    const valores = [tipoReporte, descripcion, anonimo || false, 'Pendiente'];
    const { rows } = await db.query(queryInsert, valores);

    return res.status(201).json({
      mensaje: "Alerta comunitaria guardada en la Base de datos real.",
      reporte: rows[0]
    });

  } catch (error) {
    next(error);
  }
};

// 2. OBTENER TODOS LOS REPORTES (GET)
exports.obtenerReportes = async (req, res, next) => {
  try {
    // ..........................................
    // COMPORTAMIENTO EN MODO SIMULADOR
    // ..........................................
    if (db.isSimulated()) {
      console.log(`[Reportes Simulador] Solicitando lista de reportes activos. Total: ${reportesMock.length}`);
      return res.status(200).json({
        mensaje: "Lista de reportes comunitarios (Modo Simulador)",
        total: reportesMock.length,
        reportes: reportesMock
      });
    }

    // .........................................
    // COMPORTAMIENTO EN BASE DE DATOS REAL
    // .........................................
    const { rows } = await db.query('SELECT id, tipo_reporte as "tipoReporte", descripcion, anonimo, estado, fecha_creacion FROM reportes ORDER BY id DESC');
    
    return res.status(200).json({
      mensaje: "Lista de reportes obtenida de la Base de datos real",
      total: rows.length,
      reportes: rows
    });

  } catch (error) {
    next(error);
  }
};