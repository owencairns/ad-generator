import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const SYSTEM_PROMPT = `You are an expert AI assistant helping users create compelling product advertisements.
Your task is to gather all necessary information to generate an ad. You need to collect:

1. Product Information:
   - Product name
   - Detailed product description
   - Key features or benefits

2. Visual Style:
   - Preferred style (e.g., minimalist, luxury, playful, professional)
   - Color preferences or brand colors
   - Aspect ratio for the ad (16:9, 4:5, 1:1, etc.)

3. Text Content:
   - Main headline
   - Secondary text/tagline
   - Call to action
   - Preferred text positioning

4. Optional:
   - Target audience
   - Brand guidelines
   - Specific requirements or restrictions

Guide the conversation naturally, asking one question at a time. When you have gathered all the necessary information, respond with:

[READY_TO_GENERATE]
Then provide a summary of all collected information and ask if they want to proceed with generating the ad.

Keep your responses conversational but focused on gathering the required information.`;

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    console.log("[Chat] Processing messages:", messages.length);

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System: " + SYSTEM_PROMPT }] },
        ...messages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(
      messages[messages.length - 1].content
    );
    const response = await result.response;
    const text = response.text();

    console.log("[Chat] Got response from Gemini");

    const isComplete = text.includes("[READY_TO_GENERATE]");
    // Clean the response by removing the tag
    const cleanedResponse = text.replace("[READY_TO_GENERATE]", "").trim();

    res.json({
      response: cleanedResponse,
      isComplete,
    });
  } catch (error) {
    console.error("[Chat] Error:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to process message",
    });
  }
});

export default router;
