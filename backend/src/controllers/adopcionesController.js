
const pool = require('../config/db'); 

const registrarInteres = async (req, res) => {
    const { id_usuario, id_mascota } = req.body;

    try {
        // 1: Registrar el interés en la tabla intermedia (RF09)
        // Usamos campos estructurales: usuario_id y mascota_id
        const nuevoInteres = await pool.query(
            'INSERT INTO interes (usuario_id, mascota_id) VALUES ($1, $2) RETURNING *',
            [id_usuario, id_mascota]
        );
        
        // Obtenemos el ID del interés que se acaba de generar en Postgres
        const interesId = nuevoInteres.rows[0].id;

        // 2: Lógica de Match Automático (RF11)
        const nuevoMatch = await pool.query(
            'INSERT INTO "match" (interes_id, estado) VALUES ($1, $2) RETURNING *',
            [interesId, 'Valido']
        );
        
        // Obtenemos el ID del match generado
        const matchId = nuevoMatch.rows[0].id;

        // 3: Generar la Solicitud vinculada al Match (RF14)
        const nuevaSolicitud = await pool.query(
            'INSERT INTO solicitud_adopcion (usuario_id, mascota_id, match_id, estado) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_usuario, id_mascota, matchId, 'Pendiente']
        );

        res.status(201).json({
            mensaje: "¡Match y Solicitud formal generados con éxito en la base real!",
            interes: nuevoInteres.rows[0],
            match: nuevoMatch.rows[0],
            solicitud: nuevaSolicitud.rows[0]
        });

    } catch (error) {
        console.error("Error en el proceso de adopción relacional:", error);
        res.status(500).json({ error: "Error al procesar la postulación en la base de datos" });
    }
};

const obtenerPostulacionesUsuario = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        // Trae las solicitudes del usuario cruzando los datos con la tabla de mascotas (JOIN)
        const resultado = await pool.query(
            `SELECT s.id, s.estado, s.fecha, m.nombre, m.especie, m.sexo 
             FROM solicitud_adopcion s
             JOIN mascota m ON s.mascota_id = m.id
             WHERE s.usuario_id = $1`,
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