const express = require('express');
const { Client } = require('pg');
const connectDb = require('../bd.js');
const multer = require('multer');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { hashPassword } = require('./passwordUtils');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const flash = require('connect-flash');

require('dotenv').config();

router.use(logger('dev'));
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(express.static(path.join(__dirname, 'public')));

router.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3 * 60 * 60 * 1000 }
}));

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use(flash());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

router.get('/home', ensureAuthenticated, function(req, res) {
  res.render('home');
});

router.get('/projetoTcc', function(req, res) {
  res.render('projetoTcc');
});

router.get('/cadastro', function(req, res) {
  res.render('cadastro');
});

router.get('/cadastra_videos', ensureAuthenticated, ensureAdmin, function(req, res) {
  res.render('cadastra_videos');
});

router.get('/nova_senha', function(req, res) {
  res.render('nova_senha');
});

router.get('/recupera_senha', function(req, res) {
  res.render('recupera_senha');
});

router.get('/comentarios', function(req, res) {
  res.render('comentarios');
})

router.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const hashedPassword = await hashPassword(senha);

    const client = await connectDb();

    const query = `
      INSERT INTO usuarios (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [nome, email, hashedPassword];
    const result = await client.query(query, values);

    await client.end();

    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error("Erro ao inserir dados no banco de dados:", error);
    res.status(500).send("Erro ao inserir dados no banco de dados");
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const client = await connectDb();
    
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await client.query(query, [email]);

    if (result.rows.length > 0) {
      const usuario = result.rows[0];
      const passwordMatch = await bcryptjs.compare(senha, usuario.senha);

      if (passwordMatch) {
        req.session.user = { id: usuario.id, email: usuario.email };
        return res.redirect('/home');
      }
    }
    req.flash('error', 'Email ou senha inválido');
    alert("Email ou senha inválido");
    res.redirect('/login');
    await client.end();
  } catch (error) {
    console.error("Erro ao consultar o banco de dados:", error);
    res.status(500).send("Erro ao consultar o banco de dados");
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

async function ensureAdmin(req, res, next) {
  const client = await connectDb();

  try {

    const queryAdminCheck = 'SELECT is_admin FROM usuarios WHERE id = $1';
    const resultAdminCheck = await client.query(queryAdminCheck, [req.session.user.id]);

    if (resultAdminCheck.rows.length === 0 || !resultAdminCheck.rows[0].is_admin) {
      await client.end();
      return res.redirect('/home');
    }

    next();
  } catch (err) {
    console.error('Erro ao verificar se o usuário é administrador:', err);
    return res.status(500).send("Erro interno do servidor");
  } finally {
    await client.end();
  }
}

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Erro ao encerrar a sessão");
    }
    res.redirect('/login');
  });
});

async function comparePassword(password, hashedPassword) {
  try {
    const match = await bcryptjs.compare(password, hashedPassword);
    return match;
  } catch (error) {
    throw new Error('Erro ao comparar as senhas');
  }
}

router.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

router.post('/videos', async (req, res) => {
  const { titulo, descricao, link, nivel } = req.body;

  if (!req.session.user) {
    return res.status(403).send("Você precisa estar logado para cadastrar um vídeo.");
  }

  try {
    const client = await connectDb();

    const queryAdminCheck = 'SELECT is_admin FROM usuarios WHERE id = $1';
    const resultAdminCheck = await client.query(queryAdminCheck, [req.session.user.id]);

    if (resultAdminCheck.rows.length === 0 || !resultAdminCheck.rows[0].is_admin) {
      await client.end();
      return res.status(403).send("Acesso negado. Apenas administradores podem cadastrar vídeos.");
    }

    const query = `
      INSERT INTO videos (titulo, descricao, link, nivel)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [titulo, descricao, link, nivel];
    const result = await client.query(query, values);

    await client.end();

    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error("Erro ao inserir vídeo no banco de dados:", error);
    res.status(500).send("Erro ao inserir vídeo no banco de dados");
  }
});

router.post('/comentarios/:id', async (req, res) => {
  const { comentario } = req.body;
  const video_id = req.params.id;

  try {
    const client = await connectDb();

    const query = `
      INSERT INTO comentarios (video_id, comentario, data)
      VALUES ($1, $2, NOW())
      RETURNING id, video_id, comentario, TO_CHAR(data, 'YYYY-MM-DD HH24:MI:SS') as data_formatada;
    `;

    const values = [video_id, comentario];
    const result = await client.query(query, values);

    await client.end();

    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error("Erro ao inserir comentário no banco de dados:", error);
    res.status(500).send("Erro ao inserir comentário no banco de dados");
  }
});

