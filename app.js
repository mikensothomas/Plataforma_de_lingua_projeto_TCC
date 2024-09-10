const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const connectDb = require('./bd.js');
const session = require('express-session');
const bcryptjs = require('bcryptjs');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');
// var port = normalizePort(process.env.PORT || '3000');
// app.set('port', port);

const flash = require('connect-flash');

const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');

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

module.exports = app;
