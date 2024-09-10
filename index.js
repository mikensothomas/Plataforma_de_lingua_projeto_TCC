// const express = require('express');
// const path = require('path');
// const app = express();

// // Configura o diretório de visualizações e o mecanismo de visualização
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// // Corrija o caminho para o roteador
// const mainRouter = require('./routes/index'); // Caminho correto para o arquivo de roteador
// app.use('/', mainRouter);

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Servidor rodando na porta ${port}`);
// });

const express = require('express');
const path = require('path');
const app = express();

// Configura o diretório de visualizações e o mecanismo de visualização
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configura o diretório para arquivos estáticos (CSS, JS, etc.)
app.use('/stylesheets', express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/javascripts', express.static(path.join(__dirname, 'public/javascripts')));
app.use('/imagens', express.static(path.join(__dirname, 'public/imagens')));

// Corrige o caminho para o roteador
const mainRouter = require('./routes/index'); // Caminho correto para o arquivo de roteador
app.use('/', mainRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
