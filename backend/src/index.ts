import express from "express";
import cors from "cors";
import { router as generateRouter } from "./routes/generate";

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

// Parse JSON bodies
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/generate", generateRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
