import 'dotenv/config';
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import conectarAoBanco from "../config/dbConfig.js";
import { authConfig } from "../config/authConfig.js";

const conection = await conectarAoBanco(process.env.STRING_CONECTION);

/**
 * Cria um novo usuário no banco de dados
 */
export async function criarUsuario(dadosUsuario) {
    const db = conection.db("moments_db");
    const collection = db.collection("usuarios");

    // Hash da senha antes de salvar
    const senhaHash = await bcrypt.hash(
        dadosUsuario.senha,
        authConfig.bcrypt.saltRounds
    );

    const novoUsuario = {
        nome: dadosUsuario.nome,
        email: dadosUsuario.email.toLowerCase(), // Sempre salvar em minúsculo
        senha_hash: senhaHash,
        criado_em: new Date(),
        atualizado_em: new Date(),
        email_verificado: false,
        ativo: true
    };

    return collection.insertOne(novoUsuario);
}

/**
 * Busca usuário por email
 */
export async function buscarUsuarioPorEmail(email) {
    const db = conection.db("moments_db");
    const collection = db.collection("usuarios");

    return collection.findOne({
        email: email.toLowerCase(),
        ativo: true
    });
}

/**
 * Busca usuário por ID
 */
export async function buscarUsuarioPorId(userId) {
    const db = conection.db("moments_db");
    const collection = db.collection("usuarios");

    return collection.findOne({
        _id: new ObjectId(userId),
        ativo: true
    });
}

/**
 * Verifica se a senha está correta
 */
export async function verificarSenha(senhaPlaintext, senhaHash) {
    return bcrypt.compare(senhaPlaintext, senhaHash);
}

/**
 * Atualiza a senha do usuário
 */
export async function atualizarSenha(userId, novaSenha) {
    const db = conection.db("moments_db");
    const collection = db.collection("usuarios");

    const senhaHash = await bcrypt.hash(
        novaSenha,
        authConfig.bcrypt.saltRounds
    );

    return collection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                senha_hash: senhaHash,
                atualizado_em: new Date()
            }
        }
    );
}

/**
 * Salva token de recuperação de senha
 */
export async function salvarTokenRecuperacao(userId, token, expiraEm) {
    const db = conection.db("moments_db");
    const collection = db.collection("usuarios");

    return collection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                reset_token: token,
                reset_token_expira: expiraEm,
                atualizado_em: new Date()
            }
        }
    );
}

/**
 * Busca usuário por token de recuperação válido
 */
export async function buscarUsuarioPorTokenRecuperacao(token) {
    const db = conection.db("moments_db");
    const collection = db.collection("usuarios");

    return collection.findOne({
        reset_token: token,
        reset_token_expira: { $gt: new Date() },
        ativo: true
    });
}

/**
 * Limpa token de recuperação após uso
 */
export async function limparTokenRecuperacao(userId) {
    const db = conection.db("moments_db");
    const collection = db.collection("usuarios");

    return collection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $unset: {
                reset_token: "",
                reset_token_expira: ""
            },
            $set: {
                atualizado_em: new Date()
            }
        }
    );
}

/**
 * Marca email como verificado
 */
export async function verificarEmail(userId) {
    const db = conection.db("moments_db");
    const collection = db.collection("usuarios");

    return collection.updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                email_verificado: true,
                atualizado_em: new Date()
            }
        }
    );
}