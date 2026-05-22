const db = require('../config/db');

const usuariosMock = [
{ id: 1, nombre: "Admin SOS", email: "admin@sosmascotas.org", password: "admin", rol: "admin" },
{ id: 2, nombre: "Juan Adoptante", email: "juan@correo.com", password: "123456", rol: "adoptante" }
];

exports.registrarUsuario = async (req, res, next) => {
try {
const { nombre, email, password } = req.body;

if (!nombre || !email || !password) {
  return res.status(400).json({ error: "Nombre, email y password son requeridos." });
}

const emailFormat = email.trim().toLowerCase();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(emailFormat)) {
  return res.status(400).json({ error: "Formato de email invalido." });
}

if (password.length < 6) {
  return res.status(400).json({ error: "La contrasenia debe tener al menos 6 caracteres." });
}

if (db.isSimulated()) {
  const existe = usuariosMock.find(u => u.email === emailFormat);
  if (existe) return res.status(409).json({ error: "El email ya existe." });

  const nuevoUsuario = { id: usuariosMock.length + 1, nombre, email: emailFormat, rol: "adoptante" };
  usuariosMock.push(nuevoUsuario);
  return res.status(201).json({ mensaje: "Usuario registrado en simulador", usuario: nuevoUsuario });
}

const consultaExiste = 'SELECT id FROM usuarios WHERE email = $1';
const resultadoExiste = await db.query(consultaExiste, [emailFormat]);
if (resultadoExiste.rows.length > 0) {
  return res.status(409).json({ error: "El email ya esta registrado." });
}

const queryInsert = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol';
const { rows } = await db.query(queryInsert, [nombre, emailFormat, password, 'adoptante']);

return res.status(201).json({ mensaje: "Usuario registrado en BD real", usuario: rows[0] });
} catch (error) {
next(error);
}
};

exports.iniciarSesion = async (req, res, next) => {
try {
const { email, password } = req.body;
if (!email || !password) {
  return res.status(400).json({ error: "Email y password son requeridos." });
}

const emailFormat = email.trim().toLowerCase();

if (db.isSimulated()) {
  console.log(`[Login Simulador] Intentando conectar a: ${emailFormat}`);
  
  const usuarioEncontrado = usuariosMock.find(u => u.email === emailFormat);
  
  if (!usuarioEncontrado) {
    return res.status(401).json({ error: "Credenciales invalidas", detalle: "El correo electronico no esta registrado." });
  }

  if (usuarioEncontrado.password !== password) {
    return res.status(401).json({ error: "Credenciales invalidas", detalle: "La contrasenia es incorrecta." });
  }

  return res.status(200).json({
    mensaje: "¡Inicio de sesion exitoso (Simulado)!",
    usuario: {
      id: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre,
      email: usuarioEncontrado.email,
      rol: usuarioEncontrado.rol
    }
  });
}

const queryTexto = 'SELECT * FROM usuarios WHERE email = $1';
const { rows } = await db.query(queryTexto, [emailFormat]);

if (rows.length === 0) {
  return res.status(401).json({ error: "Credenciales invalidas" });
}

const usuarioReal = rows[0];

if (usuarioReal.password !== password) {
  return res.status(401).json({ error: "Credenciales invalidas" });
}

return res.status(200).json({
  mensaje: "¡Inicio de sesion exitoso en Base de Datos real!",
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