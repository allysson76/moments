import 'dotenv/config';
import { ObjectId } from "mongodb";
import conectarAoBanco from "../config/dbConfig.js";

const conection = await conectarAoBanco(process.env.STRING_CONECTION);

// Buscar posts APENAS do usuário especificado
export async function getAllPosts(userId) {
    const db = conection.db("imersao_instabytes");
    const collection = db.collection("posts");

    // CRÍTICO: Filtrar por usuario_id
    return collection.find({ usuario_id: userId }).toArray();
}

// Criar post associado ao usuário
export async function creatPost(newPost) {
    const db = conection.db("imersao_instabytes");
    const collection = db.collection("posts");

    // newPost já deve conter usuario_id
    return collection.insertOne(newPost);
}

// Buscar post por ID (para verificação de propriedade)
export async function buscarPostPorId(id) {
    const db = conection.db("imersao_instabytes");
    const collection = db.collection("posts");

    try {
        const objectId = ObjectId.createFromHexString(id);
        return collection.findOne({ _id: objectId });
    } catch (erro) {
        console.error("ID inválido:", erro);
        return null;
    }
}

// Atualizar post (sem verificação de propriedade aqui - fazer no controller)
export async function atualizarPost(id, newPost) {
    const objectId = ObjectId.createFromHexString(id);
    const db = conection.db("imersao_instabytes");
    const collection = db.collection("posts");

    return collection.updateOne(
        { _id: new ObjectId(objectId) },
        { $set: newPost }
    );
}

// Deletar post (adicionar verificação de usuário)
export async function deletarPost(id, userId) {
    const objectId = ObjectId.createFromHexString(id);
    const db = conection.db("imersao_instabytes");
    const collection = db.collection("posts");

    // Deletar apenas se pertencer ao usuário
    return collection.deleteOne({
        _id: new ObjectId(objectId),
        usuario_id: userId
    });
}