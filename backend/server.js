const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // Importar bcryptjs
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken

const app = express();
const port = 3000; // Porta do seu backend

// Chave secreta para JWT (USE UMA STRING MAIS COMPLEXA E SEGURA EM PRODUÇÃO)
// Certifique-se de que esta chave é EXATAMENTE a mesma em todos os lugares que você a usa!
const JWT_SECRET = 'sua_chave_secreta_muito_segura_aqui_para_teste';

app.use(cors());
app.use(express.json()); // Importante para parsear JSON no corpo das requisições
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir arquivos estáticos da pasta uploads

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Conexão e inicialização do banco de dados SQLite
const db = new sqlite3.Database('./imoveis.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
    // Criação da tabela de contatos
    db.run(`
      CREATE TABLE IF NOT EXISTS contatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT,
        telefone TEXT,
        assunto TEXT,
        mensagem TEXT,
        data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Criação da tabela de imóveis com colunas adicionais
    db.run(`
      CREATE TABLE IF NOT EXISTS imoveis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        tipo TEXT,
        preco REAL,
        endereco TEXT,
        bairro TEXT,
        cidade TEXT,
        quartos INTEGER,
        banheiros INTEGER,
        vagas INTEGER,
        area_util REAL,
        area_total REAL,
        descricao TEXT,
        fotos TEXT,
        destaque BLOB,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        tipo_negocio TEXT,
        status TEXT DEFAULT 'pendente'
      )
    `, (createTableErr) => {
      if (createTableErr) {
        // Lógica para adicionar colunas se a tabela já existir (para migrações)
        db.run(`PRAGMA table_info(imoveis);`, (pragmaErr, rows) => {
          if (pragmaErr) {
            console.error("Erro ao obter informações da tabela:", pragmaErr.message);
          } else if (Array.isArray(rows)) {
            const statusExists = rows.some(columnInfo => columnInfo.name === 'status');
            if (!statusExists) {
              db.run(`ALTER TABLE imoveis ADD COLUMN status TEXT DEFAULT 'pendente';`, (alterErr) => {
                if (alterErr) console.error("Erro ao adicionar coluna 'status':", alterErr.message);
                else console.log("Coluna 'status' adicionada à tabela 'imoveis' com valor padrão 'pendente'.");
              });
            }
            const tipoNegocioExists = rows.some(columnInfo => columnInfo.name === 'tipo_negocio');
            if (!tipoNegocioExists) {
              db.run(`ALTER TABLE imoveis ADD COLUMN tipo_negocio TEXT;`, (alterErr) => {
                if (alterErr) console.error("Erro ao adicionar coluna 'tipo_negocio':", alterErr.message);
                else console.log("Coluna 'tipo_negocio' adicionada à tabela 'imoveis'.");
              });
            }
          }
        });
      } else {
        console.log("Tabela 'imoveis' verificada/criada.");
      }
    });

    // Criação da tabela de usuários para autenticação
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `, (err) => {
      if (err) {
        console.error("Erro ao criar tabela de usuários:", err.message);
      } else {
        console.log("Tabela 'users' verificada/criada.");
        // Opcional: Adicionar um usuário padrão se a tabela estiver vazia
        db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
          if (err) {
            console.error("Erro ao contar usuários:", err.message);
          } else if (row.count === 0) {
            const defaultUsername = 'admin';
            const defaultPassword = 'admin'; // Use uma senha forte em produção!
            bcrypt.hash(defaultPassword, 10, (err, hash) => {
              if (err) {
                console.error("Erro ao fazer hash da senha padrão:", err.message);
              } else {
                db.run("INSERT INTO users (username, password) VALUES (?, ?)", [defaultUsername, hash], (err) => {
                  if (err) console.error("Erro ao inserir usuário padrão:", err.message);
                  else console.log("Usuário padrão 'admin' criado.");
                });
              }
            });
          }
        });
      }
    });
  }
});

// Middleware para autenticar o token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato esperado: Bearer TOKEN

  if (token == null) {
      console.log('DEBUG (Backend): Token não fornecido.');
      return res.status(401).json({ message: 'Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
        console.log('DEBUG (Backend): Token inválido ou expirado. Erro:', err.message);
        // O erro 'JsonWebTokenError: invalid signature' indica chave secreta errada
        // O erro 'TokenExpiredError: jwt expired' indica que o token expirou
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    req.user = user; // Anexa as informações do usuário à requisição
    next();
  });
};

