const db = require('../config/db');

let mascotasMock = global.mascotasCompartidas || [];
let adopcionesMock = global.adopcionesCompartidas || [];

// .............................................................
// *** Obtener mascotas con filtro inteligente
// .............................................................
exports.obtenerMascotas = async (req, res, next) => {
  try {
    // 🔍 Capturar los filtros opcionales que viajan en la URL (?especie=...&sexo=...&localidad=...)
    const { especie, sexo, localidad } = req.query;

    // Comportamiento en modo simulador 
    if (db.isSimulated()) {
      let mascotasMock = global.mascotasCompartidas || [];
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
      console.log(`[Mascotas Simulador] Muro solicitado. Enviando ${resultadoSimulado.length} mascotas.`);
      return res.status(200).json({
        mensaje: "Lista de mascotas (Modo Simulador - Filtrada)",
        total: resultadoSimulado.length,
        mascotas: resultadoSimulado
      });
    }

    
    // ..........................................
    //  Comportamiento en base de datos real 
    // ..........................................
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


// .............................................................
// *** Crear una nueva mascota (POST)
// .............................................................
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


// .............................................................
// *** Crear solicitud de adopción
// .............................................................
exports.solicitarAdopcion = async (req, res, next) => {
  try {
    const mascotaId = parseInt(req.params.id); // Capturamos el :id de la URL
    const { usuario_id, mensaje_motivacional } = req.body;

    // Validaciones básicas
    if (!usuario_id) {
      return res.status(400).json({ error: "El usuario es obligatorio para realizar la solicitud." });
    }

    // Modo simulador
    if (db.isSimulated()) {
      console.log(`[Adopciones Simulador] Procesando solicitud para Mascota ID: ${mascotaId} de Usuario ID: ${usuario_id}`);

      // Verificamos si la mascota existe en nuestro array de arriba
      const mascotaExiste = mascotasMock.find(m => m.id === mascotaId);
      if (!mascotaExiste) {
        return res.status(404).json({ error: "La mascota indicada no existe." });
      }

      // Creamos el objeto de la solicitud simulada
      const nuevaSolicitud = {
        id: adopcionesMock.length + 1,
        mascota_id: mascotaId,
        usuario_id: parseInt(usuario_id),
        mensaje: mensaje_motivacional || "Sin mensaje adicional.",
        estado: "Pendiente", // Arranca siempre en revisión
        fecha_creacion: new Date().toISOString()
      };

      adopcionesMock.push(nuevaSolicitud);
      global.adopcionesCompartidas = adopcionesMock;

      return res.status(201).json({
        mensaje: "¡Solicitud de adopción registrada con éxito en el Simulador!",
        solicitud: nuevaSolicitud,
        mascota: mascotaExiste.nombre
      });
    }

    // Base de datos real (Dejamos escrita la consulta lista para el futuro)
    // 1. Verificar primero si la mascota existe en PostgreSQL
    const checkMascota = await db.query('SELECT id, nombre FROM mascotas WHERE id = $1', [mascotaId]);
    if (checkMascota.rows.length === 0) {
      return res.status(404).json({ error: "La mascota real indicada no existe en la Base de Datos." });
    }

    // 2. Insertar la solicitud en la tabla de adopciones
    const queryInsert = `
      INSERT INTO adopciones (mascota_id, usuario_id, mensaje, estado) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, mascota_id, usuario_id, mensaje, estado, fecha_creacion
    `;
    const valores = [mascotaId, usuario_id, mensaje_motivacional, 'Pendiente'];
    const { rows } = await db.query(queryInsert, valores);

    return res.status(201).json({
      mensaje: "Solicitud de adopción guardada en Base de Datos real.",
      solicitud: rows[0],
      mascota: checkMascota.rows[0].nombre
    });

  } catch (error) {
    next(error);
  }
};


// .............................................................
// *** Actualizar el estado de una solicitud de adopción (PATCH)
// .............................................................
exports.actualizarEstadoAdopcion = async (req, res, next) => {
  try {
    const solicitudId = parseInt(req.params.solicitudId); // Capturamos el :solicitudId de la URL
    const { nuevo_estado } = req.body; // Recibimos el estado ("Aprobada" o "Rechazada")

    // Validamos que nos manden el estado correcto
    const estadosValidos = ["Aprobada", "Rechazada", "Pendiente"];
    if (!nuevo_estado || !estadosValidos.includes(nuevo_estado)) {
      return res.status(400).json({ 
        error: "Estado no válido. Los estados aceptados son: Aprobada o Rechazada." 
      });
    }
    
    // Comportamiento en modo simulador (actualizamos el estado en el array de adopcionesMock)
    if (db.isSimulated()) {
      console.log(`[Adopciones Simulador] Intentando actualizar Solicitud ID: ${solicitudId} a: ${nuevo_estado}`);

      // Buscamos la solicitud en nuestro array simulado
      const solicitud = adopcionesMock.find(a => a.id === solicitudId);
      
      if (!solicitud) {
        return res.status(404).json({ error: "La solicitud de adopción indicada no existe en el simulador." });
      }

      // Cambiamos el estado en memoria RAM
      solicitud.estado = nuevo_estado;
      
      // Actualizamos la variable compartida para que el controlador de usuarios también vea el cambio
      global.adopcionesCompartidas = adopcionesMock;

      return res.status(200).json({
        mensaje: `¡Estado de la solicitud #${solicitudId} actualizado con éxito en el Simulador!`,
        solicitud: solicitud
      });
    }
    
    // Comportamiento en base de datos real (actualizamos el estado en la tabla de adopciones de PostgreSQL)
    const queryUpdate = `
      UPDATE adopciones 
      SET estado = $1 
      WHERE id = $2 
      RETURNING id, mascota_id, usuario_id, mensaje, estado, fecha_creacion
    `;
    
    const { rows } = await db.query(queryUpdate, [nuevo_estado, solicitudId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "La solicitud real indicada no existe en la Base de Datos." });
    }

    return res.status(200).json({
      mensaje: "Estado de adopción actualizado en Base de Datos real.",
      solicitud: rows[0]
    });

  } catch (error) {
    next(error);
  }
};

// ELIMINAR / CANCELAR UNA SOLICITUD DE ADOPCIÓN (DELETE)
exports.cancelarAdopcion = async (req, res, next) => {
  try {
    const solicitudId = parseInt(req.params.solicitudId);

    // ..........................................
    // COMPORTAMIENTO EN MODO SIMULADOR
    // ..........................................
    if (db.isSimulated()) {
      console.log(`[Adopciones Simulador] Intentando dar de baja la Solicitud ID: ${solicitudId}`);

      // Buscamos la posición de la solicitud en el array
      const indice = adopcionesMock.findIndex(a => a.id === solicitudId);

      if (indice === -1) {
        return res.status(404).json({ error: "La solicitud que deseas cancelar no existe en el simulador." });
      }

      // En vez de borrarla por completo (lo que alteraría los IDs de los demás), 
      // la buena práctica es cambiar su estado a "Cancelada"
      adopcionesMock[indice].estado = "Cancelada";

      // Sincronizamos la memoria compartida con usuarios
      global.adopcionesCompartidas = adopcionesMock;

      return res.status(200).json({
        mensaje: `¡Solicitud de adopción #${solicitudId} cancelada con éxito en el Simulador!`,
        solicitud: adopcionesMock[indice]
      });
    }

    // ...........................................
    // COMPORTAMIENTO EN BASE DE DATOS REAL
    // ...........................................
    // En la base de datos real aplicamos la misma lógica (un UPDATE de estado)
    // Vamos por la opción de actualizar estado a 'Cancelada' para no perder historial de auditoría:
    const queryDelete = `
      UPDATE adopciones 
      SET estado = 'Cancelada' 
      WHERE id = $1 
      RETURNING id, mascota_id, usuario_id, estado
    `;
    
    const { rows } = await db.query(queryDelete, [solicitudId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "La solicitud real especificada no existe en la Base de datos." });
    }

    return res.status(200).json({
      mensaje: "Solicitud de adopción dada de baja en Base de datos real.",
      solicitud: rows[0]
    });

  } catch (error) {
    next(error);
  }
};