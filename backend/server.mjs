// Renomeie este arquivo para server.mjs
import 'dotenv/config'; // Forma correta de importar o dotenv como ES Module
import express from 'express';
import { Database } from 'sqlite-async'; // MUDANÇA AQUI: Importa a classe Database
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 5000; // Porta do seu backend
const JWT_SECRET = process.env.JWT_SECRET; // Pega a chave do .env

// Verificação da chave JWT_SECRET
if (!JWT_SECRET) {
    console.error('ERRO: JWT_SECRET não definida no arquivo .env!');
    console.error('Por favor, adicione JWT_SECRET=sua_chave_secreta_aqui_muito_longa_e_aleatoria ao seu arquivo .env');
    process.exit(1); // Sai da aplicação se a chave não estiver configurada
}


app.use(cors());
app.use(express.json()); // Importante para parsear JSON no corpo das requisições
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // Servir arquivos estáticos da pasta uploads

// Variável global para a conexão do banco de dados
let db;

// Conexão e inicialização do banco de dados SQLite
// Esta função agora abre e mantém a conexão
async function initializeDb() {
    try {
        // MUDANÇA AQUI: Usa Database.open()
        db = await Database.open('./imoveis.db');
        console.log("Conectado ao banco de dados SQLite.");

        // Criação da tabela de contatos
        await db.run(`
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
        console.log("Tabela 'contatos' verificada/criada.");

        // Criação da tabela de imóveis com colunas adicionais
        await db.run(`
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
                destaque BOOLEAN DEFAULT 0, -- 0 para false, 1 para true
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
                tipo_negocio TEXT,
                status TEXT DEFAULT 'pendente'
            )
        `);
        console.log("Tabela 'imoveis' verificada/criada.");

        // Verificação e adição de colunas para compatibilidade com versões anteriores
        try {
            const rows = await db.all(`PRAGMA table_info(imoveis);`);
            
            const statusExists = rows.some(columnInfo => columnInfo.name === 'status');
            if (!statusExists) {
                await db.run(`ALTER TABLE imoveis ADD COLUMN status TEXT DEFAULT 'pendente';`);
                console.log("Coluna 'status' adicionada à tabela 'imoveis'.");
            }
            const tipoNegocioExists = rows.some(columnInfo => columnInfo.name === 'tipo_negocio');
            if (!tipoNegocioExists) {
                await db.run(`ALTER TABLE imoveis ADD COLUMN tipo_negocio TEXT;`);
                console.log("Coluna 'tipo_negocio' adicionada à tabela 'imoveis'.");
            }
             const destaqueExists = rows.some(columnInfo => columnInfo.name === 'destaque');
            if (!destaqueExists) {
                await db.run(`ALTER TABLE imoveis ADD COLUMN destaque BOOLEAN DEFAULT 0;`);
                console.log("Coluna 'destaque' adicionada à tabela 'imoveis'.");
            }
        } catch (error) {
            console.error("DEBUG (DB Init): Erro ao verificar/adicionar colunas na tabela 'imoveis':", error.message);
        }

        // Criação da tabela de usuários para autenticação
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )
        `);
        console.log("Tabela 'users' verificada/criada.");

        // Opcional: Adicionar um usuário padrão se a tabela estiver vazia
        const userCountRow = await db.get("SELECT COUNT(*) AS count FROM users");
        if (userCountRow.count === 0) {
            const defaultUsername = 'admin';
            const defaultPassword = 'admin'; // Use uma senha forte em produção!
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [defaultUsername, hashedPassword]);
            console.log("Usuário padrão 'admin' criado.");
        }
    } catch (dbErr) {
        console.error("ERRO CRÍTICO: Falha na inicialização do banco de dados:", dbErr.message);
        process.exit(1); // Encerra a aplicação se o DB não puder ser inicializado
    }
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Middleware para autenticar o token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato esperado: Bearer TOKEN

    if (token == null) {
        console.log('DEBUG (Backend Auth): Token não fornecido.');
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('DEBUG (Backend Auth): Token inválido ou expirado. Erro:', err.name, '-', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Token expirado. Faça login novamente.' });
            }
            // O erro 'JsonWebTokenError: invalid signature' indica chave secreta errada
            return res.status(403).json({ message: 'Token inválido.' });
        }
        console.log('DEBUG (Backend Auth): Token verificado com sucesso para user ID:', user.id, 'username:', user.username);
        req.user = user; // Anexa as informações do usuário à requisição
        next();
    });
};


// --- ROTAS DE AUTENTICAÇÃO (PÚBLICAS) ---

