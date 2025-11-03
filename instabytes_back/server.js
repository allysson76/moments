import express from "express";
import route from "./src/route/postsRoutes.js";

const app = express();
app.use(express.static("uploads"))

route(app);

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor escutando...");
});