// --- ROTAS PÚBLICAS (não exigem autenticação) ---

// Rota para destaques na Home
app.get('/api/destaques-home', (req, res) => {
  console.log('Rota /api/destaques-home foi acessada!');
  db.all('SELECT * FROM imoveis WHERE destaque > 0', [], (err, rows) => {
    if (err) console.error(err.message);
    else res.json(rows.map(row => ({ ...row, fotos: row.fotos ? JSON.parse(row.fotos) : [] })));
  });
});

// Rota para listar todos os imóveis (público)
app.get('/api/imoveis', (req, res) => {
  console.log('Rota /api/imoveis foi acessada!');
  db.all('SELECT * FROM imoveis', [], (err, rows) => {
    if (err) console.error(err.message);
    else res.json(rows.map(row => ({ ...row, fotos: row.fotos ? JSON.parse(row.fotos) : [] })));
  });
});

// Rota para detalhes de um imóvel específico (público)
// IMPORTANTE: Esta rota deve ser pública para que os detalhes do imóvel possam ser vistos
// por usuários não logados. Mantenha-a ANTES das rotas /admin/imoveis/:id.
app.get('/api/imoveis/:id', (req, res) => {
  const imovelId = req.params.id;
  console.log('Solicitação para detalhes do imóvel com ID (PÚBLICO):', imovelId);
  db.get('SELECT * FROM imoveis WHERE id = ?', [imovelId], (err, row) => {
    if (err) console.error('Erro na consulta ao banco de dados:', err.message);
    else if (row) res.json({ ...row, fotos: row.fotos ? JSON.parse(row.fotos) : [] });
    else res.status(404).json({ mensagem: 'Detalhes do imóvel não encontrados.' });
  });
});


// Rota para busca de imóveis com filtros (público)
app.get('/api/buscar', (req, res) => {
  const { q: termoBusca, quartos, banheiros, vagas, cidade, bairro, precoMin, precoMax, tipoNegocio } = req.query;
  let sql = 'SELECT * FROM imoveis WHERE 1=1';
  const params = [];

  if (termoBusca) { sql += ' AND (titulo LIKE ? OR descricao LIKE ?)'; params.push(`%${termoBusca}%`, `%${termoBusca}%`); }
  if (quartos) { sql += ' AND quartos >= ?'; params.push(quartos); }
  if (banheiros) { sql += ' AND banheiros >= ?'; params.push(banheiros); }
  if (vagas) { sql += ' AND vagas >= ?'; params.push(vagas); }
  if (cidade) { sql += ' AND cidade LIKE ?'; params.push(`%${cidade}%`); }
  if (bairro) { sql += ' AND bairro LIKE ?'; params.push(`%${bairro}%`); }
  if (precoMin) { sql += ' AND preco >= ?'; params.push(precoMin); }
  if (precoMax) { sql += ' AND preco <= ?'; params.push(precoMax); }
  if (tipoNegocio) { sql += ' AND tipo_negocio = ?'; params.push(tipoNegocio); }

  db.all(sql, params, (err, rows) => {
    if (err) console.error(err.message);
    else res.json(rows.map(row => ({ ...row, fotos: row.fotos ? JSON.parse(row.fotos) : [] })));
  });
});

// Rota para envio de formulário de contato (público)
app.post('/api/enviar-contato', (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body;
  db.run(
    'INSERT INTO contatos (nome, email, telefone, assunto, mensagem) VALUES (?, ?, ?, ?, ?)',
    [nome, email, telefone, assunto, mensagem],
    function (err) {
      if (err) console.error(err.message);
      else res.json({ mensagem: 'Mensagem de contato enviada com sucesso!' });
    }
  );
});

// --- ROTAS DE AUTENTICAÇÃO ---

// Rota para registro de usuário (público, se quiser permitir registro)
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ message: 'Nome de usuário já existe.' });
        }
        console.error("Erro ao registrar usuário:", err.message);
        return res.status(500).json({ message: 'Erro ao registrar usuário.' });
      }
      res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: this.lastID });
    });
  } catch (error) {
    console.error("Erro ao fazer hash da senha:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para login de usuário (público)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      console.error("Erro na consulta de login:", err.message);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Nome de usuário ou senha inválidos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Nome de usuário ou senha inválidos.' });
    }

    // Se as credenciais estiverem corretas, gera um token JWT
    // Aumentei o tempo de expiração para facilitar os testes (ex: 24 horas)
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login bem-sucedido!', token });
  });
});

