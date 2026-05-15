exports.registrarUsuario = (req, res) => {
    const { nombre, email, password } = req.body;
    // Aquí eventualmente llamarás a la base de datos de la Integrante A
    console.log("Datos recibidos para registro:", nombre);
    res.status(201).json({ mensaje: "Usuario recibido correctamente" });
};