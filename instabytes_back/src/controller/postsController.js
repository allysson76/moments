import fs from "fs";
import { getAllPosts, creatPost, atualizarPost } from "../models/postsModels.js";
import gerarDescricaoComGemini from "../services/geminiService.js";

// Função para listar todos os posts
export async function listarPosts(req, res) {
  // Obter todos os posts do banco de dados
  const posts = await getAllPosts();
  // Enviar uma resposta HTTP com status 200 (OK) e os posts em formato JSON
  res.status(200).json(posts);
};

// Função para criar um novo post
export async function enviarPost(req, res) {
  // Obter o novo post do corpo da requisição
  const newPost = req.body;

  try {
    // Criar o novo post no banco de dados
    const postCreated = await creatPost(newPost);
    // Enviar uma resposta HTTP com status 200 (OK) e o post criado em formato JSON
    res.status(200).json(postCreated);
  } catch (error) {
    // Logar o erro no console
    console.error(error.message);
    // Enviar uma resposta HTTP com status 500 (Internal Server Error) e uma mensagem de erro
    res.status(500).json({"Erro": "Falha na requisição."});
  }
};

// Função para fazer upload de uma imagem e criar um novo post
export async function uploadImage(req, res) {
  // Criar um novo objeto de post com a descrição e o nome do arquivo da imagem
  const newPost = {
    description: "",
    image_url: req.file.originalname, 
    alt: ""
  };

  try {
    // Criar o novo post no banco de dados
    const postCreated = await creatPost(newPost);
    // Construir o caminho completo para a imagem atualizada
    const imagemAtualizada = `uploads/${postCreated.insertedId}.png`;
    // Renomear o arquivo da imagem para o novo nome
    fs.renameSync(req.file.path, imagemAtualizada);
    // Enviar uma resposta HTTP com status 200 (OK) e o post criado em formato JSON
    res.status(200).json(postCreated);
  } catch (error) {
    // Logar o erro no console
    console.error(error.message);
    // Enviar uma resposta HTTP com status 500 (Internal Server Error) e uma mensagem de erro
    res.status(500).json({"Erro": "Falha na requisição."});
  }
};

// Função para atualizar um novo post
export async function atualizarNovoPost(req, res) {
  const id = req.params.id;
  const url_imagem = `http://localhost:3000/${id}.png`;

  try {
    const imageBuffer = fs.readFileSync(`uploads/${id}.png`);
    const descricao = await gerarDescricaoComGemini(imageBuffer);

    const postAtualizado = {
      image_url: url_imagem,
      description: descricao,
      alt: req.body.alt
    }

    const postCreated = await atualizarPost(id, postAtualizado);
    res.status(200).json(postCreated);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({"Erro": "Falha na requisição."});
  }
};