// Esta función procesa la lógica de registro
exports.registrarUsuario = (req, res) => {
    const { nombre, email, password } = req.body;

    // Validación básica de campos obligatorios (RF01)
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Por ahora simulamos que guardamos en la base de datos (RF25 futuro)
    console.log(`Registrando nuevo usuario: ${nombre} (${email})`);
    
    // Devolvemos respuesta de éxito
    res.status(201).json({
        mensaje: "Usuario registrado con éxito en ÉpicaSoft",
        usuario: { 
            nombre, 
            email, 
            rol: 'adoptante' // Rol por defecto (RF02)
        }
    });
};