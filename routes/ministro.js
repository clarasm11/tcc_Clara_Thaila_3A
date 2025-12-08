const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Ministro, Endereco, Genero } = require('../models');

//  ROTA: Cadastro de novo ministro
router.post('/cadastro', async (req, res) => {
  try {
    const dados = req.body;

    // 🔹 Checa duplicidade de login
    const loginDuplicado = await Ministro.findOne({ where: { login: dados.login } });
    if (loginDuplicado) {
      return res.status(400).json({ message: 'Este login já existe para outro ministro.' });
    }

    

    // Cria o endereço primeiro
    const enderecoCriado = await Endereco.create({
      rua: dados.rua,
      numero: dados.nResidencia,
      bairro: dados.bairro,
      cidade: dados.cidade,
      uf: dados.uf,
      cep: dados.cep,
      obs: dados.obs
    });

    // Ajusta dados
    const generoCod = dados.genero || 1;

    // Normaliza campo `pastor` para boolean (aceita 1/0 do front ou 'simPastor'/'nPastor')
    if (typeof dados.pastor === 'number') {
      dados.pastor = dados.pastor === 1;
    } else if (typeof dados.pastor === 'string') {
      if (dados.pastor === '1' || dados.pastor.toLowerCase() === 'true' || dados.pastor === 'simPastor') {
        dados.pastor = true;
      } else {
        dados.pastor = false;
      }
    } else {
      dados.pastor = !!dados.pastor;
    }

    // Normaliza email vazio para null, evitando falha na validação `isEmail` do Sequelize
    if (!dados.email || String(dados.email).trim() === '') {
      dados.email = null;
    }

    dados.validado = false;
    dados.ativo = true;
    dados.fK_genero = parseInt(dados.genero);

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(dados.senha, salt);

    const novoMinistro = await Ministro.create({
      nome: dados.nome,
      login: dados.login,
      senha: senhaHash,
      dataNasc: dados.dataNasc,
      dataIng: dados.dataIng,
      rg: dados.rg,
      cpf: dados.cpf,
      fone: dados.fone,
      email: dados.email,
      habilidades: dados.habilidades,
      restricoes: dados.restricoes,
      escolaridade: dados.escolaridade,
      profissao: dados.profissao,
      projetoIgreja: dados.projetoIgreja,
      pastor: dados.pastor,
      obs: dados.obsAdicional,
      fK_endereco: enderecoCriado.cod,
      fK_genero: generoCod,
      ativo: true,
      validado: false
    });

    res.status(201).json({ message: "Ministro cadastrado com sucesso!", ministro: novoMinistro });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao cadastrar ministro." });
  }
});

