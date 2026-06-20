const db = require('../config/db');

let mascotasMock = global.mascotasCompartidas || [];
let adopcionesMock = global.adopcionesCompartidas || [];

// .............................................................
// *** Obtener mascotas con filtro inteligente
// .............................................................
exports.obtenerMascotas = async (req, res, next) => {
  try {
    const { especie, sexo } = req.query;

    // Comportamiento en modo simulador 
    if (db.isSimulated()) {
      let mascotasMock = global.mascotasCompartidas || [];
      console.log('[Muro Mascotas] Aplicando filtros de búsqueda:', req.query);

      let resultadoSimulado = [...mascotasMock];

      if (especie) {
        resultadoSimulado = resultadoSimulado.filter(m => m.especie.toLowerCase() === especie.toLowerCase().trim());
      }
      if (sexo) {
        resultadoSimulado = resultadoSimulado.filter(m => m.sexo.toLowerCase() === sexo.toLowerCase().trim());
      }
           
       return res.status(200).json({
        mensaje: "Lista de mascotas recuperado (Modo Simulador)",
        total: resultadoSimulado.length,
        mascotas: resultadoSimulado
      });
    }

    // ..........................................
    //  Comportamiento en base de datos real 
    // ..........................................
    // 💡 IMPORTANTE: Seleccionamos "id AS id_mascota" para que coincida con lo que el frontend espera
    let queryTexto = 'SELECT id AS id_mascota, nombre, especie, sexo, edad, tamanio, estado, descripcion, usuario_id, fecha_creacion FROM mascotas WHERE 1=1';
    const queryValores = [];
    let contadorParametros = 1;

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
    
    // 🔧 CORREGIDO: Cambiado "id_mascota" por la columna real "id"
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
    const { nombre, especie, sexo, edad, tamanio, estado, descripcion, usuario_id } = req.body;

    if (!nombre || !especie || !sexo) {
      return res.status(400).json({
        error: 'Nombre, especie y sexo son campos obligatorios.'
      });
    }

    if (db.isSimulated()) {
      const nuevaMascota = {
        id: mascotasMock.length + 101,
        nombre,
        especie,
        sexo,
        edad: edad || null,
        tamanio: tamanio || null,
        descripcion: descripcion || null,
        estado: estado || 'Disponible',
        usuario_id: usuario_id || 1
      };

      mascotasMock.push(nuevaMascota);
      global.mascotasCompartidas = mascotasMock;

      return res.status(201).json({
        mensaje: 'Mascota guardada en simulador',
        mascota: nuevaMascota
      });
    }

    // 🔧 CORREGIDO: Cambiado de "mascota" a "mascotas" en plural
    const queryTexto = `
      INSERT INTO mascotas
      (nombre, especie, sexo, edad, tamanio, estado, descripcion, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id AS id_mascota, nombre, especie, sexo, edad, tamanio, estado, descripcion, usuario_id
    `;

    const valores = [
      nombre,
      especie,
      sexo,
      edad || null,
      tamanio || null,
      estado || 'Disponible',
      descripcion || null,
      usuario_id || 1
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
    const mascotaId = parseInt(req.params.id); 
    const { usuario_id, mensaje } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: "El usuario es obligatorio para realizar la solicitud." });
    }

    if (db.isSimulated()) {
      console.log(`[Adopciones Simulador] Procesando solicitud para Mascota ID: ${mascotaId} de Usuario ID: ${usuario_id}`);
      let mascotasMock = global.mascotasCompartidas || [];
      let adopcionesMock = global.adopcionesCompartidas || [];

      const mascotaExiste = mascotasMock.find(m => m.id === mascotaId);
      if (!mascotaExiste) {
        return res.status(404).json({ error: "La mascota indicada no existe." });
      }

      const nuevaSolicitud = {
        id: adopcionesMock.length + 1,
        mascota_id: mascotaId,
        usuario_id: parseInt(usuario_id),
        mensaje: mensaje || "Sin mensaje adicional.",
        estado: "Pendiente",
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

    // 🔧 CORREGIDO: Cambiado "id_mascota" por "id AS id_mascota" en la verificación
    const checkMascota = await db.query('SELECT id AS id_mascota, nombre FROM mascotas WHERE id = $1', [mascotaId]);
    if (checkMascota.rows.length === 0) {
      return res.status(404).json({ error: "La mascota real indicada no existe en la Base de Datos." });
    }

    // 🔧 NOTA: Asegurate de mapear correctamente las variables "id_usuario" y "mensaje_motivacional" en tu endpoint de adopciones real si se usan en producción.
    const queryInsert = `
      INSERT INTO solicitud_adopcion (mascota_id, usuario_id, observaciones, estado) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, mascota_id AS id_mascota, usuario_id AS id_usuario, observaciones AS mensaje, estado, fecha_creacion
    `;
    const valores = [mascotaId, usuario_id, mensaje || 'Sin observaciones', 'Pendiente'];
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
    const solicitudId = parseInt(req.params.solicitudId); 
    const { nuevo_estado } = req.body; 

    const estadosValidos = ["Aprobada", "Rechazada", "Pendiente"];
    if (!nuevo_estado || !estadosValidos.includes(nuevo_estado)) {
      return res.status(400).json({ 
        error: "Estado no válido. Los estados aceptados son: Aprobada o Rechazada." 
      });
    }
    
    if (db.isSimulated()) {
      console.log(`[Adopciones Simulador] Intentando actualizar Solicitud ID: ${solicitudId} a: ${nuevo_estado}`);

      const solicitud = adopcionesMock.find(a => a.id === solicitudId);
      
      if (!solicitud) {
        return res.status(404).json({ error: "La solicitud de adopción indicada no existe en el simulador." });
      }

      solicitud.estado = nuevo_estado;
      global.adopcionesCompartidas = adopcionesMock;

      return res.status(200).json({
        mensaje: `¡Estado de la solicitud #${solicitudId} actualizado con éxito en el Simulador!`,
        solicitud: solicitud
      });
    }
    
    const queryUpdate = `
      UPDATE solicitud_adopcion 
      SET estado = $1 
      WHERE id = $2 
      RETURNING id, mascota_id AS id_mascota, usuario_id AS id_usuario, observaciones AS mensaje, estado, fecha_creacion
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

// .............................................................
// *** Eliminar / Cancelar una solicitud de adopción (DELETE)
// .............................................................
exports.cancelarAdopcion = async (req, res, next) => {
  try {
    const solicitudId = parseInt(req.params.solicitudId);

    if (db.isSimulated()) {
      console.log(`[Adopciones Simulador] Intentando dar de baja la Solicitud ID: ${solicitudId}`);
      let adopcionesMock = global.adopcionesCompartidas || [];
      const indice = adopcionesMock.findIndex(a => a.id === solicitudId);

      if (indice === -1) {
        return res.status(404).json({ error: "La solicitud que deseas cancelar no existe en el simulador." });
      }

      adopcionesMock[indice].estado = "Cancelada";
      global.adopcionesCompartidas = adopcionesMock;

      return res.status(200).json({
        mensaje: `¡Solicitud de adopción #${solicitudId} cancelada con éxito en el Simulador!`,
        solicitud: adopcionesMock[indice]
      });
    }

    const queryDelete = `
      UPDATE solicitud_adopcion 
      SET estado = 'Cancelada' 
      WHERE id = $1 
      RETURNING id, mascota_id AS id_mascota, usuario_id AS id_usuario, estado
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

// .............................................................
// *** Obtener todas las solicitudes de adopción (GET)
// .............................................................
exports.obtenerTodasLasAdopciones = async (req, res, next) => {
  try {
    if (db.isSimulated()) {
      let adopcionesMock = global.adopcionesCompartidas || [];
      console.log(`[Adopciones Simulador] Listando solicitudes. Total: ${adopcionesMock.length}`);
      
      return res.status(200).json({
        mensaje: "Historial completo de solicitudes de adopción (Modo Simulador)",
        total: adopcionesMock.length,
        adopciones: adopcionesMock
      });
    }

    // 🔧 CORREGIDO: Ajustada la consulta hacia la tabla real "solicitud_adopcion"
    const queryReal = `
      SELECT id, mascota_id as "mascotaId", usuario_id as "usuarioId", observaciones as mensaje, estado, fecha_creacion
      FROM solicitud_adopcion
      ORDER BY fecha_creacion DESC
    `;
    const { rows } = await db.query(queryReal);

    return res.status(200).json({
      mensaje: "Historial completo de solicitudes de adopción (Base de datos Real)",
      total: rows.length,
      adopciones: rows
    });

  } catch (error) {
    next(error);
  }
};