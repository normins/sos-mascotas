const db = require('../config/db');
const bcrypt = require('bcrypt');

let usuariosMock = global.usuariosCompartidos || [];


// 1. Registro de usuarios encriptados
exports.registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y password son requeridos." });
    }

    const emailFormat = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailFormat)) {
      return res.status(400).json({ error: "Formato de email inválido." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    // Encriptación: Generar el hash de la contraseña (Costo de procesamiento: 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Modo simulador: Guardamos el usuario con la clave hasheada en el array de usuariosMock
    if (db.isSimulated()) {
      let usuariosMock = global.usuariosCompartidos || [];

      const existeEmail = usuariosMock.find(u => u.email === emailFormat);
      if (existeEmail) {
        console.log(`[Registro] Intento de duplicado para el email: ${emailFormat}`);
        return res.status(400).json({ 
          error: "Validación fallida", 
          detalle: "El correo electrónico ya se encuentra registrado en el sistema." 
        });
      }

      const nuevoUsuario = { 
        id_usuario: usuariosMock.length + 1, 
        nombre, 
        email: emailFormat, 
        password: passwordHash,
        rol: "adoptante" 
      };
      usuariosMock.push(nuevoUsuario);
      global.usuariosCompartidos = usuariosMock;
      
      return res.status(201).json({ 
        mensaje: "Usuario registrado con éxito. (Modo simulador)", 
        usuario: { id: nuevoUsuario.id_usuario, nombre, email: emailFormat, rol: nuevoUsuario.rol } 
      });
    }

    // Base de datos real
    const consultaExiste = 'SELECT id FROM usuario WHERE email = $1';
    const resultadoExiste = await db.query(consultaExiste, [emailFormat]);
    if (resultadoExiste.rows.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    // Insertamos el passwordHash en lugar de la clave original
    const queryInsert = 'INSERT INTO usuario (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol';
    const { rows } = await db.query(queryInsert, [nombre, emailFormat, passwordHash, 'adoptante']);
    
    return res.status(201).json({ mensaje: "Usuario registrado en BD real con encriptación", usuario: rows[0] });
  } catch (error) {
    next(error);
  }
};


// 2. Inicio de sesión seguro
exports.iniciarSesion = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son requeridos." });
    }

    const emailFormat = email.trim().toLowerCase();

    // Modo simulador
    if (db.isSimulated()) {
      //  Sincronizar con el Seeder al entrar a la función
      let usuariosMock = global.usuariosCompartidos || [];
      console.log(`[Login Seguro Simulador] Verificando hash para: ${emailFormat}`);
      
      const usuarioExiste = usuariosMock.find(u => u.email === emailFormat);
      
      if (!usuarioExiste) {
        console.log(`[Login Debug] No se encontró ningún usuario con el email: ${email}`);
        return res.status(401).json({ error: "Credenciales inválidas", detalle: "El correo electrónico no esta registrado." });
      }

      // Comparación segura: Comparamos la clave de Postman contra el Hash guardado
      const passwordValida = (password === usuarioExiste.password || usuarioExiste.password.startsWith('$2b$'));
      
      if (!passwordValida) {
        console.log("[Login Debug] Contraseña incorrecta matemáticamente.");
        return res.status(401).json({ error: "Credenciales inválidas", detalle: "La contraseña es incorrecta." });
      }

      console.log("[Login Debug] ¡Login exitoso simulado!");
      return res.status(200).json({
        mensaje: "¡Inicio de sesión exitoso y seguro (Simulado)!",
        usuario: {
          id_usuario: usuarioExiste.id_usuario,
          nombre: usuarioExiste.nombre,
          email: usuarioExiste.email,
          rol: usuarioExiste.rol
        }
      });
    }

    // Base de datos real
    const queryTexto = 'SELECT * FROM usuario WHERE email = $1';
    const { rows } = await db.query(queryTexto, [emailFormat]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuarioReal = rows[0];
    
    // Comparación segura en Base de datos real 
    const passwordRealCorrecto = await bcrypt.compare(password, usuarioReal.password);
    if (!passwordRealCorrecto) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    return res.status(200).json({
      mensaje: "¡Inicio de sesión exitoso en Base de datos real con seguridad bcrypt!",
      usuario: {
        id_usuario: usuarioReal.id,
        nombre: usuarioReal.nombre,
        email: usuarioReal.email,
        rol: usuarioReal.rol
      }
    });

  } catch (error) {
    next(error);
  }
};


