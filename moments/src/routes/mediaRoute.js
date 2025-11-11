// src/routes/mediaRoutes.js
import path from 'path';
import fs from 'fs';
import express from "express";
import multer from "multer";
import {
    listarMidias,
    uploadMidia,
    obterMidia,
    excluirMidia,
    buscarMidiasPorQuery
} from "../controllers/mediaController.js";
import rateLimit from 'express-rate-limit';
import { verificarAutenticacao } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configuração Multer
// Criar pasta se não existir
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 uploads por 15 minutos
    message: { erro: "Limite de uploads excedido" }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const userId = req.user.id;
        const timestamp = Date.now();
        
        // ✅ Whitelist de extensões seguras
        const extensoesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'mp4', 'mov'];
        const extensaoOriginal = path.extname(file.originalname).toLowerCase().slice(1);
        
        // Validar extensão
        if (!extensoesPermitidas.includes(extensaoOriginal)) {
            return cb(new Error('Extensão de arquivo não permitida'));
        }
        
        // ✅ Sanitizar: apenas alfanumérico + underscore
        const extensaoSegura = extensaoOriginal.replace(/[^a-z0-9]/g, '');
        const nomeSeguro = `${userId}_${timestamp}.${extensaoSegura}`;
        
        cb(null, nomeSeguro);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/heic',
            'video/mp4',
            'video/quicktime'
        ];

        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado'));
        }
    }
});

// Todas as rotas requerem autenticação
router.use(verificarAutenticacao);

// GET /media - Listar biblioteca
router.get("/", listarMidias);

// GET /media/search - Busca inteligente
router.get("/search", buscarMidiasPorQuery);

// GET /media/:id - Obter mídia específica
router.get("/:id", obterMidia);

// POST /media/upload - Upload de mídia
router.post("/upload", upload.single("file"), uploadMidia);

// DELETE /media/:id - Excluir mídia
router.delete("/:id", excluirMidia);

router.post("/upload", uploadLimiter, upload.single("file"), uploadMidia);

export default router;