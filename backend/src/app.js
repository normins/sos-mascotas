const express = require('express');
const app = express();
const usuariosRoutes = require('./routes/usuarios');

app.use(express.json());

// Usar las rutas
app.use('/api/usuarios', usuariosRoutes);

app.listen(3000, () => console.log("Servidor en puerto 3000"));
