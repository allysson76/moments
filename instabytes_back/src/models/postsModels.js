import 'dotenv/config';
import { ObjectId } from "mongodb";
import conectarAoBanco from "../config/dbConfig.js";

// Conecta ao banco de dados usando a string de conexão fornecida como variável de ambiente
const conection = await conectarAoBanco(process.env.STRING_CONECTION);

// Função assíncrona para obter todos os posts do banco de dados
export async function getAllPosts() {
    // Seleciona o banco de dados "imersao_instabytes"
    const db = conection.db("imersao_instabytes");
    // Seleciona a coleção "posts" dentro do banco de dados
    const collection = db.collection("posts");

    // Busca todos os documentos da coleção e retorna como um array
    return collection.find().toArray();
};

export async function creatPost(newPost) {
    const db = conection.db("imersao_instabytes");
    const collection = db.collection("posts");

    return collection.insertOne(newPost);
};

export async function atualizarPost(id, newPost) {
    const objectId = ObjectId.createFromHexString(id);

    const db = conection.db("imersao_instabytes");
    const collection = db.collection("posts");

    return collection.updateOne({_id: new ObjectId(objectId)}, {$set:newPost});
};