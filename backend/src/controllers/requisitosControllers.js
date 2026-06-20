const db = require('../config/db');

let requisitosMock = global.requisitosCompartidos || [];

// Crear requisito de adopción
exports.crearRequisito = async (req, res, next) => {
  try {
    const { mascota_id, descripcion } = req.body;

    if (!mascota_id || !descripcion) {
      return res.status(400).json({
        error: 'mascota_id y descripcion son campos obligatorios.'
      });
    }

    if (db.isSimulated()) {
      const nuevoRequisito = {
        id: requisitosMock.length + 1,
        mascota_id,
        descripcion,
        fecha_creacion: new Date().toISOString()
      };

      requisitosMock.push(nuevoRequisito);
      global.requisitosCompartidos = requisitosMock;

      return res.status(201).json({
        mensaje: 'Requisito guardado en simulador',
        requisito: nuevoRequisito
      });
    }

    const queryInsert = `
      INSERT INTO requisito_adopcion (mascota_id, descripcion)
      VALUES ($1, $2)
      RETURNING id, mascota_id, descripcion, fecha_creacion
    `;

    const { rows } = await db.query(queryInsert, [mascota_id, descripcion]);

    return res.status(201).json({
      mensaje: 'Requisito guardado en Base de Datos real',
      requisito: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener requisitos de una mascota
exports.obtenerRequisitosMascota = async (req, res, next) => {
  try {
    const { mascota_id } = req.params;

    if (!mascota_id) {
      return res.status(400).json({ error: 'mascota_id es requerido.' });
    }

    if (db.isSimulated()) {
      const requisitos = requisitosMock.filter(r => r.mascota_id === parseInt(mascota_id));
      return res.status(200).json({
        mensaje: 'Requisitos de mascota (Simulador)',
        total: requisitos.length,
        requisitos
      });
    }

    const querySelect = `
      SELECT ra.*, m.nombre as mascota_nombre
      FROM requisito_adopcion ra
      JOIN mascota m ON ra.mascota_id = m.id
      WHERE ra.mascota_id = $1
      ORDER BY ra.fecha_creacion DESC
    `;

    const { rows } = await db.query(querySelect, [mascota_id]);

    return res.status(200).json({
      mensaje: 'Requisitos de mascota (Base de Datos real)',
      total: rows.length,
      requisitos: rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los requisitos
exports.obtenerTodosRequisitos = async (req, res, next) => {
  try {
    if (db.isSimulated()) {
      return res.status(200).json({
        mensaje: 'Todos los requisitos (Simulador)',
        total: requisitosMock.length,
        requisitos: requisitosMock
      });
    }

    const querySelect = `
      SELECT ra.*, m.nombre as mascota_nombre
      FROM requisito_adopcion ra
      JOIN mascota m ON ra.mascota_id = m.id
      ORDER BY ra.fecha_creacion DESC
    `;

    const { rows } = await db.query(querySelect);

    return res.status(200).json({
      mensaje: 'Todos los requisitos (Base de Datos real)',
      total: rows.length,
      requisitos: rows
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar requisito
exports.eliminarRequisito = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'id es requerido.' });
    }

    if (db.isSimulated()) {
      const index = requisitosMock.findIndex(r => r.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ error: 'Requisito no encontrado.' });
      }
      requisitosMock.splice(index, 1);
      return res.status(200).json({ mensaje: 'Requisito eliminado' });
    }

    const queryDelete = 'DELETE FROM requisito_adopcion WHERE id = $1 RETURNING id';
    const { rows } = await db.query(queryDelete, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Requisito no encontrado.' });
    }

    return res.status(200).json({ mensaje: 'Requisito eliminado' });
  } catch (error) {
    next(error);
  }
};