// --- ROTAS PROTEGIDAS (exigem autenticação) ---

// Rota para listar imóveis na área de administração
app.get('/admin/imoveis', authenticateToken, (req, res) => {
  console.log('Rota /admin/imoveis acessada com autenticação!');
  db.all('SELECT * FROM imoveis', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao carregar os imóveis para administração.' });
    } else {
      res.json(rows.map(row => ({ ...row, fotos: row.fotos ? JSON.parse(row.fotos) : [] })));
    }
  });
});

// Rota para anunciar um novo imóvel (com upload de fotos)
app.post('/api/anunciar', authenticateToken, upload.array('fotos', 5), (req, res) => {
  const { titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, tipo_negocio } = req.body;
  const fotos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
  const fotosJSON = JSON.stringify(fotos);
  console.log("Dados recebidos para anunciar:", { titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, tipo_negocio, fotos });
  console.log("String JSON de fotos:", fotosJSON);
  db.run(
    'INSERT INTO imoveis (titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, fotos, tipo_negocio, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, fotosJSON, tipo_negocio, 'pendente'],
    function (err) {
      if (err) {
        console.error("Erro ao anunciar o imóvel:", err);
        return res.status(500).json({ error: 'Erro ao anunciar o imóvel.' });
      }
      res.json({ mensagem: 'Imóvel anunciado com sucesso!', id: this.lastID });
    }
  );
});

// Rota para atualizar um imóvel existente (com upload de fotos)
app.put('/api/imoveis/:id', authenticateToken, upload.array('novasFotos', 5), (req, res) => {
  const imovelId = req.params.id;
  const { titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, tipo_negocio, destaque, fotosParaRemover } = req.body;
  const novasFotos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  console.log('Recebida solicitação PUT para o imóvel com ID:', imovelId, 'com os dados:', { ...req.body, novasFotos: req.files ? req.files.map(f => f.originalname) : [] });

  db.get('SELECT fotos FROM imoveis WHERE id = ?', [imovelId], (err, row) => {
    if (err) {
      console.error('Erro ao buscar fotos antigas:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar fotos antigas.' });
    }

    let fotosExistentes = row && row.fotos ? JSON.parse(row.fotos) : [];
    const fotosParaRemoverArray = fotosParaRemover ? JSON.parse(fotosParaRemover) : [];

    // Remover fotos marcadas para exclusão
    fotosParaRemoverArray.forEach(nomeArquivoRemover => {
      const caminhoArquivoRemover = path.join(__dirname, 'uploads', nomeArquivoRemover);
      fs.unlink(caminhoArquivoRemover, (err) => {
        if (err) console.error('Erro ao excluir arquivo:', caminhoArquivoRemover, err);
      });
      fotosExistentes = fotosExistentes.filter(foto => foto.split('/').pop() !== nomeArquivoRemover);
    });

    // Adicionar novas fotos
    const fotosAtualizadas = [...fotosExistentes, ...novasFotos];
    const fotosAtualizadasJSON = JSON.stringify(fotosAtualizadas);

    db.run(
      `UPDATE imoveis SET
        titulo = ?,
        tipo = ?,
        preco = ?,
        endereco = ?,
        bairro = ?,
        cidade = ?,
        quartos = ?,
        banheiros = ?,
        vagas = ?,
        area_util = ?,
        area_total = ?,
        descricao = ?,
        tipo_negocio = ?,
        destaque = ?,
        fotos = ?
      WHERE id = ?`,
      [titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, tipo_negocio, destaque, fotosAtualizadasJSON, imovelId],
      function (err) {
        if (err) {
          console.error('Erro ao atualizar o imóvel:', err.message);
          return res.status(500).json({ error: 'Erro ao atualizar o imóvel no banco de dados.' });
        }
        if (this.changes > 0) {
          res.json({ mensagem: 'Imóvel atualizado com sucesso!', id: imovelId, fotos: fotosAtualizadas });
        } else {
          res.status(404).json({ mensagem: 'Imóvel não encontrado para atualização.' });
        }
      }
    );
  });
});

