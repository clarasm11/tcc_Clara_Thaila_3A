// ==========================
// IMPORTS
// ==========================
// Carrega variáveis de ambiente de um arquivo .env (se existir)
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const cron = require('node-cron');
const exphbs = require('express-handlebars');
const session = require('express-session');

// Rotas
const ministroRoutes = require('./routes/ministro');
const loginRoutes = require('./routes/login');
const alunoRoutes = require('./routes/aluno');
const { router: turmaRouter, reclassificarAlunos } = require('./routes/turma');
const possuiRoutes = require('./routes/possui');
const gerenciaRoutes = require('./routes/gerencia');
const perfilRoutes = require('./routes/perfil');
const inativarRoutes = require('./routes/inativar');
const redefinirRoutes = require('./routes/redefinir');


// ==========================
// CONFIGURAÇÕES
// ==========================
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: "segredoSeguro",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================
// ROTAS LIVRES (sem login)
// ==========================
app.get('/', (req, res) => res.render('login'));
app.get('/login.handlebars', (req, res) => res.render('login'));
app.get('/cadastroMinistro.handlebars', (req, res) => res.render('cadastroMinistro'));
app.get('/cadastroAluno.handlebars', (req, res) => res.render('cadastroAluno'));
app.get('/escolha.handlebars', (req, res) => res.render('escolha'));
app.get('/redefine.handlebars', (req, res) => res.render('redefine'));
app.get('/codigo.handlebars', (req, res) => res.render('codigo'));
app.get('/senha.handlebars', (req, res) => res.render('senha'));

// ==========================
// ROTAS DE PERFIL
// ==========================

// 🔹 Editar aluno (sempre pega da sessão)
app.get('/editarAlunoPerfil', async (req, res) => {
  if (!req.session.usuario || req.session.usuario.tipo !== 'aluno') {
    return res.redirect('/login.handlebars');
  }
  const { Aluno, Endereco, Genero } = require('./models');
  const aluno = await Aluno.findByPk(req.session.usuario.cod, {
    include: [
      { model: Endereco, as: 'Endereco' },
      { model: Genero, as: 'Genero' }
    ]
  });
  if (!aluno) return res.redirect('/login.handlebars');
  res.render('editarAlunoPerfil', { usuario: aluno.toJSON() });
});

// 🔹 Editar o próprio ministro
app.get('/editarMinistroPerfil', async (req, res) => {
  const { Ministro, Endereco, Genero } = require('./models');

  if (!req.session.usuario || req.session.usuario.tipo !== 'ministro') {
    return res.redirect('/login.handlebars');
  }

  const cod = req.session.usuario.cod;

  const ministro = await Ministro.findByPk(cod, {
    include: [
      { model: Endereco, as: 'Endereco' },
      { model: Genero, as: 'Genero' }
    ]
  });

  if (!ministro) return res.redirect('/login.handlebars');

  res.render('editarMinistroPerfil', { usuario: ministro.toJSON() });
});

// 🔹 Editar outro ministro (pastor/admin)
app.get('/editarMinistro.handlebars', async (req, res) => {
  const { Ministro, Endereco, Genero } = require('./models');
  const cod = req.query.cod;

  if (!req.session.usuario || !req.session.usuario.pastor) {
    return res.redirect('/login.handlebars');
  }

  if (!cod) return res.redirect('/listaMinistro.handlebars');

  const ministro = await Ministro.findByPk(cod, {
    include: [
      { model: Endereco, as: 'Endereco' },
      { model: Genero, as: 'Genero' }
    ]
  });

  if (!ministro) return res.redirect('/listaMinistro.handlebars');

  res.render('editarMinistro', { usuario: ministro.toJSON() });
});

// ==========================
// Middleware de autenticação
// ==========================
const { authMiddleware } = require('./middlewares/auth');

