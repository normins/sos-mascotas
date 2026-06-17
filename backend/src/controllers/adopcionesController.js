
const pool = require('../config/db'); 

const registrarInteres = async (req, res) => {
    const { id_usuario, id_mascota } = req.body;

    try {
        // 1. Registrar el interés en la tabla intermedia (RF09)
        const nuevoInteres = await pool.query(
            'INSERT INTO intereses (id_usuario, id_mascota) VALUES ($1, $2) RETURNING *',
            [id_usuario, id_mascota]
        );

        // 2. Lógica de Match Automático (RF11): 
        // Por ahora, simulamos que si el usuario tiene perfil completo, se genera el Match.
        // En una próxima etapa podemos cruzar los requisitos reales.
        const nuevoMatch = await pool.query(
            'INSERT INTO matches (id_usuario, id_mascota, estado) VALUES ($1, $2, $3) RETURNING *',
            [id_usuario, id_mascota, 'Valido']
        );

        // 3. Dejar la Solicitud generada lista para que la revise el Admin (RF14)
        const nuevaSolicitud = await pool.query(
            'INSERT INTO solicitudes_adopcion (id_usuario, id_mascota, estado) VALUES ($1, $2, $3) RETURNING *',
            [id_usuario, id_mascota, 'Pendiente']
        );

        res.status(201).json({
            mensaje: "¡Match generado con éxito!",
            interes: nuevoInteres.rows[0],
            match: nuevoMatch.rows[0],
            solicitud: nuevaSolicitud.rows[0]
        });

    } catch (error) {
        console.error("Error en el proceso de adopción:", error);
        res.status(500).json({ error: "Error al procesar la postulación" });
    }
};

const obtenerPostulacionesUsuario = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        // Trae las solicitudes del usuario cruzando los datos con la tabla de mascotas (JOIN)
        const resultado = await pool.query(
            `SELECT s.id_solicitud, s.estado, s.fecha, m.nombre, m.especie, m.sexo 
             FROM solicitudes_adopcion s
             JOIN mascotas m ON s.id_mascota = m.id_mascota
             WHERE s.id_usuario = $1`,
            [id_usuario]
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el historial" });
    }
};

module.exports = {
    registrarInteres,
    obtenerPostulacionesUsuario
};