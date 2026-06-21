const db = require('../config/db');

let voluntariosMock = global.voluntariosCompartidos || [];

// Registrar voluntario
exports.registrarVoluntario = async (req, res, next) => {
  try {
    const { nombre, email, telefono, tipo, disponibilidad } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        error: 'nombre y email son campos obligatorios.'
      });
    }

    // Modo simulador
    if (db.isSimulated()) {
      const nuevoVoluntario = {
        id_usuario: voluntariosMock.length + 1, // 🔧 Sincronizado con id_usuario para el Frontend
        nombre,
        email,
        telefono: telefono || null,
        tipo: tipo || null,
        disponibilidad: disponibilidad || null,
        fecha_creacion: new Date().toISOString()
      };

      voluntariosMock.push(nuevoVoluntario);
      global.voluntariosCompartidos = voluntariosMock;

      return res.status(201).json({
        mensaje: 'Voluntario registrado en simulador',
        voluntario: nuevoVoluntario
      });
    }

    // Base de datos real
    const bcrypt = require('bcrypt');
    const passwordTemp = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(passwordTemp, 10);

    const queryUsuario = `
      INSERT INTO usuario (nombre, email, password, rol, telefono)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    // 🔧 Nota: Agregado el teléfono al INSERT de usuario base para que no se pierda en Postgre real
    const { rows: usuarioRows } = await db.query(queryUsuario, [nombre, email, passwordHash, 'voluntario', telefono || null]);
    const usuario_id = usuarioRows[0].id;

    // Luego se registra en la tabla voluntario
    const queryVoluntario = `
      INSERT INTO voluntario (id)
      VALUES ($1)
      RETURNING id
    `;

    await db.query(queryVoluntario, [usuario_id]);

    // Finalmente se registra el tipo de voluntariado si se proporciona
    if (tipo) {
      const queryTipo = `
        INSERT INTO tipo_voluntariado (voluntario_id, nombre, descripcion)
        VALUES ($1, $2, $3)
      `;
      await db.query(queryTipo, [usuario_id, tipo, disponibilidad || null]);
    }

    return res.status(201).json({
      mensaje: 'Voluntario registrado en Base de Datos real',
      voluntario: {
        id_usuario: usuario_id, // 🔧 Sincronizado para el Frontend
        nombre,
        email,
        telefono,
        tipo,
        disponibilidad
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener voluntarios
exports.obtenerVoluntarios = async (req, res, next) => {
  try {
    // Modo simulador
    if (db.isSimulated()) {
      return res.status(200).json({
        mensaje: 'Lista de voluntarios (Simulador)',
        total: voluntariosMock.length,
        voluntarios: voluntariosMock
      });
    }

    // Base de datos real - Impecable mapeo con INNER JOINs
    const querySelect = `
      SELECT u.id as id_usuario, u.nombre, u.email, u.telefono, tv.nombre as tipo, tv.descripcion as disponibilidad
      FROM voluntario v
      INNER JOIN usuario u ON v.id = u.id
      LEFT JOIN tipo_voluntariado tv ON v.id = tv.voluntario_id
      ORDER BY u.fecha_creacion DESC
    `;

    const { rows } = await db.query(querySelect);

    return res.status(200).json({
      mensaje: 'Lista de voluntarios (Base de Datos real)',
      total: rows.length,
      voluntarios: rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener voluntario por ID
exports.obtenerVoluntarioPorId = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'id es requerido.' });
    }

    // Modo simulador
    if (db.isSimulated()) {
      const voluntario = voluntariosMock.find(v => v.id_usuario === id);
      if (!voluntario) {
        return res.status(404).json({ error: 'Voluntario no encontrado.' });
      }
      return res.status(200).json({
        mensaje: 'Voluntario encontrado (Simulador)',
        voluntario
      });
    }

    // Base de datos real
    const querySelect = `
      SELECT u.id as id_usuario, u.nombre, u.email, u.telefono, tv.nombre as tipo, tv.descripcion as disponibilidad
      FROM voluntario v
      INNER JOIN usuario u ON v.id = u.id
      LEFT JOIN tipo_voluntariado tv ON v.id = tv.voluntario_id
      WHERE v.id = $1
    `;

    const { rows } = await db.query(querySelect, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Voluntario no encontrado.' });
    }

    return res.status(200).json({
      mensaje: 'Voluntario encontrado (Base de Datos real)',
      voluntario: rows[0]
    });
  } catch (error) {
    next(error);
  }
};