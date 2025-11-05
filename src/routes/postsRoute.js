import express from "express";
import multer from "multer";
import cors from "cors";
import {
    listarPosts,
    enviarPost,
    uploadImage,
    atualizarNovoPost
} from "../controllers/postsController.js";
import { verificarAutenticacao } from "../middleware/authMiddleware.js";

const corsOptions = {
    origin: "http://localhost:8000",
    optionsSuccessStatus: 200
};

// Configurar Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Adicionar user ID ao nome do arquivo para organização
        const userId = req.user.id;
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop();
        cb(null, `${userId}_${timestamp}.${extension}`);
    }
});

const upload = multer({
    dest: "./uploads",
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Aceitar apenas imagens e vídeos
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/heic',
            'video/mp4',
            'video/quicktime'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado'));
        }
    }
});

const route = (app) => {
    app.use(express.json());
    app.use(cors(corsOptions));

    // TODAS AS ROTAS AGORA REQUEREM AUTENTICAÇÃO

    // GET /posts - Listar posts do usuário logado
    app.get("/posts", verificarAutenticacao, listarPosts);

    // POST /posts - Criar novo post (do usuário logado)
    app.post("/posts", verificarAutenticacao, enviarPost);

    // POST /upload - Upload de imagem (do usuário logado)
    app.post("/upload", verificarAutenticacao, upload.single("image"), uploadImage);

    // PUT /upload/:id - Atualizar post (verificando propriedade)
    app.put("/upload/:id", verificarAutenticacao, atualizarNovoPost);
};

export default route;