import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as generateRouter } from "./routes/generate";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Add body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === "POST") {
    console.log("Request body:", {
      keys: Object.keys(req.body),
      userId: req.body.userId,
      generationId: req.body.generationId,
      hasDescription: !!req.body.description,
      productImagesCount: req.body.productImages?.length,
      inspirationImagesCount: req.body.inspirationImages?.length,
    });
  }
  next();
});

// Routes
app.use("/api/generate", generateRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
