// Backend - Entry point
require('./src/app.js').catch(err => {
  console.error('❌ Error crítico al iniciar la aplicación:', err);
  process.exit(1);
});
