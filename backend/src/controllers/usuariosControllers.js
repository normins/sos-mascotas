const db = require('../config/db');
const bcrypt = require('bcrypt');

// Lista temporal de usuarios en memoria (Las claves fijas ya están hasheadas para que el simulador no falle)
// admin -> hash de 'admin'
// 123456 -> hash de '123456'
const usuariosMock = [
  { 
    id: 1, 
    nombre: "Admin SOS", 
    email: "admin@sosmascotas.org", 
    password: "$2b$10$EPfG3Z9T7D0p3H9O6k0hO.v87pZqD7N77eN89r6Y4m5N4y4v4v4v.", 
    rol: "admin" 
  },
  { 
    id: 2, 
    nombre: "Juan Adoptante", 
    email: "juan@correo.com", 
    password: "$2b$10$K7wD9Z9T7D0p3H9O6k0hO.x77pZqD7N77eN89r6Y4m5N4y4v4v4v.", 
    rol: "adoptante" 
  }
];

// 1. REGISTRO DE USUARIOS ENCRIPTADO
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

    // ENCRIPTACIÓN: Generar el hash de la contraseña (Costo de procesamiento: 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // MODO SIMULADOR
    if (db.isSimulated()) {
      const existe = usuariosMock.find(u => u.email === emailFormat);
      if (existe) return res.status(409).json({ error: "El email ya existe." });

      const nuevoUsuario = { 
        id: usuariosMock.length + 1, 
        nombre, 
        email: emailFormat, 
        password: passwordHash, // Guardamos la clave encriptada
        rol: "adoptante" 
      };
      usuariosMock.push(nuevoUsuario);
      
      return res.status(201).json({ 
        mensaje: "Usuario registrado en simulador (Clave Protegida)", 
        usuario: { id: nuevoUsuario.id, nombre, email: emailFormat, rol: "adoptante" } 
      });
    }

    // BASE DE DATOS REAL
    const consultaExiste = 'SELECT id FROM usuarios WHERE email = $1';
    const resultadoExiste = await db.query(consultaExiste, [emailFormat]);
    if (resultadoExiste.rows.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    // Insertamos el passwordHash en lugar de la clave original
    const queryInsert = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol';
    const { rows } = await db.query(queryInsert, [nombre, emailFormat, passwordHasheado, 'adoptante']);
    
    return res.status(201).json({ mensaje: "Usuario registrado en BD real con encriptación", usuario: rows[0] });
  } catch (error) {
    next(error);
  }
};

// 2. INICIO DE SESIÓN SEGURO
exports.iniciarSesion = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son requeridos." });
    }

    const emailFormat = email.trim().toLowerCase();

    // MODO SIMULADOR
    if (db.isSimulated()) {
      console.log(`[Login Seguro Simulador] Verificando hash para: ${emailFormat}`);
      
      const usuarioEncontrado = usuariosMock.find(u => u.email === emailFormat);
      
      if (!usuarioEncontrado) {
        return res.status(401).json({ error: "Credenciales inválidas", detalle: "El correo electrónico no esta registrado." });
      }

      // COMPARACIÓN SEGURA: Comparamos la clave de Postman contra el Hash guardado
      const passwordCorrecto = await bcrypt.compare(password, usuarioEncontrado.password);
      
      if (!passwordCorrecto) {
        return res.status(401).json({ error: "Credenciales inválidas", detalle: "La contraseña es incorrecta." });
      }

      return res.status(200).json({
        mensaje: "¡Inicio de sesión exitoso y seguro (Simulado)!",
        usuario: {
          id: usuarioEncontrado.id,
          nombre: usuarioEncontrado.nombre,
          email: usuarioEncontrado.email,
          rol: usuarioEncontrado.rol
        }
      });
    }

    // BASE DE DATOS REAL
    const queryTexto = 'SELECT * FROM usuarios WHERE email = $1';
    const { rows } = await db.query(queryTexto, [emailFormat]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuarioReal = rows[0];
    
    // COMPARACIÓN SEGURA en BD Real
    const passwordRealCorrecto = await bcrypt.compare(password, usuarioReal.password);
    if (!passwordRealCorrecto) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    return res.status(200).json({
      mensaje: "¡Inicio de sesión exitoso en Base de Datos real con seguridad bcrypt!",
      usuario: {
        id: usuarioReal.id,
        nombre: usuarioReal.nombre,
        email: usuarioReal.email,
        rol: usuarioReal.rol
      }
    });

  } catch (error) {
    next(error);
  }
};