// Rota para registro de usuário
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
        res.status(201).json({ message: 'Usuário registrado com sucesso!', id: result.lastID });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Nome de usuário já existe.' });
        }
        console.error("DEBUG (Backend): Erro ao registrar usuário:", error.message);
        res.status(500).json({ message: 'Erro ao registrar usuário.' });
    }
});

// Rota para login de usuário
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    try {
        const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);

        if (!user) {
            return res.status(400).json({ message: 'Nome de usuário ou senha inválidos.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Nome de usuário ou senha inválidos.' });
        }

        // Se as credenciais estiverem corretas, gera um token JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        console.error("DEBUG (Backend): Erro no processo de login:", error.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// --- ROTAS PROTEGIDAS (exigem autenticação) ---
// Estas rotas devem vir ANTES das rotas públicas genéricas com ':id'

// Rota para listar imóveis na área de administração
app.get('/api/imoveis/admin', authenticateToken, async (req, res) => {
    console.log('DEBUG (Backend): Rota /api/imoveis/admin acessada com autenticação!');
    try {
        const imoveis = await db.all(`SELECT id, titulo, tipo, preco, tipo_negocio, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, fotos, status, destaque FROM imoveis`);

        const imoveisFormatados = imoveis.map(imovel => ({
            ...imovel,
            fotos: imovel.fotos ? JSON.parse(imovel.fotos) : []
        }));

        res.json(imoveisFormatados);
    }
    catch (error) {
        console.error('DEBUG (Backend): Erro ao buscar imóveis para administração:', error);
        res.status(500).json({ message: 'Erro ao carregar os imóveis para administração.' });
    }
});

// Rota para anunciar um novo imóvel (com upload de fotos)
app.post('/api/anunciar', authenticateToken, upload.array('fotos', 5), async (req, res) => {
    const { titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, tipo_negocio, destaque } = req.body;
    const fotos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const fotosJSON = JSON.stringify(fotos);

    // Converte destaque para 0 ou 1
    const destaqueValue = destaque === 'true' || destaque === true ? 1 : 0;

    console.log("DEBUG (Backend): Dados recebidos para anunciar:", { titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, tipo_negocio, destaque: destaqueValue, fotos });

    try {
        const result = await db.run(
            'INSERT INTO imoveis (titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, fotos, tipo_negocio, status, destaque) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, fotosJSON, tipo_negocio, 'pendente', destaqueValue]
        );
        res.status(201).json({ message: 'Imóvel anunciado com sucesso!', id: result.lastID });
    } catch (error) {
        console.error("DEBUG (Backend): Erro ao anunciar o imóvel:", error);
        res.status(500).json({ message: 'Erro ao anunciar o imóvel.' });
    }
});

// Rota para atualizar um imóvel existente (com upload de fotos)
app.put('/api/imoveis/:id', authenticateToken, upload.array('novasFotos', 5), async (req, res) => {
    const imovelId = req.params.id;
    const { titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, tipo_negocio, destaque, fotosParaRemover } = req.body;
    const novasFotos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Converte destaque para 0 ou 1
    const destaqueValue = destaque === 'true' || destaque === true ? 1 : 0;

    console.log('DEBUG (Backend): Recebida solicitação PUT para o imóvel com ID:', imovelId, 'com os dados:', { ...req.body, novasFotos: req.files ? req.files.map(f => f.originalname) : [] });

    try {
        const row = await db.get('SELECT fotos FROM imoveis WHERE id = ?', [imovelId]);

        let fotosExistentes = row && row.fotos ? JSON.parse(row.fotos) : [];
        const fotosParaRemoverArray = fotosParaRemover ? JSON.parse(fotosParaRemover) : [];

        // Remover fotos marcadas para exclusão
        fotosParaRemoverArray.forEach(nomeArquivoRemover => {
            const filenameToRemove = nomeArquivoRemover.split('/').pop();
            const caminhoArquivoRemover = path.join(process.cwd(), 'uploads', filenameToRemove);
            fs.unlink(caminhoArquivoRemover, (err) => {
                if (err) console.error('DEBUG (Backend): Erro ao excluir arquivo:', caminhoArquivoRemover, err);
            });
            fotosExistentes = fotosExistentes.filter(foto => foto.split('/').pop() !== filenameToRemove);
        });

        // Adicionar novas fotos
        const fotosAtualizadas = [...fotosExistentes, ...novasFotos];
        const fotosAtualizadasJSON = JSON.stringify(fotosAtualizadas);

        const result = await db.run(
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
            [titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, tipo_negocio, destaqueValue, fotosAtualizadasJSON, imovelId]
        );

        if (result.changes > 0) {
            res.json({ message: 'Imóvel atualizado com sucesso!', id: imovelId, fotos: fotosAtualizadas });
        } else {
            res.status(404).json({ message: 'Imóvel não encontrado para atualização.' });
        }
    } catch (error) {
        console.error('DEBUG (Backend): Erro ao atualizar o imóvel:', error.message);
        res.status(500).json({ message: 'Erro ao atualizar o imóvel no banco de dados.' });
    }
});

