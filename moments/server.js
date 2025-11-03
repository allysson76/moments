import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoute.js";
import postsRoutes from "./src/routes/postsRoute.js";

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.static("uploads"));

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:8000",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rotas
app.use("/auth", authRoutes);  // Rotas de autenticação
postsRoutes(app);               // Rotas de posts (migrar depois)

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    mensagem: "API Moments rodando",
    versao: "1.0.0"
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