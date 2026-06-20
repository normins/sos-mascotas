const pool = require('../config/db'); 

// 1. POST /api/adopciones/postular - Registrar interés y generar Match
exports.registrarInteres = async (req, res) => {
    const { id_usuario, id_mascota } = req.body;

    try {
        // Registrar el interés en la tabla intermedia real
        const nuevoInteres = await pool.query(
            'INSERT INTO interes (usuario_id, mascota_id) VALUES ($1, $2) RETURNING *',
            [id_usuario, id_mascota]
        );

        const interesId = nuevoInteres.rows[0].id;

        // Lógica de Match Automático
        const nuevoMatch = await pool.query(
            'INSERT INTO "match" (interes_id, estado) VALUES ($1, $2) RETURNING *',
            [interesId, 'Valido']
        );

        const matchId = nuevoMatch.rows[0].id;

        // Dejar la Solicitud generada
        const nuevaSolicitud = await pool.query(
            'INSERT INTO solicitud_adopcion (usuario_id, mascota_id, match_id, estado) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_usuario, id_mascota, matchId, 'Pendiente']
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

// 2. GET /api/adopciones/usuario/:id_usuario - Obtener historial del usuario
exports.obtenerPostulacionesUsuario = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const resultado = await pool.query(
            `SELECT s.id AS id_solicitud, s.estado, s.fecha_creacion as fecha, m.nombre, m.especie, m.sexo 
             FROM solicitud_adopcion s
             JOIN mascotas m ON s.mascota_id = m.id
             WHERE s.usuario_id = $1`,
            [id_usuario]
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el historial" });
    }
};