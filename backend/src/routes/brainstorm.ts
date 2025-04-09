import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const SYSTEM_PROMPT = `You are an expert AI assistant helping users create compelling product advertisements.
Your task is to gather all necessary information to generate an ad.

IMPORTANT: You MUST structure ALL your responses as a valid JSON object with the following fields:
{
  "responseType": one of "text" or "requestImage",
  "content": your main response content as markdown,
  "requestImage": one of false, "product", or "inspiration",
  "imagePrompt": specific guidance for what image you need (only when requestImage is not false),
  "readyToGenerate": boolean indicating if the user is ready to generate (true or false)
}

Begin by introducing yourself and asking if the user has a product in mind they'd like to advertise. If they say yes or provide information about their product, promptly ask them to upload product images using the requestImage field set to "product".

After they upload images, analyze the first image in detail within your content field, describing:
- What you see in the image (product type, color, shape, features)
- The visual style and quality of the image
- The product's apparent strengths based on the visual

If the image quality is poor or doesn't showcase the product well, set requestImage to "product" and provide guidance in imagePrompt on how to take a better picture.

If you need inspiration images for design reference, set requestImage to "inspiration" and explain in imagePrompt what kind of inspiration images would be helpful.

Ask one question at a time in a conversational way, referring back to details you observed in the images.

When you have all the necessary information, set readyToGenerate to true and format the summary like this:

### Product Details
- **Name:** [product name]
- **Description:** [description]
- **Key Features:**
  - [feature 1]
  - [feature 2]
  - [feature 3]

### Visual Style
- **Style:** [style description, based on image analysis]
- **Colors:** [color preferences, referencing colors seen in the image]
- **Aspect Ratio:** [ratio]

### Text Content
- **Headline:** "[headline suggestion based on product image]"
- **Tagline:** "[tagline suggestion]"
- **Call to Action:** "[CTA]"
- **Text Positioning:** [position details]

### Additional Information
- **Target Audience:** [audience]
- **Brand Guidelines:** [guidelines]
- **Requirements:** [any special requirements]

> Would you like me to proceed with generating the ad based on this information?`;

