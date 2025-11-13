// moments/src/models/mediaModel.js
import 'dotenv/config';
import { ObjectId } from "mongodb";
import conectarAoBanco from "../config/dbConfig.js";
import { DB_NAME } from "../config/dbConfig.js";

const connection = await conectarAoBanco(process.env.STRING_CONECTION);

/**
 * Buscar todas as mídias do usuário (biblioteca unificada)
 */
export async function buscarMidias(userId, opcoes = {}) {
    const db = conection.db(DB_NAME);
    const collection = db.collection("media");

    const {
        limite = 50,
        pagina = 1,
        tipo = null
    } = opcoes;

    const filtro = { userId };

    if (tipo) {
        filtro.mediaType = tipo;
    }

    const skip = (pagina - 1) * limite;

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

/**
 * Criar nova mídia
 */
export async function criarMidia(dadosMidia) {
    const db = connection.db(DB_NAME);
    const collection = db.collection("media");

    const novaMidia = {
        userId: dadosMidia.userId,
        storageKey: dadosMidia.storageKey,
        filename: dadosMidia.filename,
        mediaType: dadosMidia.mediaType,
        fileSizeBytes: dadosMidia.fileSizeBytes,
        mimeType: dadosMidia.mimeType,
        createdAt: new Date(),
        metadata: dadosMidia.metadata || {},
        aiTags: dadosMidia.aiTags || [],
        aiStatus: dadosMidia.aiStatus || 'pending',
        aiProcessedAt: dadosMidia.aiProcessedAt || null
    };

    return collection.insertOne(novaMidia);
}

/**
 * Buscar mídia por ID (com verificação de propriedade)
 */
export async function buscarMidiaPorId(mediaId, userId) {
    const db = connection.db(DB_NAME);
    const collection = db.collection("media");
    
    try {
        // ✅ Método moderno sem deprecated warning
        const objectId = ObjectId.createFromHexString(mediaId);
        
        return await collection.findOne({
            _id: objectId,
            userId: userId.toString()
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
    const db = connection.db(DB_NAME);
    const collection = db.collection("media");

    // ✅ Usar método moderno
    const objectId = ObjectId.createFromHexString(mediaId);

    return collection.updateOne(
        {
            _id: objectId,
            userId: userId
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
    return collection.updateOne(
        { _id: new ObjectId.createFromHexString(mediaId), userId },
        { 
            $set: { 
                deletedAt: new Date(),
                status: 'deleted'
            } 
        }
    );
}

/**
 * Escapar caracteres especiais de regex
 */
function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Buscar mídias por tags (busca inteligente)
 */
export async function buscarMidiasPorTags(userId, tags, opcoes = {}) {
    const db = connection.db(DB_NAME);
    const collection = db.collection("media");

    const { limite = 50, pagina = 1 } = opcoes;
    const skip = (pagina - 1) * limite;

    // Validar e sanitizar tags
    const tagsSeguras = tags
        .filter(tag => typeof tag === 'string' && tag.length > 0 && tag.length < 50)
        .map(tag => escaparRegex(tag.trim()));

    if (tagsSeguras.length === 0) {
        return {
            midias: [],
            paginacao: { total: 0, pagina, limite, totalPaginas: 0 }
        };
    }

    const filtro = { 
        userId,
        status: { $ne: 'deleted' }  // Excluir deletados
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