// ==========================
// ROTAS DE AUTENTICAÇÃO E API
// ==========================
app.use(loginRoutes);
app.use('/api/ministro', ministroRoutes);
app.use('/api/turma', authMiddleware, turmaRouter);
app.use('/api/possui', authMiddleware, possuiRoutes);
app.use('/api/gerencia', authMiddleware, gerenciaRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/inativar', inativarRoutes);
app.use('/api/redefinir', redefinirRoutes);
app.use('/api/aluno', alunoRoutes);

// ==========================
// ROTAS DE PÁGINAS PROTEGIDAS
// ==========================
function protegeMinistroPastor(req, res, next) {
  const u = req.session.usuario;
  // Verifica se é ministro pastor: pastor pode ser true, 1, "1" ou "true"
  const isPastor = u && u.pastor && (u.pastor === true || u.pastor === 1 || u.pastor === '1' || u.pastor === 'true');
  if (!u || u.tipo !== 'ministro' || !u.ativo || !isPastor) {
    req.session.destroy(() => {
      res.redirect('/login.handlebars');
    });
    return;
  }
  next();
}
const rotasProtegidas = [
  '/index.handlebars', '/turmas.handlebars', '/criarTurma.handlebars', '/listaMinistro.handlebars',
  '/editarMinistro.handlebars', '/detalhesMinistro.handlebars', '/listaCrianca.handlebars',
  '/detalhesAluno.handlebars', '/editarAluno.handlebars', '/preCadastro.handlebars', '/eventos.handlebars'
];
rotasProtegidas.forEach(r => {
  app.get(r, protegeMinistroPastor, (req, res) => {
    const nomeView = r.replace('.handlebars','').replace(/^\//,'');
    res.render(nomeView, { ministro: req.session.usuario });
  });
});

app.get('/turmasMinistro.handlebars', (req, res) => res.render('turmasMinistro'));
app.get('/turmasCrianca.handlebars', (req, res) => res.render('turmasCrianca'));
app.get('/listaCriancaMinistro.handlebars', (req, res) => res.render('listaCriancaMinistro'));
app.get('/detalhesAlunoMinistro.handlebars', (req, res) => res.render('detalhesAlunoMinistro'));
app.get('/indexCrianca.handlebars', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login.handlebars');
  }
  res.render('indexCrianca', { aluno: req.session.usuario });
});

function protegeMinistroAtivo(req, res, next) {
  const u = req.session.usuario;
  if (!u || u.tipo !== 'ministro' || !u.ativo) {
    req.session.destroy(() => {
      res.redirect('/login.handlebars');
    });
    return;
  }
  next();
}
const rotasMinistro = [
  '/indexMinistro.handlebars', '/turmasMinistro.handlebars', '/listaCriancaMinistro.handlebars', '/detalhesAlunoMinistro.handlebars'
];
rotasMinistro.forEach(r => {
  app.get(r, protegeMinistroAtivo, (req, res) => {
    const nomeView = r.replace('.handlebars','').replace(/^\//,'');
    res.render(nomeView, { ministro: req.session.usuario });
  });
});

// Protege rota para aluno logado
function protegeAluno(req, res, next) {
  const u = req.session.usuario;
  if (!u || u.tipo !== 'aluno' || !u.ativo) {
    req.session.destroy(() => {
      res.redirect('/login.handlebars');
    });
    return;
  }
  next();
}

// Rotas de eventos — privadas
app.get('/eventos.handlebars', protegeMinistroPastor, (req, res) => {
  console.log('[ROTA] /eventos.handlebars acessada. Sessão:', req.session.usuario);
  res.render('eventos', { ministro: req.session.usuario });
});

app.get('/eventosMinistro.handlebars', protegeMinistroAtivo, (req, res) => {
  console.log('[ROTA] /eventosMinistro.handlebars acessada. Sessão:', req.session.usuario);
  res.render('eventosMinistro', { ministro: req.session.usuario });
});

app.get('/eventosCrianca.handlebars', protegeAluno, (req, res) => {
  console.log('[ROTA] /eventosCrianca.handlebars acessada. Sessão:', req.session.usuario);
  res.render('eventosCrianca', { aluno: req.session.usuario });
});

// ==========================
// CRON JOB – executa todo dia à meia-noite
// ==========================
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('[CRON] Reclassificando alunos automaticamente...');
    const resultado = await reclassificarAlunos();
    console.log('[CRON] Resultado:', resultado.message);
  } catch (error) {
    console.error('[CRON] Erro ao reclassificar alunos:', error.message);
  }
});


// INICIALIZAÇÃO DO SERVIDOR

sequelize.sync()
  .then(() => {
    console.log('Banco de dados sincronizado!');
    app.listen(port, () => {
      console.log(`Servidor rodando: http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco:', err);
  });
