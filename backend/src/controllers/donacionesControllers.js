const db = require('../config/db');

let donacionesMock = global.donacionesCompartidas || [];

// Crear donación
exports.crearDonacion = async (req, res, next) => {
  try {
    const { usuario_id, monto, medio } = req.body;

    if (!usuario_id || !monto) {
      return res.status(400).json({
        error: 'usuario_id y monto son campos obligatorios.'
      });
    }

    if (monto <= 0) {
      return res.status(400).json({
        error: 'El monto debe ser mayor a 0.'
      });
    }

    // Modo simulador
    if (db.isSimulated()) {
      const nuevaDonacion = {
        id: donacionesMock.length + 1,
        usuario_id,
        monto,
        medio: medio || 'Transferencia',
        fecha: new Date().toISOString().split('T')[0],
        fecha_creacion: new Date().toISOString()
      };

      donacionesMock.push(nuevaDonacion);
      global.donacionesCompartidas = donacionesMock;

      return res.status(201).json({
        mensaje: 'Donación guardada en simulador',
        donacion: nuevaDonacion
      });
    }

    // Base de datos real
    const queryInsert = `
      INSERT INTO donacion (usuario_id, monto, medio)
      VALUES ($1, $2, $3)
      RETURNING id, usuario_id, monto, fecha, medio, fecha_creacion
    `;

    const { rows } = await db.query(queryInsert, [usuario_id, monto, medio || 'Transferencia']);

    return res.status(201).json({
      mensaje: 'Donación guardada en Base de Datos real',
      donacion: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Obtener donaciones de un usuario
exports.obtenerDonacionesUsuario = async (req, res, next) => {
  try {
    const usuario_id = parseInt(req.params.usuario_id);

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido.' });
    }

    // Modo simulador
    if (db.isSimulated()) {
      const donacionesUsuario = donacionesMock.filter(d => d.usuario_id === usuario_id);
      return res.status(200).json({
        mensaje: 'Donaciones del usuario (Simulador)',
        total: donacionesUsuario.length,
        donaciones: donacionesUsuario
      });
    }

    // Base de datos real
    const querySelect = `
      SELECT id, usuario_id, monto, fecha, medio, fecha_creacion
      FROM donacion
      WHERE usuario_id = $1
      ORDER BY fecha_creacion DESC
    `;

    const { rows } = await db.query(querySelect, [usuario_id]);

    return res.status(200).json({
      mensaje: 'Donaciones del usuario (Base de Datos real)',
      total: rows.length,
      donaciones: rows
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las donaciones (admin)
exports.obtenerTodasDonaciones = async (req, res, next) => {
  try {
    // Modo simulador
    if (db.isSimulated()) {
      return res.status(200).json({
        mensaje: 'Todas las donaciones (Simulador)',
        total: donacionesMock.length,
        donaciones: donacionesMock
      });
    }

    // Base de datos real
    const querySelect = `
      SELECT id, usuario_id, monto, fecha, medio, fecha_creacion
      FROM donacion
      ORDER BY fecha_creacion DESC
    `;

    const { rows } = await db.query(querySelect);

    return res.status(200).json({
      mensaje: 'Todas las donaciones (Base de Datos real)',
      total: rows.length,
      donaciones: rows
    });
  } catch (error) {
    next(error);
  }
};
