import express from "express";
import multer from "multer";
import cors from "cors";
import { listarPosts, enviarPost, uploadImage, atualizarNovoPost } from "../controller/postsController.js";

const corsOptions = {
  origin: "http://localhost:8000",
  optionsSuccessStatus: 200
}

// Configure Multer storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination directory for uploaded files (./uploads in this case)
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Keep the original filename for uploaded files
    cb(null, file.originalname);
  }
});

// Create a Multer instance with the configured storage
const upload = multer({
  dest: "./uploads", // Alternative destination (commented out)
  storage
});

// Function to define routes for the app
const route = (app) => {
  // Enable parsing of JSON data in request body
  app.use(express.json());

  app.use(cors(corsOptions));

  // GET route to list all posts
  app.get("/posts", listarPosts);

  // POST route to create a new post (without image upload)
  app.post("/posts", enviarPost);

  // POST route to upload an image and create a new post
  app.post("/upload", upload.single("image"), uploadImage);

  app.put("/upload/:id", atualizarNovoPost);
};

export default route;