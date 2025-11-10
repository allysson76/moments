import express from "express";
import {
  cadastrar,
  login,
  obterPerfil,
  solicitarRecuperacaoSenha,
  resetarSenha,
  alterarSenha
} from "../controllers/authController.js";
import { verificarAutenticacao } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Rotas públicas (sem autenticação)
 */

// POST /auth/cadastrar - Cadastrar novo usuário
router.post("/cadastrar", cadastrar);

// POST /auth/login - Fazer login
router.post("/login", login);

// POST /auth/recuperar-senha - Solicitar recuperação de senha
router.post("/recuperar-senha", solicitarRecuperacaoSenha);

// POST /auth/resetar-senha - Resetar senha com token
router.post("/resetar-senha", resetarSenha);

/**
 * Rotas protegidas (requerem autenticação)
 */

// GET /auth/perfil - Obter dados do usuário logado
router.get("/perfil", verificarAutenticacao, obterPerfil);

// PUT /auth/alterar-senha - Alterar senha do usuário logado
router.put("/alterar-senha", verificarAutenticacao, alterarSenha);

export default router;