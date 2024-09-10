const express = require('express');
const app = express();

// Importar rotas
const indexRoute = require('./routes/index');

// Usar as rotas
app.use('/', indexRoute);

// Definir a porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});