// Rota para excluir um imóvel (protegida por autenticação)
app.delete('/api/imoveis/:id', authenticateToken, async (req, res) => {
    const imovelId = req.params.id;
    console.log(`DEBUG (Backend): Recebida solicitação DELETE para o imóvel com ID: ${imovelId}`);

    try {
        // Primeiro, buscar os caminhos das fotos para excluí-las do sistema de arquivos
        const row = await db.get('SELECT fotos FROM imoveis WHERE id = ?', [imovelId]);

        let fotosParaExcluir = [];
        if (row && row.fotos) {
            fotosParaExcluir = JSON.parse(row.fotos);
        }

        // Agora, exclua o registro do imóvel do banco de dados
        const result = await db.run('DELETE FROM imoveis WHERE id = ?', [imovelId]);

        if (result.changes > 0) {
            // Se o imóvel foi excluído do DB, agora exclua os arquivos de fotos
            fotosParaExcluir.forEach(fotoPath => {
                const filename = fotoPath.split('/').pop();
                const fullPath = path.join(process.cwd(), 'uploads', filename);

                fs.unlink(fullPath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`DEBUG (Backend): Erro ao excluir arquivo de foto: ${fullPath}`, unlinkErr);
                    } else {
                        console.log(`DEBUG (Backend): Arquivo de foto excluído: ${fullPath}`);
                    }
                });
            });
            res.json({ message: 'Imóvel excluído com sucesso!' });
        } else {
            res.status(404).json({ message: 'Imóvel não encontrado.' });
        }
    } catch (error) {
        console.error('DEBUG (Backend): Erro ao excluir o imóvel:', error.message);
        res.status(500).json({ message: 'Erro ao excluir o imóvel.' });
    }
});

// Rota Protegida: Atualizar o Status de um Imóvel
app.put('/api/imoveis/:id/status', authenticateToken, async (req, res) => {
    const imovelId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['pendente', 'aprovado', 'vendido', 'alugado', 'inativo'];

    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: 'Status inválido fornecido.' });
    }

    try {
        const result = await db.run(
            'UPDATE imoveis SET status = ? WHERE id = ?',
            [status.toLowerCase(), imovelId]
        );

        if (result.changes > 0) {
            res.json({ message: 'Status do imóvel atualizado com sucesso!', id: imovelId, newStatus: status });
        } else {
            res.status(404).json({ message: 'Imóvel não encontrado para atualização de status.' });
        }
    } catch (error) {
        console.error('DEBUG (Backend): Erro ao atualizar status do imóvel:', error.message);
        res.status(500).json({ message: 'Erro ao atualizar status do imóvel.' });
    }
});

