// src/routes/mediaRoutes.js
import express from "express";
import multer from "multer";
import {
    listarMidias,
    uploadMidia,
    obterMidia,
    excluirMidia,
    buscarMidias
} from "../controllers/mediaController.js";
import { verificarAutenticacao } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configuração Multer (melhorada)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const userId = req.user.id;
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop();
        cb(null, `${userId}_${timestamp}.${extension}`);
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
router.get("/search", buscarMidias);

// GET /media/:id - Obter mídia específica
router.get("/:id", obterMidia);

// POST /media/upload - Upload de mídia
router.post("/upload", upload.single("file"), uploadMidia);

// DELETE /media/:id - Excluir mídia
router.delete("/:id", excluirMidia);

export default router;