// const express = require('express');
// const app = express();

// // Importar rotas
// const indexRoute = require('./routes/index');

// // Usar as rotas
// app.use('/', indexRoute);

// // Definir a porta do servidor
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });

const express = require('express');
const path = require('path');
const app = express();

// Configura o diretório de visualizações e o mecanismo de visualização
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Corrija o caminho para o roteador
const mainRouter = require('./routes/index'); // Caminho correto para o arquivo de roteador
app.use('/', mainRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
