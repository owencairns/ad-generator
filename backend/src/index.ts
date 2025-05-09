import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as generateRouter } from "./routes/generate";
import { router as editRouter } from "./routes/edit";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());

// Add body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === "POST") {
    console.log("Request body:", {
      path: req.path,
      keys: Object.keys(req.body),
      messageLength: req.body.message?.length,
      stateKeys: req.body.state ? Object.keys(req.body.state) : undefined,
      userId: req.body.userId,
      generationId: req.body.generationId,
    });
  }
  next();
});

// Routes
app.use("/api/generate", generateRouter);
app.use("/api/edit", editRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error("Error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Available routes:`);
  console.log(` - POST /api/generate`);
  console.log(` - POST /api/edit`);
  console.log(` - GET /health`);
});
