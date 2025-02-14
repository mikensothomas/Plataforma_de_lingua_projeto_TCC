const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const i18n = require('i18n');
const dotenv = require('dotenv');
const connectDb = require('./bd.js');
const criarTabelas = require('./bd.js'); 
dotenv.config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

i18n.configure({
  locales: ['en', 'pt', 'fr', 'es'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'pt',
  cookie: 'lang'
});

app.use(i18n.init);

app.get('/lang/:locale', (req, res) => {
  const locale = req.params.locale;
  res.cookie('lang', locale);
  res.setLocale(locale);
  res.redirect('back');
});

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3 * 60 * 60 * 1000 }
}));

app.get('/', (req, res) => {
  const user = req.session.user;
  res.render('index', { user });
});

app.get('/projetoTcc', (req, res) => {
  const user = req.session.user;
  res.render('projetoTcc', { user });
});

app.get('/', (req, res) => {
  const user = req.session.user;
  res.render('index', { user, message: res.__('Hello') });
});

app.get('/home', async (req, res) => {
  if (req.session.user) {
    const { email } = req.session.user;

    try {
      const client = await connectDb();
      const query = 'SELECT nome FROM usuarios WHERE email = $1';
      const result = await client.query(query, [email]);

      if (result.rows.length > 0) {
        const usuario = result.rows[0];
        const nome = usuario.nome;
        
        res.render('home', { nome, email });
      } else {
        res.redirect('/login');
      }
      
      await client.end();
    } catch (error) {
      console.error("Erro ao consultar o banco de dados:", error);
      res.status(500).send("Erro ao consultar o banco de dados");
    }
  } else {
    res.redirect('/login');
  }
});

const mainRouter = require('./routes/index');
app.use('/', mainRouter);

(async () => {
  try {
    const client = await connectDb();
    await criarTabelas(client);
    console.log("Conectado ao banco de dados");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
})();

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;