//  ROTA: Listar ministros ativos
router.get('/listar', async (req, res) => {
  try {
    const ministros = await Ministro.findAll({
      attributes: ['cod', 'nome'],
      where: { ativo: true },
      include: [Endereco, Genero]
    });
    res.json(ministros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar ministros' });
  }
});

//  ROTA: Buscar detalhes de um ministro específico
router.get('/detalhes/:cod', async (req, res) => {
  try {
    const ministro = await Ministro.findByPk(req.params.cod, {
      include: [
        { model: Endereco, as: 'Endereco' },
        { model: Genero, as: 'Genero' }
      ]
    });
    if (!ministro) return res.status(404).json({ error: 'Ministro não encontrado' });
    res.json(ministro);
  } catch (error) {
    console.error('Erro ao buscar ministro:', error);
    res.status(500).json({ error: 'Erro ao buscar ministro', details: error.message });
  }
});

//  ROTA: Inativar ministro
router.put('/inativar/:cod', async (req, res) => {
  try {
    const ministro = await Ministro.findByPk(req.params.cod);
    if (!ministro) return res.status(404).json({ error: 'Ministro não encontrado' });

    ministro.ativo = false;
    await ministro.save();

    res.json({ message: 'Ministro inativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao inativar ministro.' });
  }
});

// =========================
// PERFIL (sem cod na URL)
// =========================

// 🔹 Buscar dados do ministro logado
router.post('/perfil', async (req, res) => {
  try {
    const { cod } = req.body;
    if (!cod) return res.status(400).json({ erro: 'Código não informado' });

    const ministro = await Ministro.findByPk(cod, {
      include: [
        { model: Endereco, as: 'Endereco', required: false },
        { model: Genero, as: 'Genero', required: false }
      ]
    });

    if (!ministro) return res.status(404).json({ erro: 'Ministro não encontrado' });
    res.json(ministro);
  } catch (erro) {
    console.error("Erro ao buscar perfil do ministro:", erro);
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
});

// 🔹 Atualizar dados do ministro logado
router.put('/perfil', async (req, res) => {
  try {
    const { cod, Endereco: enderecoPayload, senha, login, ...payload } = req.body;
    if (!cod) return res.status(400).json({ erro: 'Código do ministro não informado' });

    const ministro = await Ministro.findByPk(cod, {
      include: [{ model: Endereco, as: 'Endereco' }]
    });
    if (!ministro) return res.status(404).json({ erro: 'Ministro não encontrado' });

    // 🔹 Checa login duplicado
    if (login) {
      const loginDuplicado = await Ministro.findOne({ where: { login } });
      if (loginDuplicado && loginDuplicado.cod !== ministro.cod) {
        return res.status(400).json({ message: 'Este login já existe para outro ministro.' });
      }
      payload.login = login;
    }

    // 🔹 Checa senha duplicada
    if (senha) {
      const ministros = await Ministro.findAll({ attributes: ['senha'] });
      for (const m of ministros) {
        if (m.senha && await bcrypt.compare(senha, m.senha)) {
          return res.status(400).json({ message: 'Esta senha já está em uso por outro ministro.' });
        }
      }
      const salt = await bcrypt.genSalt(10);
      payload.senha = await bcrypt.hash(senha, salt);
    }

    // 🔹 Normaliza email vazio para null, evitando falha na validação `isEmail`
    if (payload.email !== undefined) {
      if (!payload.email || String(payload.email).trim() === '') {
        payload.email = null;
      }
    }

    if (ministro.Endereco && enderecoPayload) {
      await ministro.Endereco.update(enderecoPayload);
    }

    await ministro.update({
      ...payload,
      validado: payload.validado
    });

    res.json({ mensagem: 'Ministro atualizado com sucesso', ministro });
  } catch (erro) {
    console.error("Erro ao atualizar ministro (sem cod na URL):", erro);
    res.status(500).json({ erro: 'Erro ao atualizar ministro' });
  }
});

// =========================
// ATUALIZAÇÃO COM cod NA URL
// =========================
router.put('/:cod', async (req, res) => {
  try {
    const cod = req.params.cod;
    const { login, senha, ...dados } = req.body;

    const ministro = await Ministro.findByPk(cod);
    if (!ministro) return res.status(404).json({ message: "Ministro não encontrado." });

 
 

    if (ministro.fk_endereco) {
      const endereco = await Endereco.findByPk(ministro.fk_endereco);
      if (endereco && dados.endereco) {
        await endereco.update(dados.endereco);
      }
    }

    await ministro.update({
      ...dados,
      validado: dados.validado
    });

    res.json({ message: "Ministro atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao editar ministro:", error);
    res.status(500).json({ error: "Erro ao editar ministro." });
  }
});

//  ROTA: Listar todos
router.get('/listar/todos', async (req, res) => {
  try {
    const ministros = await Ministro.findAll();
    res.json(ministros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar ministros.' });
  }
});

//  ROTA: Ativar ministro novamente
router.put('/ativar/:cod', async (req, res) => {
  try {
    const cod = req.params.cod;
    const ministro = await Ministro.findByPk(cod);
    if (!ministro) return res.status(404).json({ message: "Ministro não encontrado." });

    ministro.ativo = true;
    await ministro.save();

    res.json({ message: "Ministro ativado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao ativar ministro." });
  }
});

module.exports = router;
