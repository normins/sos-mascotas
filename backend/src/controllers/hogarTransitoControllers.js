const db = require('../config/db');

let hogaresmock = global.hogaresTransitoCompartidos || [];

// Crear hogar tránsito
exports.crearHogarTransito = async (req, res, next) => {
  try {
    const { mascota_id, usuario_id, fecha_inicio, fecha_fin, estado } = req.body;

    if (!mascota_id || !usuario_id || !fecha_inicio) {
      return res.status(400).json({
        error: 'mascota_id, usuario_id y fecha_inicio son campos obligatorios.'
      });
    }

    if (db.isSimulated()) {
      const nuevoHogar = {
        id: hogaresmock.length + 1,
        mascota_id,
        usuario_id,
        fecha_inicio,
        fecha_fin: fecha_fin || null,
        estado: estado || 'Activo',
        fecha_creacion: new Date().toISOString()
      };

      hogaresmock.push(nuevoHogar);
      global.hogaresTransitoCompartidos = hogaresmock;

      return res.status(201).json({
        mensaje: 'Hogar tránsito registrado en simulador',
        hogar: nuevoHogar
      });
    }

    const queryInsert = `
      INSERT INTO hogar_transito (mascota_id, usuario_id, fecha_inicio, fecha_fin, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, mascota_id, usuario_id, fecha_inicio, fecha_fin, estado, fecha_creacion
    `;

    const { rows } = await db.query(queryInsert, [mascota_id, usuario_id, fecha_inicio, fecha_fin || null, estado || 'Activo']);

    return res.status(201).json({
      mensaje: 'Hogar tránsito registrado en Base de Datos real',
      hogar: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener hogares activos de un usuario
exports.obtenerHogaresUsuario = async (req, res, next) => {
  try {
    const { usuario_id } = req.params;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido.' });
    }

    if (db.isSimulated()) {
      const hogares = hogaresmock.filter(h => h.usuario_id === parseInt(usuario_id));
      return res.status(200).json({
        mensaje: 'Hogares del usuario (Simulador)',
        total: hogares.length,
        hogares
      });
    }

    const querySelect = `
      SELECT ht.*, m.nombre as mascota_nombre, m.especie, u.nombre as usuario_nombre
      FROM hogar_transito ht
      JOIN mascota m ON ht.mascota_id = m.id
      JOIN usuario u ON ht.usuario_id = u.id
      WHERE ht.usuario_id = $1
      ORDER BY ht.fecha_inicio DESC
    `;

    const { rows } = await db.query(querySelect, [usuario_id]);

    return res.status(200).json({
      mensaje: 'Hogares del usuario (Base de Datos real)',
      total: rows.length,
      hogares: rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener hogares de una mascota
exports.obtenerHogaresMascota = async (req, res, next) => {
  try {
    const { mascota_id } = req.params;

    if (!mascota_id) {
      return res.status(400).json({ error: 'mascota_id es requerido.' });
    }

    if (db.isSimulated()) {
      const hogares = hogaresmock.filter(h => h.mascota_id === parseInt(mascota_id));
      return res.status(200).json({
        mensaje: 'Hogares de mascota (Simulador)',
        total: hogares.length,
        hogares
      });
    }

    const querySelect = `
      SELECT ht.*, m.nombre as mascota_nombre, u.nombre as usuario_nombre
      FROM hogar_transito ht
      JOIN mascota m ON ht.mascota_id = m.id
      JOIN usuario u ON ht.usuario_id = u.id
      WHERE ht.mascota_id = $1
      ORDER BY ht.fecha_inicio DESC
    `;

    const { rows } = await db.query(querySelect, [mascota_id]);

    return res.status(200).json({
      mensaje: 'Hogares de mascota (Base de Datos real)',
      total: rows.length,
      hogares: rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los hogares tránsito
exports.obtenerTodosHogares = async (req, res, next) => {
  try {
    if (db.isSimulated()) {
      return res.status(200).json({
        mensaje: 'Todos los hogares tránsito (Simulador)',
        total: hogaresmock.length,
        hogares: hogaresmock
      });
    }

    const querySelect = `
      SELECT ht.*, m.nombre as mascota_nombre, m.especie, u.nombre as usuario_nombre
      FROM hogar_transito ht
      JOIN mascota m ON ht.mascota_id = m.id
      JOIN usuario u ON ht.usuario_id = u.id
      ORDER BY ht.fecha_inicio DESC
    `;

    const { rows } = await db.query(querySelect);

    return res.status(200).json({
      mensaje: 'Todos los hogares tránsito (Base de Datos real)',
      total: rows.length,
      hogares: rows
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar estado o fecha de fin
exports.actualizarHogarTransito = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, fecha_fin } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id es requerido.' });
    }

    if (db.isSimulated()) {
      const hogar = hogaresmock.find(h => h.id === parseInt(id));
      if (!hogar) {
        return res.status(404).json({ error: 'Hogar no encontrado.' });
      }
      if (estado) hogar.estado = estado;
      if (fecha_fin) hogar.fecha_fin = fecha_fin;
      return res.status(200).json({ mensaje: 'Hogar actualizado', hogar });
    }

    const queryUpdate = `
      UPDATE hogar_transito SET estado = COALESCE($1, estado), fecha_fin = COALESCE($2, fecha_fin) WHERE id = $3 RETURNING *
    `;

    const { rows } = await db.query(queryUpdate, [estado || null, fecha_fin || null, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hogar no encontrado.' });
    }

    return res.status(200).json({
      mensaje: 'Hogar tránsito actualizado',
      hogar: rows[0]
    });
  } catch (error) {
    next(error);
  }
};
