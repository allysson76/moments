// server.js
import express from "express";
import rateLimit from 'express-rate-limit';
import cors from "cors";
import authRoutes from "./src/routes/authRoute.js";
import mediaRoutes from "./src/routes/mediaRoute.js";
import postsRoutes from "./src/routes/postsRoute.js"; 

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.static("uploads"));

// Rate limiter para autenticação
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: {
        erro: "Muitas tentativas de login. Tente novamente em 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Aplicar em rotas sensíveis
app.use("/auth/login", authLimiter);
app.use("/auth/cadastrar", authLimiter);
app.use("/auth/recuperar-senha", authLimiter);

// Rate limiter geral
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 requisições
});

app.use(generalLimiter);

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:8000",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rotas
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes); // NOVA ROTA
postsRoutes(app);                // Posts antigos (deprecar depois)

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    mensagem: "API Moments rodando",
    versao: "2.0.0",
    rotas: {
      autenticacao: "/auth",
      midias: "/media",
      posts: "/posts (deprecated)"
    }
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({
    erro: "Erro interno do servidor",
    mensagem: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    caminho: req.path
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Moments rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});