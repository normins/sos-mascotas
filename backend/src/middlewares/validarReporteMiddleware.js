// MIDDLEWARE PARA VALIDAR LOS DATOS DE UN REPORTE DE EMERGENCIA (POST)
exports.validarCamposReporte = (req, res, next) => {
  const { tipoReporte, descripcion } = req.body;

  console.log("\n[Middleware Validación] Analizando datos recibidos para el reporte.");

  // 1. Validar que los campos obligatorios existan y no estén vacíos
  if (!tipoReporte || typeof tipoReporte !== 'string' || tipoReporte.trim() === '') {
    return res.status(400).json({ 
      error: "Validación fallida: El campo 'tipoReporte' es obligatorio y debe ser un texto válido." 
    });
  }

  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
    return res.status(400).json({ 
      error: "Validación fallida: El campo 'descripcion' es obligatorio y debe contener un relato detallado." 
    });
  }

  // 2. Validar que el tipo de reporte sea uno de los permitidos 
  const categoriasPermitidas = ["Maltrato", "Extravio", "Hallazgo"];
  // Usamos trim() para limpiar espacios y aseguramos la coincidencia
  if (!categoriasPermitidas.includes(tipoReporte.trim())) {
    return res.status(400).json({
      error: `Validación fallida: '${tipoReporte}' no es una categoria válida. Las permitidas son: Maltrato, Extravio o Hallazgo.`
    });
  }

  // 3. Validar longitud mínima de la descripción (para evitar reportes inservibles de 2 letras)
  if (descripcion.trim().length < 10) {
    return res.status(400).json({
      error: "Validación fallida: La descripción es demasiado corta. Debe tener al menos 10 caracteres para ser útil a la comunidad."
    });
  }

  // ✅ Si pasó todos los filtros de calidad, limpiamos los textos y damos el pase libre
  req.body.tipoReporte = tipoReporte.trim();
  req.body.descripcion = descripcion.trim();

  console.log("Validación exitosa. Los datos son seguros.");
  next();
};