router.post("/chat", async (req, res) => {
  try {
    const { messages, image, imageCount = 1 } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    console.log("[Chat] Processing messages:", messages.length);
    console.log("[Chat] Image provided:", !!image);
    console.log("[Chat] Number of images uploaded:", imageCount);

    // Prepare chat history
    const chatHistory = [
      { role: "user", parts: [{ text: "System: " + SYSTEM_PROMPT }] },
    ];

    // Process previous messages
    for (let i = 0; i < messages.length - 1; i++) {
      const m = messages[i];

      chatHistory.push({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      });
    }

    // Get the current message
    const currentMessage = messages[messages.length - 1];

    // Prepare parts array for sending to Gemini
    const messageParts = [];

    // If the message content references multiple images, update it
    let messageContent = currentMessage.content;
    if (imageCount > 1 && currentMessage.role === "user" && image) {
      // If the user has uploaded multiple images, note this in the message
      messageContent += ` [Note: The user has uploaded ${imageCount} product images. This is the first one. When generating the ad, consider all of these images.]`;
    }

    // Add the text content first
    messageParts.push({ text: messageContent });

    // Handle image if present
    if (image && currentMessage.role === "user") {
      try {
        console.log("[Chat] Processing image");

        // Extract the base64 data and MIME type
        const mimeType = image.split(";")[0].split(":")[1];
        const imageData = image.split(",")[1];

        // Add image as inline data
        messageParts.push({
          inlineData: {
            data: imageData,
            mimeType: mimeType,
          },
        });
      } catch (error) {
        console.error("[Chat] Error processing image:", error);
      }
    }

    // Start the chat with history
    const chat = model.startChat({
      history: chatHistory,
    });

    // Send the message with all parts
    const result = await chat.sendMessage(messageParts);
    const response = await result.response;
    const text = response.text();

    console.log("[Chat] Raw response first 200 chars:", text.substring(0, 200));

    // Try to parse the response as JSON, but handle plain text as a fallback
    let responseObject;
    try {
      responseObject = JSON.parse(text);

      // Ensure the response has the required fields
      if (!responseObject.responseType || !responseObject.content) {
        console.log(
          "[Chat] LLM response missing required fields, full response:",
          text.substring(0, 100) + "..." // Log first 100 chars to avoid huge logs
        );
        throw new Error("Invalid JSON structure: missing required fields");
      }

      // Validate responseType is one of the expected values
      if (
        responseObject.responseType !== "text" &&
        responseObject.responseType !== "requestImage"
      ) {
        console.log(
          `[Chat] Invalid responseType: ${responseObject.responseType}`
        );
        responseObject.responseType = "text"; // Default to text if invalid
      }

      // Ensure requestImage is consistent with responseType
      if (responseObject.responseType === "requestImage") {
        responseObject.requestImage = true;
      }

      // Sanitize requestImage field to ensure it's in the correct format
      if (typeof responseObject.requestImage === "string") {
        // If it's a string but not "product" or "inspiration", convert to boolean
        if (
          responseObject.requestImage !== "product" &&
          responseObject.requestImage !== "inspiration"
        ) {
          responseObject.requestImage = responseObject.requestImage === "true";
        }
      }

      // Make sure the content is not itself a JSON string (double escaping)
      if (
        typeof responseObject.content === "string" &&
        responseObject.content.trim().startsWith("{") &&
        responseObject.content.trim().endsWith("}")
      ) {
        try {
          console.log(
            "[Chat] Content appears to be JSON, attempting to extract nested content"
          );
          const nestedJson = JSON.parse(responseObject.content);
          if (nestedJson.content) {
            responseObject.content = nestedJson.content;

            // Use nested values if available
            if (nestedJson.responseType) {
              responseObject.responseType = nestedJson.responseType;
            }
            if (nestedJson.requestImage !== undefined) {
              responseObject.requestImage = nestedJson.requestImage;
            }
            if (nestedJson.imagePrompt) {
              responseObject.imagePrompt = nestedJson.imagePrompt;
            }
            if (nestedJson.readyToGenerate !== undefined) {
              responseObject.readyToGenerate = nestedJson.readyToGenerate;
            }
          }
        } catch (error) {
          console.log(
            "[Chat] Failed to parse nested JSON content, using as-is"
          );
        }
      }

      // Final cleanup of content field to ensure no JSON is sent to frontend
      if (typeof responseObject.content === "string") {
        // Check if it still looks like JSON
        if (
          responseObject.content.trim().startsWith("{") &&
          responseObject.content.trim().endsWith("}") &&
          (responseObject.content.includes('"content":') ||
            responseObject.content.includes('"responseType":'))
        ) {
          // Try to extract just the content with regex as a last resort
          const contentMatch = responseObject.content.match(
            /"content"\s*:\s*"([^"]*)"/
          );
          if (contentMatch && contentMatch[1]) {
            responseObject.content = contentMatch[1];
          } else {
            // If we can't extract with regex, return an error message instead of raw JSON
            responseObject.content =
              "I'm sorry, I couldn't generate a proper response. Please try again.";
          }
        }
      }

      console.log("[Chat] Successfully parsed LLM response as JSON");
    } catch (error) {
      console.log(
        "[Chat] Could not parse response as JSON, using plain text format. Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.log(
        "[Chat] First 100 characters of response:",
        text.substring(0, 100)
      );

      // If parsing fails, create a valid JSON response with the text
      responseObject = {
        responseType: "text",
        content: text,
        requestImage: false,
        imagePrompt: "",
        readyToGenerate: false,
      };
    }

    // Check if the content includes the readiness marker and set readyToGenerate
    const isComplete = responseObject.content.includes("[READY_TO_GENERATE]");
    responseObject.readyToGenerate = isComplete;

    // Clean up the content by removing the marker if present
    if (isComplete && typeof responseObject.content === "string") {
      responseObject.content = responseObject.content.replace(
        "[READY_TO_GENERATE]",
        ""
      );
    }

    // Return the JSON response
    res.status(200).json({
      ...responseObject,
      readyToGenerate: isComplete,
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
