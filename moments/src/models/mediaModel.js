import 'dotenv/config';
import { ObjectId } from "mongodb";
import conectarAoBanco from "../config/dbConfig.js";

const connection = await conectarAoBanco(process.env.STRING_CONECTION);

/**
 * Buscar todas as mídias do usuário (biblioteca unificada)
 * Ordenado por data de criação (mais recente primeiro)
 */
export async function buscarMidias(userId, opcoes = {}) {
    const db = connection.db("moments_db");
    const collection = db.collection("media");

    const {
        limite = 50,
        pagina = 1,
        tipo = null // 'image' ou 'video'
    } = opcoes;

    const filtro = { userId };

    if (tipo) {
        filtro.mediaType = tipo;
    }

    const skip = (pagina - 1) * limite;

    const midias = await collection
        .find(filtro)
        .sort({ createdAt: -1 }) // Mais recente primeiro
        .skip(skip)
        .limit(limite)
        .toArray();

    const total = await collection.countDocuments(filtro);

    return {
        midias,
        paginacao: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite)
        }
    };
}

/**
 * Criar nova mídia
 */
export async function criarMidia(dadosMidia) {
    const db = connection.db("moments_db");
    const collection = db.collection("media");

    const novaMidia = {
        userId: dadosMidia.userId,
        storageKey: dadosMidia.storageKey,
        filename: dadosMidia.filename,
        mediaType: dadosMidia.mediaType, // 'image' ou 'video'
        fileSizeBytes: dadosMidia.fileSizeBytes,
        mimeType: dadosMidia.mimeType,
        createdAt: new Date(),
        metadata: dadosMidia.metadata || {},
        aiTags: dadosMidia.aiTags || []
    };

    return collection.insertOne(novaMidia);
}

/**
 * Buscar mídia por ID (com verificação de propriedade)
 */
export async function buscarMidiaPorId(mediaId, userId) {
    const db = connection.db("moments_db");
    const collection = db.collection("media");

    try {
        return await collection.findOne({
            _id: new ObjectId(mediaId),
            userId: userId // SEGURANÇA: Garantir que pertence ao usuário
        });
    } catch (erro) {
        console.error("ID de mídia inválido:", erro);
        return null;
    }
}

/**
 * Atualizar mídia (ex: adicionar tags IA)
 */
export async function atualizarMidia(mediaId, userId, atualizacoes) {
    const db = connection.db("moments_db");
    const collection = db.collection("media");

    return collection.updateOne(
        {
            _id: new ObjectId(mediaId),
            userId: userId // SEGURANÇA
        },
        {
            $set: {
                ...atualizacoes,
                updatedAt: new Date()
            }
        }
    );
}

/**
 * Deletar mídia
 */
export async function deletarMidia(mediaId, userId) {
    const db = connection.db("moments_db");
    const collection = db.collection("media");

    return collection.deleteOne({
        _id: new ObjectId(mediaId),
        userId: userId // SEGURANÇA
    });
}

/**
 * Buscar mídias por tags (busca inteligente)
 */
export async function buscarMidiasPorTags(userId, tags, opcoes = {}) {
    const db = connection.db("moments_db");
    const collection = db.collection("media");

    const { limite = 50, pagina = 1 } = opcoes;
    const skip = (pagina - 1) * limite;

    // Busca case-insensitive em aiTags
    const filtro = {
        userId,
        aiTags: {
            $in: tags.map(tag => new RegExp(tag, 'i'))
        }
    };

    const midias = await collection
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limite)
        .toArray();

    const total = await collection.countDocuments(filtro);

    return {
        midias,
        paginacao: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite)
        }
    };
}