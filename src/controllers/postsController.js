import fs from "fs";
import {
    getAllPosts,
    creatPost,
    atualizarPost,
    buscarPostPorId
} from "../models/postsModel.js";
import gerarDescricaoComGemini from "../services/geminiService.js";

// Listar apenas posts do usuário logado
export async function listarPosts(req, res) {
    try {
        // req.user.id vem do middleware de autenticação
        const posts = await getAllPosts(req.user.id);
        res.status(200).json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ "Erro": "Falha ao listar posts." });
    }
}

// Criar post para o usuário logado
export async function enviarPost(req, res) {
    const newPost = {
        ...req.body,
        usuario_id: req.user.id,  // Adicionar ID do usuário
        criado_em: new Date()
    };

    try {
        const postCreated = await creatPost(newPost);
        res.status(200).json(postCreated);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ "Erro": "Falha na requisição." });
    }
}

// Upload de imagem para o usuário logado
export async function uploadImage(req, res) {
    const newPost = {
        description: "",
        image_url: req.file.originalname,
        alt: "",
        usuario_id: req.user.id,  // Adicionar ID do usuário
        criado_em: new Date()
    };

    try {
        const postCreated = await creatPost(newPost);
        const imagemAtualizada = `uploads/${postCreated.insertedId}.png`;
        fs.renameSync(req.file.path, imagemAtualizada);
        res.status(200).json(postCreated);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ "Erro": "Falha na requisição." });
    }
}

// Atualizar post (verificando propriedade)
export async function atualizarNovoPost(req, res) {
    const id = req.params.id;

    try {
        // Verificar se o post pertence ao usuário
        const postExistente = await buscarPostPorId(id);

        if (!postExistente) {
            return res.status(404).json({ "Erro": "Post não encontrado." });
        }

        if (postExistente.usuario_id !== req.user.id) {
            return res.status(403).json({
                "Erro": "Você não tem permissão para atualizar este post."
            });
        }

        const url_imagem = `http://localhost:3000/${id}.png`;
        const imageBuffer = fs.readFileSync(`uploads/${id}.png`);
        const descricao = await gerarDescricaoComGemini(imageBuffer);

        const postAtualizado = {
            image_url: url_imagem,
            description: descricao,
            alt: req.body.alt,
            atualizado_em: new Date()
        };

        const postCreated = await atualizarPost(id, postAtualizado);
        res.status(200).json(postCreated);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ "Erro": "Falha na requisição." });
    }
}