router.get('/aulas_nivel01', ensureAuthenticated, async (req, res) => {
  try {
    const client = await connectDb();

    const queryAdminCheck = 'SELECT is_admin FROM usuarios WHERE id = $1';
    const resultAdminCheck = await client.query(queryAdminCheck, [req.session.user.id]);
    const isAdmin = resultAdminCheck.rows.length > 0 && resultAdminCheck.rows[0].is_admin;

    const query = 'SELECT * FROM videos WHERE nivel = $1';
    const values = [1];
    const result = await client.query(query, values);

    const videos = result.rows.map(video => {
      let embedLink;

      if (video.link.includes('youtu.be')) {
        const videoId = video.link.split('/').pop().split('?')[0];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else if (video.link.includes('youtube.com/watch')) {        const url = new URL(video.link);
        const videoId = url.searchParams.get('v');
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else if (video.link.includes('youtube.com/live')) {
        const videoId = video.link.split('/live/')[1].split('?')[0];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else {
        embedLink = video.link;
      }

      return {
        id: video.id,
        titulo: video.titulo,
        descricao: video.descricao,
        link: embedLink
      };
    });

    res.render('aulas_nivel01', { videos: videos, err: null, isAdmin: isAdmin });
  } catch (err) {
    console.error('Erro ao listar vídeos:', err);
    res.status(500).render('aulas_nivel01', { videos: [], err });
  }
});

router.get('/aulas_nivel02', ensureAuthenticated, async (req, res) => {
  try {
    const client = await connectDb();

    const queryAdminCheck = 'SELECT is_admin FROM usuarios WHERE id = $1';
    const resultAdminCheck = await client.query(queryAdminCheck, [req.session.user.id]);
    const isAdmin = resultAdminCheck.rows.length > 0 && resultAdminCheck.rows[0].is_admin;

    const query = 'SELECT * FROM videos WHERE nivel = $1';
    const values = [2];

    const result = await client.query(query, values);

    await client.end();

    const videos = result.rows.map(video => {
      let embedLink;

      if (video.link.includes('youtu.be')) {
        const videoId = video.link.split('/').pop().split('?')[0];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else if (video.link.includes('youtube.com/watch')) {        const url = new URL(video.link);
        const videoId = url.searchParams.get('v');
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else if (video.link.includes('youtube.com/live')) {
        const videoId = video.link.split('/live/')[1].split('?')[0];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else {
        embedLink = video.link;
      }

      return {
        id: video.id,
        titulo: video.titulo,
        descricao: video.descricao,
        link: embedLink
      };
    });

    res.render('aulas_nivel02', { videos: videos, err: null, isAdmin: isAdmin });
  } catch (err) {
    console.error('Erro ao listar vídeos:', err);
    res.status(500).render('aulas_nivel02', { videos: [], err });
  }
});

router.get('/aulas_nivel03', ensureAuthenticated, async (req, res) => {
  try {
    const client = await connectDb();

    const queryAdminCheck = 'SELECT is_admin FROM usuarios WHERE id = $1';
    const resultAdminCheck = await client.query(queryAdminCheck, [req.session.user.id]);
    const isAdmin = resultAdminCheck.rows.length > 0 && resultAdminCheck.rows[0].is_admin;

    const query = 'SELECT * FROM videos WHERE nivel = $1';
    const values = [3];

    const result = await client.query(query, values);

    await client.end();

    const videos = result.rows.map(video => {
      let embedLink;

      if (video.link.includes('youtu.be')) {
        const videoId = video.link.split('/').pop().split('?')[0];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else if (video.link.includes('youtube.com/watch')) {        const url = new URL(video.link);
        const videoId = url.searchParams.get('v');
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else if (video.link.includes('youtube.com/live')) {
        const videoId = video.link.split('/live/')[1].split('?')[0];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
      } else {
        embedLink = video.link;
      }

      return {
        id: video.id,
        titulo: video.titulo,
        descricao: video.descricao,
        link: embedLink
      };
    });

    res.render('aulas_nivel03', { videos: videos, err: null, isAdmin: isAdmin });
  } catch (err) {
    console.error('Erro ao listar vídeos:', err);
    res.status(500).render('aulas_nivel03', { videos: [], err });
  }
});

router.get('/lista_comentario/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const videoId = req.params.id;
  let client;
  try {
    const client = await connectDb();

    const query = `
      SELECT 
        id, 
        video_id, 
        comentario, 
        TO_CHAR(data, 'DD-MM-YYYY HH24:MI:SS') as data_formatada 
      FROM comentarios
      WHERE video_id = $1;
    `;
    const result = await client.query(query, [videoId]);

    const lista_comentario = result.rows;

    res.render('lista_comentario', { lista_comentario, err: null });
  } catch (err) {
    console.error('Erro ao listar comentários:', err);
    res.status(500).render('lista_comentario', { lista_comentario: [], err });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.get('/listar_usuarios', ensureAuthenticated, ensureAdmin, async (req, res) => {
  let client;
  try {
    const client = await connectDb();

    const query = `
      SELECT 
        id, 
        nome,
        email,
        senha,
        is_admin
      FROM usuarios;
    `;
    const result = await client.query(query);

    const listar_usuarios = result.rows;

    res.render('listar_usuarios', { listar_usuarios, err: null });
  } catch (err) {
    console.error('Erro ao listar comentarios:', err);
    res.status(500).render('listar_usuarios', { listar_usuarios: [], err });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.get('/deletar/:id', async (req, res) => {
  const userId = req.params.id;

  let client;
  try {
    const client = await connectDb();

    const query = `
      DELETE FROM usuarios
      WHERE id = $1
    `;
    const values = [userId];
    await client.query(query, values);

    res.redirect('/listar_usuarios');
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).send('Erro ao deletar usuário');
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.get('/editar/:id', async (req, res) => {
  const userId = req.params.id;
  let client;
  try {
    const client = await connectDb();

    const query = `
      SELECT 
        id, 
        nome,
        email,
        senha
      FROM usuarios
      WHERE id = $1
    `;
    const values = [userId];
    const result = await client.query(query, values);

    const usuario = result.rows[0];

    res.render('atualizar_usuario', { usuario, err: null });
  } catch (err) {
    console.error('Erro ao buscar usuário para edição:', err);
    res.status(500).render('atualizar_usuario', { usuario: null, err });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.post('/editar/:id', async (req, res) => {
  const userId = req.params.id;
  const { nome, email, senha } = req.body;

  let client;
  try {
    const hashedPassword = await hashPassword(senha);

    const client = await connectDb();

    const query = `
      UPDATE usuarios
      SET nome = $1, email = $2, senha = $3
      WHERE id = $4
    `;
    const values = [nome, email, hashedPassword, userId];
    await client.query(query, values);

    res.redirect('/listar_usuarios');
  } catch (err) {
    console.error('Erro ao editar usuário:', err);
    res.status(500).send('Erro ao editar usuário');
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.post('/recupera_senha', async (req, res) => {
    const { email } = req.body;

    try {
      const client = await connectDb();

        const query = `SELECT * FROM usuarios WHERE email = $1;`;
        const values = [email];
        const result = await client.query(query, values);

        if (result.rows.length > 0) {
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpires = Date.now() + 30 * 60 *1000;

            const updateQuery = `
                UPDATE usuarios
                SET reset_token = $1, reset_token_expires = $2
                WHERE email = $3;
            `;
            const updateValues = [resetToken, resetTokenExpires, email];
            await client.query(updateQuery, updateValues);

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                to: email,
                from: process.env.EMAIL_USER,
                subject: 'Redefinição de senha',
                text: `Você solicitou a redefinição da sua senha. Clique no link abaixo para redefinir sua senha:\n\n` +
                      `http://${req.headers.host}/nova_senha?token=${resetToken}\n\n` +
                      `Este link é válido por 30 minutos.`,
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: 'Um email de redefinição de senha foi enviado para ' + email });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas' });
        }

        await client.end();
    } catch (error) {
        console.error("Erro ao consultar o banco de dados:", error.message, error.stack);
        res.status(500).json({ message: 'Erro ao consultar o banco de dados' });
    }
});

router.post('/atualiza_senha', async (req, res) => {
    const { token, novaSenha } = req.body;

    try {
        const hashedPassword = await bcryptjs.hash(novaSenha, 10);

        const client = await connectDb();

        const query = `SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expires > $2;`;
        const values = [token, Date.now()];
        const result = await client.query(query, values);

        if (result.rows.length > 0) {
            const updateQuery = `
                UPDATE usuarios
                SET senha = $1, reset_token = NULL, reset_token_expires = NULL
                WHERE reset_token = $2;
            `;
            const updateValues = [hashedPassword, token];
            await client.query(updateQuery, updateValues);

            res.status(200).send("Senha atualizada com sucesso");
        } else {
            res.status(400).send("Token inválido ou expirado");
        }

        await client.end();
    } catch (error) {
        console.error("Erro ao atualizar a senha:", error.message, error.stack);
        res.status(500).send("Erro ao atualizar a senha");
    }
});

router.get('/video_list', ensureAuthenticated, ensureAdmin, async (req, res) => {
  let client;
  try {
    const client = await connectDb();

    const query = `
      SELECT 
        id, 
        titulo,
        descricao,
        link,
        nivel
      FROM videos;
    `;
    const result = await client.query(query);
    const user = req.session.user

    res.render('video_list', { video_list: result.rows, err: null, user });
  } catch (err) {
    console.error('Erro ao listar vídeos:', err);
    res.status(500).render('video_list', { video_list: [], err });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.get('/deletar_video/:id', async (req, res) => {
  const video_id = req.params.id;

  let client;
  try {
    const client = await connectDb();

    const query = `
      DELETE FROM videos
      WHERE id = $1
    `;
    const values = [video_id];
    await client.query(query, values);

    res.redirect('/video_list');
  } catch (err) {
    console.error('Erro ao deletar video:', err);
    res.status(500).send('Erro ao deletar video');
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.get('/editar_video/:id', async (req, res) => {
  const video_id = req.params.id;
  let client;
  try {
    const client = await connectDb();

    const query = `
      SELECT 
        id,
        titulo,
        descricao,
        link,
        nivel
      FROM videos
      WHERE id = $1
    `;
    const values = [video_id];
    const result = await client.query(query, values);

    const video = result.rows[0];

    res.render('atualizar_video', { video, err: null });
  } catch (err) {
    console.error('Erro ao buscar vdeo para edição:', err);
    res.status(500).render('atualizar_video', { video: null, err });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.post('/editar_video/:id', async (req, res) => {
  const video_id = req.params.id;
  const { titulo, descricao, link, nivel } = req.body;

  let client;
  try {

    const client = await connectDb();

    const query = `
      UPDATE videos
      SET titulo = $1, descricao = $2, link = $3, nivel = $4
      WHERE id = $5
    `;
    const values = [titulo, descricao, link, nivel, video_id];
    await client.query(query, values);

    res.redirect('/video_list');
  } catch (err) {
    console.error('Erro ao editar vídeo:', err);
    res.status(500).send('Erro ao editar vídeo');
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error('Erro ao fechar a conexão com o banco de dados:', closeErr);
      }
    }
  }
});

router.post('/avaliar', async (req, res) => {
  const { video_id, avaliacao } = req.body;
  const client = await connectDb();

  try {
    await client.query(
      `INSERT INTO avaliacoes (video_id, avaliacao)
      VALUES ($1, $2)`,
      [video_id, avaliacao]
    );
    res.status(200).send('Avaliação registrada com sucesso!');
  } catch (err) {
    console.error('Erro ao registrar a avaliação:', err);
    res.status(500).send('Erro ao registrar a avaliação.');
  } finally {
    await client.end();
  }
});

router.get('/avaliacao-popular', async (req, res) => {
  const { videoId } = req.query;

  const client = await connectDb();

  try {
    const maxVotesResult = await client.query(
      `SELECT COUNT(*) as max_votes
       FROM avaliacoes 
       WHERE video_id = $1
       GROUP BY avaliacao
       ORDER BY max_votes DESC
       LIMIT 1`,
      [videoId]
    );

    if (maxVotesResult.rows.length === 0) {
      res.status(404).send('Nenhuma avaliação encontrada para este vídeo.');
      return;
    }

    const maxVotes = parseInt(maxVotesResult.rows[0].max_votes);

    const result = await client.query(
      `SELECT avaliacao
       FROM avaliacoes
       WHERE video_id = $1
       GROUP BY avaliacao
       HAVING COUNT(*) = $2`,
      [videoId, maxVotes]
    );

    if (result.rows.length > 0) {
      const highestRating = Math.max(...result.rows.map(row => parseInt(row.avaliacao)));
      res.status(200).json({ avaliacao: highestRating, count: maxVotes });
    } else {
      res.status(404).send('Nenhuma avaliação encontrada para este vídeo.');
    }
  } catch (err) {
    console.error('Erro ao buscar avaliação popular:', err);
    res.status(500).send('Erro ao buscar avaliação popular.');
  } finally {
    await client.end();
  }
});

router.get('/avaliacao-media', async (req, res) => {
  const { videoId } = req.query;

  const client = await connectDb();

  try {
    const result = await client.query(
      `SELECT AVG(avaliacao) as media, COUNT(*) as total_cliques
       FROM avaliacoes
       WHERE video_id = $1`,
      [videoId]
    );

    if (result.rows.length > 0) {
      const { media, total_cliques } = result.rows[0];
      res.status(200).json({ media: parseFloat(media).toFixed(2), total_cliques: parseInt(total_cliques) });
    } else {
      res.status(404).send('Nenhuma avaliação encontrada para este vídeo.');
    }
  } catch (err) {
    console.error('Erro ao calcular a média das avaliações:', err);
    res.status(500).send('Erro ao calcular a média das avaliações.');
  } finally {
    await client.end();
  }
});

module.exports = router;