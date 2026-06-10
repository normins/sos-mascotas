const db = require('../config/db');

// MIDDLEWARE PARA RESTRINGIR ACCESO SÓLO A ADMINISTRADORES
exports.requerirAdmin = (req, res, next) => {
  // 🔍 Explicación técnica: En una app real con tokens JWT, el usuario vendría dentro de 'req.user'.
  // Para nuestro entorno simulado/híbrido actual, vamos a pedir que el cliente (Postman) nos mande 
  // el rol en los encabezados (Headers) de la petición para simular la barrera de seguridad de forma limpia.
  
  const userRol = req.headers['x-user-role']; // Captura el rol desde el Header personalizado

  console.log(`\n[Middleware Seguridad] Interceptando petición... Rol recibido en cabecera: "${userRol}"`);

  // Si no mandan nada en el encabezado
  if (!userRol) {
    return res.status(401).json({ 
      error: "No autenticado. Se requiere especificar el rol en el encabezado 'x-user-role'." 
    });
  }

  // Si mandan un rol pero no es el de Administrador (el refugio)
  if (userRol.toLowerCase() !== 'admin') {
    console.log(`SEGURIDAD: Acceso denegado para el rol "${userRol}". Se requiere nivel "admin".`);
    return res.status(403).json({ 
      error: "Acceso denegado. Sólo los usuarios administradores (refugios) pueden realizar esta acción." 
    });
  }

  // Si el rol es 'admin', el guardia le abre la puerta y le da el pase al controlador
  console.log(`SEGURIDAD: Acceso concedido para Administrador. Dando pase libre...`);
  next(); // Le dice a la petición que continúe su camino
};