// Rota Protegida: Buscar Detalhes de um Imóvel Específico para Edição (Admin)
app.get('/api/imoveis/admin/:id', authenticateToken, async (req, res) => {
    const imovelId = req.params.id;
    console.log('DEBUG (Backend): Solicitação para detalhes do imóvel para ADMIN com ID:', imovelId);
    try {
        const imovel = await db.get('SELECT * FROM imoveis WHERE id = ?', [imovelId]);

        if (!imovel) {
            return res.status(404).json({ message: 'Imóvel não encontrado para administração.' });
        }
        res.json({ ...imovel, fotos: JSON.parse(imovel.fotos || '[]') });
    } catch (error) {
        console.error('DEBUG (Backend): Erro ao buscar detalhes do imóvel para admin:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para listar contatos na área de administração
app.get('/api/admin/contatos', authenticateToken, async (req, res) => {
    console.log('DEBUG (Backend): Rota /api/admin/contatos acessada com autenticação!');
    try {
        const contatos = await db.all('SELECT * FROM contatos ORDER BY data_envio DESC');
        res.json(contatos);
    } catch (error) {
        console.error('DEBUG (Backend): Erro ao carregar os contatos:', error.message);
        res.status(500).json({ message: 'Erro ao carregar os contatos.' });
    }
});

// Rota para excluir contato
app.delete('/api/admin/contatos/:id', authenticateToken, async (req, res) => {
    const contatoId = req.params.id;
    console.log(`DEBUG (Backend): Recebida solicitação DELETE para o contato com ID: ${contatoId}`);

    try {
        const result = await db.run('DELETE FROM contatos WHERE id = ?', [contatoId]);

        if (result.changes > 0) {
            res.json({ message: 'Contato excluído com sucesso!' });
        } else {
            res.status(404).json({ message: 'Contato não encontrado.' });
        }
    } catch (error) {
        console.error('DEBUG (Backend): Erro ao excluir o contato:', error.message);
        res.status(500).json({ message: 'Erro ao excluir o contato.' });
    }
});


// --- ROTAS PÚBLICAS GÊNERICAS ---

// Rota para listar todos os imóveis (público) - Para http://localhost:3000/imoveis (apenas aprovados)
app.get('/api/imoveis', async (req, res) => {
    console.log('DEBUG (Backend): Rota /api/imoveis (pública) foi acessada!');
    try {
        // Filtra apenas imóveis com status 'aprovado' para o público
        const rows = await db.all('SELECT id, titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, fotos, destaque, tipo_negocio FROM imoveis WHERE status = "aprovado"');
        res.json(rows.map(row => ({ ...row, fotos: row.fotos ? JSON.parse(row.fotos) : [] })));
    } catch (err) {
        console.error('DEBUG (Backend): Erro ao carregar os imóveis públicos:', err.message);
        res.status(500).json({ message: 'Erro ao carregar os imóveis.' });
    }
});

// Rota para destaques na Home (público)
app.get('/api/destaques-home', async (req, res) => {
    console.log('DEBUG (Backend): Rota /api/destaques-home foi acessada!');
    try {
        // Filtra destaques apenas com status 'aprovado'
        const rows = await db.all('SELECT id, titulo, tipo, preco, endereco, bairro, cidade, fotos, destaque, tipo_negocio FROM imoveis WHERE destaque = 1 AND status = "aprovado" LIMIT 6'); // Limite para 6 destaques
        res.json(rows.map(row => ({ ...row, fotos: row.fotos ? JSON.parse(row.fotos) : [] })));
    } catch (err) {
        console.error('DEBUG (Backend): Erro ao carregar os destaques:', err.message);
        res.status(500).json({ message: 'Erro ao carregar os destaques.' });
    }
});

// Rota para busca de imóveis com filtros (público)
app.get('/api/buscar', async (req, res) => {
    const { q: termoBusca, quartos, banheiros, vagas, cidade, bairro, precoMin, precoMax, tipoNegocio } = req.query;
    let sql = 'SELECT id, titulo, tipo, preco, endereco, bairro, cidade, quartos, banheiros, vagas, area_util, area_total, descricao, fotos, destaque, tipo_negocio FROM imoveis WHERE status = "aprovado"'; // Adicionado filtro de status
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

    try {
        const rows = await db.all(sql, params);
        res.json(rows.map(row => ({ ...row, fotos: row.fotos ? JSON.parse(row.fotos) : [] })));
    } catch (err) {
        console.error('DEBUG (Backend): Erro ao realizar a busca:', err.message);
        res.status(500).json({ message: 'Erro ao realizar a busca.' });
    }
});

// Rota para envio de formulário de contato (público)
app.post('/api/enviar-contato', async (req, res) => {
    const { nome, email, telefone, assunto, mensagem } = req.body;
    try {
        const result = await db.run(
            'INSERT INTO contatos (nome, email, telefone, assunto, mensagem) VALUES (?, ?, ?, ?, ?)',
            [nome, email, telefone, assunto, mensagem]
        );
        res.status(201).json({ message: 'Mensagem de contato enviada com sucesso!', id: result.lastID });
    } catch (err) {
        console.error('DEBUG (Backend): Erro ao enviar mensagem de contato:', err.message);
        res.status(500).json({ message: 'Erro ao enviar mensagem de contato.' });
    }
});

// Rota para detalhes de um imóvel específico (público) - Esta deve ser a ÚLTIMA rota com :id
app.get('/api/imoveis/:id', async (req, res) => {
    const imovelId = req.params.id;
    console.log('DEBUG (Backend): Solicitação para detalhes do imóvel com ID (PÚBLICO - GENÉRICA):', imovelId);
    try {
        const imovel = await db.get('SELECT * FROM imoveis WHERE id = ? AND status = "aprovado"', [imovelId]); // Filtra por aprovado

        if (!imovel) {
            return res.status(404).json({ message: 'Detalhes do imóvel não encontrados ou não aprovados.' });
        }
        res.json({ ...imovel, fotos: JSON.parse(imovel.fotos || '[]') });
    } catch (error) {
        console.error('DEBUG (Backend): Erro ao buscar detalhes do imóvel público:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// Inicia o servidor (chamando initializeDb primeiro)
initializeDb().then(() => {
    app.listen(port, () => {
        console.log(`Servidor Node.js rodando na porta ${port}`);
    });
});