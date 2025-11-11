import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  criarUsuario,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  verificarSenha,
  atualizarSenha,
  salvarTokenRecuperacao,
  buscarUsuarioPorTokenRecuperacao,
  limparTokenRecuperacao
} from "../models/userModel.js";
import {
  validarEmail,
  validarSenha,
  validarNome,
  sanitizarTexto
} from "../utils/validators.js";
import { authConfig } from "../config/authConfig.js";

/**
 * Gera JWT token
 */
function gerarToken(userId, email) {
  return jwt.sign(
    { id: userId, email },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn }
  );
}

/**
 * Cadastro de novo usuário
 */
export async function cadastrar(req, res) {
  try {
    const { nome, email, senha } = req.body;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Todos os campos são obrigatórios",
        campos: { nome: !!nome, email: !!email, senha: !!senha }
      });
    }

    // Validar nome
    const validacaoNome = validarNome(nome);
    if (!validacaoNome.valido) {
      return res.status(400).json({ erro: validacaoNome.erro });
    }

    // Validar email
    if (!validarEmail(email)) {
      return res.status(400).json({ erro: "Email inválido" });
    }

    // Validar senha
    const validacaoSenha = validarSenha(senha);
    if (!validacaoSenha.valida) {
      return res.status(400).json({
        erro: "Senha não atende aos requisitos de segurança",
        requisitos: validacaoSenha.erros
      });
    }

    // Verificar se o email já existe
    const usuarioExistente = await buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({
        erro: "Este email já está cadastrado"
      });
    }

    // Criar usuário
    const resultado = await criarUsuario({
      nome: sanitizarTexto(nome),
      email: email.toLowerCase().trim(),
      senha
    });

    // Gerar token
    const token = gerarToken(resultado.insertedId, email);

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: {
        id: resultado.insertedId,
        nome: sanitizarTexto(nome),
        email: email.toLowerCase()
      },
      token
    });

  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
    res.status(500).json({
      erro: "Erro ao cadastrar usuário. Tente novamente."
    });
  }
}

/**
 * Login de usuário
 */
export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    // Validações básicas
    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios"
      });
    }

    // Buscar usuário
    const usuario = await buscarUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha incorretos"
      });
    }

    // Verificar senha
    const senhaCorreta = await verificarSenha(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "Email ou senha incorretos"
      });
    }

    // Gerar token
    const token = gerarToken(usuario._id, usuario.email);

    res.status(200).json({
      mensagem: "Login realizado com sucesso",
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    });

  } catch (erro) {
    console.error("Erro ao fazer login:", erro);
    res.status(500).json({
      erro: "Erro ao realizar login. Tente novamente."
    });
  }
}

/**
 * Obter dados do usuário logado
 */
export async function obterPerfil(req, res) {
  try {
    // req.user vem do middleware de autenticação
    const usuario = await buscarUsuarioPorId(req.user.id);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.status(200).json({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      criado_em: usuario.criado_em,
      email_verificado: usuario.email_verificado
    });

  } catch (erro) {
    console.error("Erro ao obter perfil:", erro);
    res.status(500).json({ erro: "Erro ao obter perfil" });
  }
}

/**
 * Solicitar recuperação de senha
 */
export async function solicitarRecuperacaoSenha(req, res) {
  try {
    const { email } = req.body;

    if (!email || !validarEmail(email)) {
      return res.status(400).json({ erro: "Email inválido" });
    }

    // Buscar usuário
    const usuario = await buscarUsuarioPorEmail(email);

    // Por segurança, sempre retornar sucesso mesmo se o email não existir
    // (evita que atacantes descubram quais emails estão cadastrados)
    if (!usuario) {
      return res.status(200).json({
        mensagem: "Se o email estiver cadastrado, você receberá instruções para recuperação"
      });
    }

    // Gerar token de recuperação
    const token = crypto.randomBytes(32).toString('hex');
    const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Salvar token
    await salvarTokenRecuperacao(usuario._id, token, expiraEm);

    // TODO: Enviar email com o link de recuperação
    // Por enquanto, retornar o token (APENAS PARA DESENVOLVIMENTO!)
    console.log(`Token de recuperação: ${token}`);
    console.log(`Link: http://localhost:3000/recuperar-senha/${token}`);

    res.status(200).json({
      mensagem: "Se o email estiver cadastrado, você receberá instruções para recuperação"
    });

  } catch (erro) {
    console.error("Erro ao solicitar recuperação:", erro);
    res.status(500).json({ erro: "Erro ao processar solicitação" });
  }
}

/**
 * Resetar senha com token
 */
export async function resetarSenha(req, res) {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({
        erro: "Token e nova senha são obrigatórios"
      });
    }

    // Validar nova senha
    const validacaoSenha = validarSenha(novaSenha);
    if (!validacaoSenha.valida) {
      return res.status(400).json({
        erro: "Senha não atende aos requisitos de segurança",
        requisitos: validacaoSenha.erros
      });
    }

    // Buscar usuário pelo token
    const usuario = await buscarUsuarioPorTokenRecuperacao(token);
    if (!usuario) {
      return res.status(400).json({
        erro: "Token inválido ou expirado"
      });
    }

    // Atualizar senha
    await atualizarSenha(usuario._id, novaSenha);

    // Limpar token de recuperação
    await limparTokenRecuperacao(usuario._id);

    res.status(200).json({
      mensagem: "Senha alterada com sucesso"
    });

  } catch (erro) {
    console.error("Erro ao resetar senha:", erro);
    res.status(500).json({ erro: "Erro ao resetar senha" });
  }
}

/**
 * Alterar senha (usuário logado)
 */
export async function alterarSenha(req, res) {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        erro: "Senha atual e nova senha são obrigatórias"
      });
    }

    // Validar nova senha
    const validacaoSenha = validarSenha(novaSenha);
    if (!validacaoSenha.valida) {
      return res.status(400).json({
        erro: "Nova senha não atende aos requisitos de segurança",
        requisitos: validacaoSenha.erros
      });
    }

    // Buscar usuário
    const usuario = await buscarUsuarioPorId(req.user.id);
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Verificar senha atual
    const senhaCorreta = await verificarSenha(senhaAtual, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Senha atual incorreta" });
    }

    // Atualizar senha
    await atualizarSenha(usuario._id, novaSenha);

    res.status(200).json({
      mensagem: "Senha alterada com sucesso"
    });

  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);
    res.status(500).json({ erro: "Erro ao alterar senha" });
  }
}