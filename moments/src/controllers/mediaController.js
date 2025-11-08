import fs from "fs";
import path from "path";
import {
    buscarMidias,
    criarMidia,
    buscarMidiaPorId,
    atualizarMidia,
    deletarMidia,
    buscarMidiasPorTags
} from "../models/mediaModel.js";
import gerarDescricaoComGemini from "../services/geminiService.js";

/**
 * Listar biblioteca de mídias do usuário
 * GET /media?pagina=1&limite=50&tipo=image
 */
export async function listarMidias(req, res) {
    try {
        const { pagina, limite, tipo } = req.query;

        const resultado = await buscarMidias(req.user.id, {
            pagina: pagina ? parseInt(pagina) : 1,
            limite: limite ? parseInt(limite) : 50,
            tipo
        });

        res.status(200).json(resultado);
    } catch (erro) {
        console.error("Erro ao listar mídias:", erro);
        res.status(500).json({
            erro: "Falha ao listar mídias"
        });
    }
}

/**
 * Upload de mídia (foto ou vídeo)
 * POST /media/upload
 */
export async function uploadMidia(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                erro: "Nenhum arquivo foi enviado"
            });
        }

        const arquivo = req.file;

        // Determinar tipo de mídia
        const tiposMidia = {
            'image/jpeg': 'image',
            'image/png': 'image',
            'image/gif': 'image',
            'image/webp': 'image',
            'image/heic': 'image',
            'video/mp4': 'video',
            'video/quicktime': 'video'
        };

        const mediaType = tiposMidia[arquivo.mimetype];

        if (!mediaType) {
            fs.unlinkSync(arquivo.path); // Limpar arquivo inválido
            return res.status(400).json({
                erro: "Tipo de arquivo não suportado",
                tipos_aceitos: Object.keys(tiposMidia)
            });
        }

        // Criar registro no banco
        const novaMidia = {
            userId: req.user.id,
            storageKey: arquivo.filename,
            filename: arquivo.originalname,
            mediaType,
            fileSizeBytes: arquivo.size,
            mimeType: arquivo.mimetype,
            metadata: {
    uploadedFrom: (req.headers['user-agent'] || 'unknown').substring(0, 500)
},
            aiStatus: 'pending', // 'pending' | 'processing' | 'completed' | 'failed',
            aiProcessedAt: null
        };

        const resultado = await criarMidia(novaMidia);

        // Se for imagem, processar com IA (assíncrono)
        if (mediaType === 'image') {
            processarImagemComIA(resultado.insertedId, arquivo.path, req.user.id)
                .catch(erro => console.error("Erro ao processar IA:", erro));
        }

        res.status(201).json({
            mensagem: "Mídia enviada com sucesso",
            midia: {
                id: resultado.insertedId,
                filename: arquivo.originalname,
                tipo: mediaType,
                tamanho: arquivo.size
            }
        });

    } catch (erro) {
        console.error("Erro ao fazer upload:", erro);
        res.status(500).json({
            erro: "Falha no upload"
        });
    }
}

/**
 * Processar imagem com IA (tags)
 * Executado assincronamente após upload
 */
async function processarImagemComIA(mediaId, caminhoArquivo, userId) {
    try {
        const imageBuffer = fs.readFileSync(caminhoArquivo);
        const descricao = await gerarDescricaoComGemini(imageBuffer);

        // Extrair tags da descrição (simplificado)
        const tags = descricao
            .toLowerCase()
            .split(/[,.\s]+/)
            .filter(tag => tag.length > 3)
            .slice(0, 10); // Limitar a 10 tags

        await atualizarMidia(mediaId, userId, {
            'metadata.aiDescription': descricao,
            aiTags: tags
        });

        console.log(`✅ IA processada para mídia ${mediaId}`);
    } catch (erro) {
        console.error("Erro ao processar IA:", erro);
    }
}

/**
 * Buscar mídia específica
 * GET /media/:id
 */
export async function obterMidia(req, res) {
    try {
        const midia = await buscarMidiaPorId(req.params.id, req.user.id);

        if (!midia) {
            return res.status(404).json({
                erro: "Mídia não encontrada"
            });
        }

        res.status(200).json(midia);
    } catch (erro) {
        console.error("Erro ao buscar mídia:", erro);
        res.status(500).json({
            erro: "Falha ao buscar mídia"
        });
    }
}

/**
 * Deletar mídia
 * DELETE /media/:id
 */
export async function excluirMidia(req, res) {
    try {
        const midia = await buscarMidiaPorId(req.params.id, req.user.id);

        if (!midia) {
            return res.status(404).json({
                erro: "Mídia não encontrada"
            });
        }

        // Deletar arquivo físico
        const caminhoArquivo = path.join('uploads', midia.storageKey);
        if (fs.existsSync(caminhoArquivo)) {
            fs.unlinkSync(caminhoArquivo);
        }

        // Deletar do banco
        await deletarMidia(req.params.id, req.user.id);

        res.status(200).json({
            mensagem: "Mídia excluída com sucesso"
        });

    } catch (erro) {
        console.error("Erro ao excluir mídia:", erro);
        res.status(500).json({
            erro: "Falha ao excluir mídia"
        });
    }
}

/**
 * Buscar mídias (busca inteligente)
 * GET /media/search?q=praia,cachorro
 */
export async function buscarMidiasPorQuery(req, res) {
    try {
        const { q, pagina, limite } = req.query;

        if (!q) {
            return res.status(400).json({
                erro: "Parâmetro 'q' é obrigatório"
            });
        }

        const tags = q.split(',').map(tag => tag.trim());

        const resultado = await buscarMidiasPorTags(req.user.id, tags, {
            pagina: pagina ? parseInt(pagina) : 1,
            limite: limite ? parseInt(limite) : 50
        });

        res.status(200).json(resultado);

    } catch (erro) {
        console.error("Erro na busca:", erro);
        res.status(500).json({
            erro: "Falha na busca"
        });
    }
}