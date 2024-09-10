const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const connectDb = require('./bd.js');
const criarTabelas = require('./bd.js'); // Importar a função de criação de tabelas
dotenv.config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3 * 60 * 60 * 1000 }
}));

// Configura rotas
const mainRouter = require('./routes/index');
app.use('/', mainRouter);

// Garantir a conexão com o banco de dados e a criação das tabelas
(async () => {
  try {
    const client = await connectDb();
    await criarTabelas(client); // Criar tabelas
    console.log("Conectado ao banco de dados e tabelas criadas");
  } catch (error) {
    console.error("Erro ao conectar e criar tabelas:", error);
  }
})();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;