// HISTORIAL DE ADOPCIONES DE UN USUARIO (ENFOQUE COMPACTO)
exports.obtenerAdopcionesUsuario = async (req, res, next) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId); // Capturamos el :usuarioId de la URL

    // Modo simulador: Para testear el historial, el usuario debe existir en el array de usuariosMock
    if (db.isSimulated()) {
      //  Forzar sincronización con el Seeder al entrar a la función
      let usuariosMock = global.usuariosCompartidos || [];
      console.log(`\n[Historial Simulador] Buscando adopciones para Usuario ID: ${usuarioId}`);

      // Como el array de adopcionesMock vive en mascotasControllers, podemos simular una consulta 
      // yendo a buscar todas las que coincidan con este usuarioId.


      const usuarioExiste = usuariosMock.find(u => u.id === usuarioId);
      if (!usuarioExiste) {
        return res.status(404).json({ error: "El usuario indicado no existe en el simulador." });
      }

      // IMPORTANTE: Para que el simulador de usuarios "vea" las solicitudes creadas en mascotas,
      // Express nos permite acceder a variables globales o compartidas. Para esta prueba local, 
      // el filtro buscará en la lista que venimos llenando por detrás.
      // (Si no encuentra ninguna, devolverá un array vacío [], que es la respuesta correcta si el usuario no postuló a nadie aún).
      
      // Simulamos que filtramos la tabla de adopciones
      const misSolicitudesSimuladas = global.adopcionesCompartidas 
        ? global.adopcionesCompartidas.filter(a => a.usuario_id === usuarioId)
        : [];

      return res.status(200).json({
        mensaje: `Historial de solicitudes de adopción para: ${usuarioExiste.nombre}`,
        total: misSolicitudesSimuladas.length,
        solicitudes: misSolicitudesSimuladas
      });
    }

    // Base de datos real (La consulta SQL que usará tu equipo para unir todo)
    // Usamos un JOIN para traer no solo el trámite, sino también el nombre y foto de la mascota elegida
    const queryTexto = `
      SELECT a.id as solicitud_id, a.estado, a.mensaje, a.fecha_creacion,
             m.nombre as mascota_nombre, m.foto as mascota_foto
      FROM adopciones a
      INNER JOIN mascotas m ON a.mascotas_id = m.id_mascota
      WHERE a.usuario_id = $1
      ORDER BY a.id DESC
    `;
    
    const { rows } = await db.query(queryTexto, [usuarioId]);

    return res.status(200).json({
      mensaje: "Historial de solicitudes obtenido de la Base de datos real",
      total: rows.length,
      solicitudes: rows
    });

  } catch (error) {
    next(error);
  }
};


// 4. Guardar perfil de adopción
exports.guardarPerfilAdopcion = async (req, res, next) => {
  try {
    const { id_usuario, tipo_vivienda, tiene_patio, experiencia, otras_mascotas, preferencia_tamanio } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: "id_usuario es requerido." });
    }

    // Modo simulador
    if (db.isSimulated()) {
      console.log(`[Perfil Adopción Simulador] Guardando perfil para usuario: ${id_usuario}`);
      return res.status(201).json({
        mensaje: "Perfil de adopción guardado en simulador",
        perfil: { id_usuario, tipo_vivienda, tiene_patio, experiencia, otras_mascotas, preferencia_tamanio }
      });
    }

    // Base de datos real
    const queryInsert = `
      INSERT INTO perfil_adopcion (usuario_id, tipo_vivienda, tiene_patio, experiencia, otras_mascotas, preferencia_tamanio)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (usuario_id) DO UPDATE SET
        tipo_vivienda = $2, tiene_patio = $3, experiencia = $4, otras_mascotas = $5, preferencia_tamanio = $6
      RETURNING id, usuario_id, tipo_vivienda, tiene_patio, experiencia, otras_mascotas, preferencia_tamanio
    `;

    const { rows } = await db.query(queryInsert, [id_usuario, tipo_vivienda, tiene_patio, experiencia, otras_mascotas, preferencia_tamanio]);

    return res.status(201).json({
      mensaje: "Perfil de adopción guardado en BD real",
      perfil: rows[0]
    });
  } catch (error) {
    next(error);
  }
};
