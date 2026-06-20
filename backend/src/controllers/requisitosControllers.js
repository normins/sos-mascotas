const db = require('../config/db');

let requisitosMock = []; // Resguardo para modo simulador

// 1. POST /api/requisitos - Crear requisito
exports.crearRequisito = async (req, res, next) => {
  try {
    const { mascota_id, descripcion } = req.body;

    if (!mascota_id || !descripcion) {
      return res.status(400).json({ error: "El id de la mascota y la descripción son obligatorios." });
    }

    if (db.isSimulated()) {
      const nuevoRequisito = {
        id: requisitosMock.length + 1,
        mascota_id: parseInt(mascota_id),
        descripcion,
        fecha_creacion: new Date().toISOString()
      };
      requisitosMock.push(nuevoRequisito);
      return res.status(201).json({ mensaje: "Requisito guardado en simulador", requisito: nuevoRequisito });
    }

    const queryInsert = `
      INSERT INTO requisito_adopcion (mascota_id, descripcion) 
      VALUES ($1, $2) 
      RETURNING id, mascota_id, descripcion, fecha_creacion
    `;
    const { rows } = await db.query(queryInsert, [mascota_id, descripcion]);
    return res.status(201).json({ mensaje: "Requisito creado en la Base de Datos real", requisito: rows[0] });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/requisitos - Obtener todos
exports.obtenerTodosRequisitos = async (req, res, next) => {
  try {
    if (db.isSimulated()) {
      return res.status(200).json({ mensaje: "Todos los requisitos (Simulador)", requisitos: requisitosMock });
    }

    const { rows } = await db.query('SELECT id, mascota_id, descripcion, fecha_creacion FROM requisito_adopcion ORDER BY id ASC');
    return res.status(200).json({ mensaje: "Todos los requisitos obtenidos de la Base de Datos real", requisitos: rows });
  } catch (error) {
    next(error);
  }
};

// 3. GET /api/requisitos/mascota/:mascota_id - Obtener por mascota
exports.obtenerRequisitosMascota = async (req, res, next) => {
  try {
    const mascotaId = parseInt(req.params.mascota_id);

    if (db.isSimulated()) {
      const filtrados = requisitosMock.filter(r => r.mascota_id === mascotaId);
      return res.status(200).json({ mensaje: "Requisitos de la mascota (Simulador)", requisitos: filtrados });
    }

    const querySelect = `
      SELECT id, mascota_id, descripcion, fecha_creacion 
      FROM requisito_adopcion 
      WHERE mascota_id = $1 
      ORDER BY id ASC
    `;
    const { rows } = await db.query(querySelect, [mascotaId]);
    return res.status(200).json({ mensaje: "Requisitos obtenidos de la Base de Datos real", requisitos: rows });
  } catch (error) {
    next(error);
  }
};

// 4. DELETE /api/requisitos/:id - Eliminar requisito
exports.eliminarRequisito = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (db.isSimulated()) {
      requisitosMock = requisitosMock.filter(r => r.id !== id);
      return res.status(200).json({ mensaje: "Requisito eliminado en simulador" });
    }

    const queryDelete = 'DELETE FROM requisito_adopcion WHERE id = $1 RETURNING *';
    const { rows } = await db.query(queryDelete, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "El requisito no existe en la Base de Datos." });
    }

    return res.status(200).json({ mensaje: "Requisito eliminado en Base de Datos real", requisito: rows[0] });
  } catch (error) {
    next(error);
  }
};