// Rota para excluir um imóvel (protegida por autenticação)
app.delete('/api/imoveis/:id', authenticateToken, (req, res) => {
  const imovelId = req.params.id;
  console.log(`Recebida solicitação DELETE para o imóvel com ID: ${imovelId}`);

  // Primeiro, buscar os caminhos das fotos para excluí-las do sistema de arquivos
  db.get('SELECT fotos FROM imoveis WHERE id = ?', [imovelId], (err, row) => {
    if (err) {
      console.error('Erro ao buscar fotos do imóvel para exclusão:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar fotos do imóvel.' });
    }

    let fotosParaExcluir = [];
    if (row && row.fotos) {
      fotosParaExcluir = JSON.parse(row.fotos);
    }

    // Agora, exclua o registro do imóvel do banco de dados
    db.run('DELETE FROM imoveis WHERE id = ?', [imovelId], function (err) {
      if (err) {
        console.error('Erro ao excluir o imóvel do banco de dados:', err.message);
        return res.status(500).json({ error: 'Erro ao excluir o imóvel.' });
      }

      if (this.changes > 0) {
        // Se o imóvel foi excluído do DB, agora exclua os arquivos de fotos
        fotosParaExcluir.forEach(fotoPath => {
          // Extrai o nome do arquivo do caminho completo para construir o path local
          const filename = fotoPath.split('/').pop();
          const fullPath = path.join(__dirname, 'uploads', filename);

          fs.unlink(fullPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Erro ao excluir arquivo de foto: ${fullPath}`, unlinkErr);
            } else {
              console.log(`Arquivo de foto excluído: ${fullPath}`);
            }
          });
        });
        res.json({ message: 'Imóvel excluído com sucesso!' });
      } else {
        res.status(404).json({ message: 'Imóvel não encontrado.' });
      }
    });
  });
});

// Nova Rota Protegida: Atualizar o Status de um Imóvel
app.put('/admin/imoveis/:id/status', authenticateToken, (req, res) => {
  const imovelId = req.params.id;
  const { status } = req.body; // Espera receber { status: "novo_status" }

  // Lista de status permitidos para validação básica (adicione ou remova conforme necessário)
  const allowedStatuses = ['pendente', 'aprovado', 'vendido', 'alugado', 'inativo'];

  if (!status || !allowedStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ message: 'Status inválido fornecido.' });
  }

  db.run(
    'UPDATE imoveis SET status = ? WHERE id = ?',
    [status.toLowerCase(), imovelId], // Converte para minúsculas para consistência
    function (err) {
      if (err) {
        console.error('Erro ao atualizar status do imóvel:', err.message);
        return res.status(500).json({ error: 'Erro ao atualizar status do imóvel.' });
      }
      if (this.changes > 0) {
        res.json({ message: 'Status do imóvel atualizado com sucesso!', id: imovelId, newStatus: status });
      } else {
        res.status(404).json({ message: 'Imóvel não encontrado para atualização de status.' });
      }
    }
  );
});

// --- ROTAS PROTEGIDAS PARA CONTATOS ---
app.get('/admin/contatos', authenticateToken, (req, res) => {
  console.log('Rota /admin/contatos acessada com autenticação!');
  db.all('SELECT * FROM contatos ORDER BY data_envio DESC', [], (err, rows) => {
    if (err) {
      console.error('Erro ao carregar os contatos:', err.message);
      return res.status(500).json({ error: 'Erro ao carregar os contatos.' });
    }
    res.json(rows);
  });
});

app.delete('/admin/contatos/:id', authenticateToken, (req, res) => {
  const contatoId = req.params.id;
  console.log(`Recebida solicitação DELETE para o contato com ID: ${contatoId}`);

  db.run('DELETE FROM contatos WHERE id = ?', [contatoId], function (err) {
    if (err) {
      console.error('Erro ao excluir o contato:', err.message);
      return res.status(500).json({ error: 'Erro ao excluir o contato.' });
    }
    if (this.changes > 0) {
      res.json({ message: 'Contato excluído com sucesso!' });
    } else {
      res.status(404).json({ message: 'Contato não encontrado.' });
    }
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor Node.js rodando na porta ${port}`);
});
