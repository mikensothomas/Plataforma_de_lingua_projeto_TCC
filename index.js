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

// app.use(session({
//   secret: process.env.SECRET_KEY,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { maxAge: 3 * 60 * 60 * 1000 }
// }));

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

// function ensureAuthenticated(req, res, next) {
//   if (req.session.user) {
//     return next();
//   }
//   res.redirect('/login');
// }

// async function ensureAdmin(req, res, next) {
//   const client = await connectDb();

//   try {

//     const queryAdminCheck = 'SELECT is_admin FROM usuarios WHERE id = $1';
//     const resultAdminCheck = await client.query(queryAdminCheck, [req.session.user.id]);

//     if (resultAdminCheck.rows.length === 0 || !resultAdminCheck.rows[0].is_admin) {
//       await client.end();
//       return res.redirect('/home');
//     }

//     next();
//   } catch (err) {
//     console.error('Erro ao verificar se o usuário é administrador:', err);
//     return res.status(500).send("Erro interno do servidor");
//   } finally {
//     await client.end();
//   }
// }

// app.get('/login', (req, res) => {
//   res.render('login', { message: req.flash('error') });
// });

// app.post('/login', async (req, res) => {
//   const { email, senha } = req.body;

//   try {
//     const client = await connectDb();
    
//     const query = 'SELECT * FROM usuarios WHERE email = $1';
//     const result = await client.query(query, [email]);

//     if (result.rows.length > 0) {
//       const usuario = result.rows[0];
//       const passwordMatch = await bcrypt.compare(senha, usuario.senha);

//       if (passwordMatch) {
//         req.session.user = { id: usuario.id, email: usuario.email };
//         return res.redirect('/home');
//       }
//     }
//     req.flash('error', 'Email ou senha inválido');
//     alert("Email ou senha inválido");
//     res.redirect('/login');
//     await client.end();
//   } catch (error) {
//     console.error("Erro ao consultar o banco de dados:", error);
//     res.status(500).send("Erro ao consultar o banco de dados");
//   }
// });

// app.get('/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).send("Erro ao encerrar a sessão");
//     }
//     res.redirect('/login');
//   });
// });

// app.post('/avaliar', async (req, res) => {
//   const { video_id, avaliacao } = req.body;
//   const client = await connectDb();

//   try {
//     await client.query(
//       `INSERT INTO avaliacoes (video_id, avaliacao)
//       VALUES ($1, $2)`,
//       [video_id, avaliacao]
//     );
//     res.status(200).send('Avaliação registrada com sucesso!');
//   } catch (err) {
//     console.error('Erro ao registrar a avaliação:', err);
//     res.status(500).send('Erro ao registrar a avaliação.');
//   } finally {
//     await client.end();
//   }
// });

// app.get('/avaliacao-popular', async (req, res) => {
//   const { videoId } = req.query;

//   const client = await connectDb();

//   try {
//     const maxVotesResult = await client.query(
//       `SELECT COUNT(*) as max_votes
//        FROM avaliacoes 
//        WHERE video_id = $1
//        GROUP BY avaliacao
//        ORDER BY max_votes DESC
//        LIMIT 1`,
//       [videoId]
//     );

//     if (maxVotesResult.rows.length === 0) {
//       res.status(404).send('Nenhuma avaliação encontrada para este vídeo.');
//       return;
//     }

//     const maxVotes = parseInt(maxVotesResult.rows[0].max_votes);

//     const result = await client.query(
//       `SELECT avaliacao
//        FROM avaliacoes
//        WHERE video_id = $1
//        GROUP BY avaliacao
//        HAVING COUNT(*) = $2`,
//       [videoId, maxVotes]
//     );

//     if (result.rows.length > 0) {
//       const highestRating = Math.max(...result.rows.map(row => parseInt(row.avaliacao)));
//       res.status(200).json({ avaliacao: highestRating, count: maxVotes });
//     } else {
//       res.status(404).send('Nenhuma avaliação encontrada para este vídeo.');
//     }
//   } catch (err) {
//     console.error('Erro ao buscar avaliação popular:', err);
//     res.status(500).send('Erro ao buscar avaliação popular.');
//   } finally {
//     await client.end();
//   }
// });

// app.get('/avaliacao-media', async (req, res) => {
//   const { videoId } = req.query;

//   const client = await connectDb();

//   try {
//     const result = await client.query(
//       `SELECT AVG(avaliacao) as media, COUNT(*) as total_cliques
//        FROM avaliacoes
//        WHERE video_id = $1`,
//       [videoId]
//     );

//     if (result.rows.length > 0) {
//       const { media, total_cliques } = result.rows[0];
//       res.status(200).json({ media: parseFloat(media).toFixed(2), total_cliques: parseInt(total_cliques) });
//     } else {
//       res.status(404).send('Nenhuma avaliação encontrada para este vídeo.');
//     }
//   } catch (err) {
//     console.error('Erro ao calcular a média das avaliações:', err);
//     res.status(500).send('Erro ao calcular a média das avaliações.');
//   } finally {
//     await client.end();
//   }
// });

// app.use('/cadastra_videos', ensureAuthenticated, ensureAdmin);
// app.use('/home', ensureAuthenticated);
// app.use('/lista_comentario', ensureAuthenticated, ensureAdmin);
// app.use('/listar_usuarios', ensureAuthenticated, ensureAdmin);
// app.use('/atualizar_usuario', ensureAuthenticated, ensureAdmin);
// app.use('/aulas_nivel01', ensureAuthenticated);
// app.use('/aulas_nivel02', ensureAuthenticated);
// app.use('/aulas_nivel03', ensureAuthenticated);
// app.use('/video_list', ensureAuthenticated, ensureAdmin);


// // app.use('/', indexRouter);
// // app.use('/users', usersRouter);

// app.use(function(req, res, next) {
//   next(createError(404));
// });

// app.use(function(err, req, res, next) {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);
//   res.render('error');
// });

// // const startServer = async () => {
// //   await connectDb();
// //   app.listen(process.env.PORT, () => {
// //     console.log(`Servidor iniciado com sucesso`);
// //   });
// // };


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;