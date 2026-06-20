const db = require('../config/db');

let publicacionesMock = global.publicacionesCompartidas || [];

// Crear publicación
exports.crearPublicacion = async (req, res, next) => {
  try {
    const { tipo, descripcion, usuario_id, mascota_id, ubicacion_id, estado } = req.body;

    if (!tipo || !descripcion || !usuario_id || !mascota_id || !ubicacion_id) {
      return res.status(400).json({
        error: 'tipo, descripcion, usuario_id, mascota_id y ubicacion_id son requeridos.'
      });
    }

    if (db.isSimulated()) {
      const nuevaPublicacion = {
        id: publicacionesMock.length + 1,
        tipo,
        descripcion,
        usuario_id,
        mascota_id,
        ubicacion_id,
        estado: estado || 'Activa',
        fecha: new Date().toISOString().split('T')[0],
        fecha_creacion: new Date().toISOString()
      };

      publicacionesMock.push(nuevaPublicacion);
      global.publicacionesCompartidas = publicacionesMock;

      return res.status(201).json({
        mensaje: 'Publicación guardada en simulador',
        publicacion: nuevaPublicacion
      });
    }

    const queryInsert = `
      INSERT INTO publicacion (tipo, descripcion, usuario_id, mascota_id, ubicacion_id, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, tipo, descripcion, usuario_id, mascota_id, ubicacion_id, estado, fecha, fecha_creacion
    `;

    const { rows } = await db.query(queryInsert, [tipo, descripcion, usuario_id, mascota_id, ubicacion_id, estado || 'Activa']);

    return res.status(201).json({
      mensaje: 'Publicación guardada en Base de Datos real',
      publicacion: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener publicaciones por tipo
exports.obtenerPublicacionesPorTipo = async (req, res, next) => {
  try {
    const { tipo } = req.params;

    if (!tipo) {
      return res.status(400).json({ error: 'tipo es requerido.' });
    }

    if (db.isSimulated()) {
      const publicaciones = publicacionesMock.filter(p => p.tipo.toLowerCase() === tipo.toLowerCase());
      return res.status(200).json({
        mensaje: `Publicaciones de tipo "${tipo}" (Simulador)`,
        total: publicaciones.length,
        publicaciones
      });
    }

    const querySelect = `
      SELECT p.*, m.nombre as mascota_nombre, m.especie, u.nombre as usuario_nombre
      FROM publicacion p
      JOIN mascota m ON p.mascota_id = m.id
      JOIN usuario u ON p.usuario_id = u.id
      WHERE LOWER(p.tipo) = LOWER($1)
      ORDER BY p.fecha_creacion DESC
    `;

    const { rows } = await db.query(querySelect, [tipo]);

    return res.status(200).json({
      mensaje: `Publicaciones de tipo "${tipo}" (Base de Datos real)`,
      total: rows.length,
      publicaciones: rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las publicaciones
exports.obtenerTodasPublicaciones = async (req, res, next) => {
  try {
    if (db.isSimulated()) {
      return res.status(200).json({
        mensaje: 'Todas las publicaciones (Simulador)',
        total: publicacionesMock.length,
        publicaciones: publicacionesMock
      });
    }

    const querySelect = `
      SELECT p.*, m.nombre as mascota_nombre, m.especie, u.nombre as usuario_nombre
      FROM publicacion p
      JOIN mascota m ON p.mascota_id = m.id
      JOIN usuario u ON p.usuario_id = u.id
      ORDER BY p.fecha_creacion DESC
    `;

    const { rows } = await db.query(querySelect);

    return res.status(200).json({
      mensaje: 'Todas las publicaciones (Base de Datos real)',
      total: rows.length,
      publicaciones: rows
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar estado de publicación
exports.actualizarEstadoPublicacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!id || !estado) {
      return res.status(400).json({ error: 'id y estado son requeridos.' });
    }

    if (db.isSimulated()) {
      const pub = publicacionesMock.find(p => p.id === parseInt(id));
      if (!pub) {
        return res.status(404).json({ error: 'Publicación no encontrada.' });
      }
      pub.estado = estado;
      return res.status(200).json({ mensaje: 'Estado actualizado', publicacion: pub });
    }

    const queryUpdate = `
      UPDATE publicacion SET estado = $1 WHERE id = $2 RETURNING *
    `;

    const { rows } = await db.query(queryUpdate, [estado, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    return res.status(200).json({
      mensaje: 'Estado de publicación actualizado',
      publicacion: rows[0]
    });
  } catch (error) {
    next(error);
  }
};
