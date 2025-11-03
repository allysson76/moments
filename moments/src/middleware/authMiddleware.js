import jwt from "jsonwebtoken";
import { authConfig } from "../config/authConfig.js";
import { buscarUsuarioPorId } from "../models/userModel.js";

/**
 * Middleware para verificar autenticação
 * Adiciona req.user com os dados do usuário autenticado
 */
export async function verificarAutenticacao(req, res, next) {
    try {
        // Obter token do header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                erro: "Token de autenticação não fornecido",
                codigo: "TOKEN_AUSENTE"
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                erro: "Formato de token inválido. Use: Bearer {token}",
                codigo: "FORMATO_INVALIDO"
            });
        }

        const token = parts[1];

        // Verificar e decodificar token
        let decoded;
        try {
            decoded = jwt.verify(token, authConfig.jwtSecret);
        } catch (erro) {
            if (erro.name === 'TokenExpiredError') {
                return res.status(401).json({
                    erro: "Token expirado. Faça login novamente",
                    codigo: "TOKEN_EXPIRADO"
                });
            }

            if (erro.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    erro: "Token inválido",
                    codigo: "TOKEN_INVALIDO"
                });
            }

            throw erro;
        }

        // Verificar se o usuário ainda existe e está ativo
        const usuario = await buscarUsuarioPorId(decoded.id);

        if (!usuario) {
            return res.status(401).json({
                erro: "Usuário não encontrado ou inativo",
                codigo: "USUARIO_INVALIDO"
            });
        }

        // Adicionar dados do usuário à requisição
        req.user = {
            id: usuario._id.toString(),
            email: usuario.email,
            nome: usuario.nome
        };

        // Continuar para a próxima função
        next();

    } catch (erro) {
        console.error("Erro no middleware de autenticação:", erro);
        res.status(500).json({
            erro: "Erro ao verificar autenticação",
            codigo: "ERRO_INTERNO"
        });
    }
}

/**
 * Middleware opcional - não bloqueia se não houver token
 * Útil para rotas que podem funcionar com ou sem autenticação
 */
export async function verificarAutenticacaoOpcional(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            // Sem token, continua sem user
            req.user = null;
            return next();
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            req.user = null;
            return next();
        }

        const token = parts[1];

        try {
            const decoded = jwt.verify(token, authConfig.jwtSecret);
            const usuario = await buscarUsuarioPorId(decoded.id);

            if (usuario) {
                req.user = {
                    id: usuario._id.toString(),
                    email: usuario.email,
                    nome: usuario.nome
                };
            } else {
                req.user = null;
            }

        } catch (erro) {
            // Token inválido ou expirado, mas não bloqueia
            req.user = null;
        }

        next();

    } catch (erro) {
        console.error("Erro no middleware de autenticação opcional:", erro);
        req.user = null;
        next();
    }
}

/**
 * Middleware para verificar se o recurso pertence ao usuário
 * Útil para proteger recursos específicos
 */
export function verificarPropriedade(getRecursoUserId) {
    return async (req, res, next) => {
        try {
            // Obter o ID do usuário dono do recurso
            const recursoUserId = await getRecursoUserId(req);

            if (!recursoUserId) {
                return res.status(404).json({
                    erro: "Recurso não encontrado"
                });
            }

            // Verificar se o usuário logado é o dono
            if (recursoUserId.toString() !== req.user.id) {
                return res.status(403).json({
                    erro: "Você não tem permissão para acessar este recurso",
                    codigo: "ACESSO_NEGADO"
                });
            }

            next();

        } catch (erro) {
            console.error("Erro ao verificar propriedade:", erro);
            res.status(500).json({
                erro: "Erro ao verificar permissões"
            });
        }
    };
}