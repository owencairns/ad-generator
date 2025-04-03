import { Router, RequestHandler } from "express";
import { GoogleGenAI } from "@google/genai";
import { storage } from "../config/firebase";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

interface GenerateRequestBody {
  description: string;
  inspirationImages?: string[];
  productImages: string[];
  userId: string;
}

interface GenerateResponseData {
  message: string;
  data?: {
    imageUrl?: string;
    error?: string;
  };
}

const router = Router();

const uploadToStorage = async (
  imageBuffer: Buffer,
  userId: string
): Promise<string> => {
  console.log(`[Storage] Starting upload for user ${userId}`);
  try {
    const fileName = `generatedImages/${userId}/${Date.now()}.png`;
    console.log(`[Storage] Uploading to path: ${fileName}`);
    const bucket = storage.bucket();
    const file = bucket.file(fileName);

    // Upload the image
    await file.save(imageBuffer, {
      metadata: {
        contentType: "image/png",
      },
    });
    console.log(`[Storage] File uploaded successfully`);

    // Make the file publicly accessible
    await file.makePublic();
    console.log(`[Storage] File made public`);

    // Get the public URL
    const publicUrl = file.publicUrl();
    console.log(`[Storage] Generated public URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("[Storage] Error uploading to storage:", error);
    throw error;
  }
};

const base64ToGenerativePart = (base64String: string) => {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(
    /^data:image\/(png|jpeg|jpg);base64,/,
    ""
  );

  return {
    inlineData: {
      data: base64Data,
      mimeType: "image/jpeg",
    },
  };
};

// POST /api/generate - Generate new ad images
const handleGenerateRequest: RequestHandler = async (req, res) => {
  console.log("[Generate] Received new generation request");
  try {
    const {
      description,
      inspirationImages = [],
      productImages,
      userId,
    } = req.body as GenerateRequestBody;

    console.log(`[Generate] Request details:
      - User ID: ${userId}
      - Product Images Count: ${productImages?.length}
      - Inspiration Images Count: ${inspirationImages?.length}
      - Description Length: ${description?.length} characters`);

    // Validate request
    if (!userId) {
      console.warn("[Generate] Missing user ID in request");
      res.status(400).json({
        message: "User ID is required",
      } as GenerateResponseData);
      return;
    }

    if (
      !productImages ||
      productImages.length === 0 ||
      productImages.length > 2
    ) {
      console.warn(
        `[Generate] Invalid product images count: ${productImages?.length}`
      );
      res.status(400).json({
        message: "Between 1 and 2 product images are required",
      } as GenerateResponseData);
      return;
    }

    if (inspirationImages && inspirationImages.length > 2) {
      console.warn(
        `[Generate] Too many inspiration images: ${inspirationImages.length}`
      );
      res.status(400).json({
        message: "Maximum of 2 inspiration images allowed",
      } as GenerateResponseData);
      return;
    }

    if (!description) {
      console.warn("[Generate] Missing description in request");
      res.status(400).json({
        message: "Description is required",
      } as GenerateResponseData);
      return;
    }

    console.log(
      "[Generate] Request validation passed, preparing Gemini prompt"
    );

    // Initialize Gemini model and prepare content
    const prompt = `Generate a creative advertisement image based on these reference images. Here's what I want:

${description}

Please make sure to generate an image for the advertisement.`;

    // Convert all images to Generative Parts
    const allImages = [...productImages, ...inspirationImages];
    console.log(
      `[Generate] Processing ${allImages.length} total images for Gemini API`
    );
    const imageParts = allImages.map(base64ToGenerativePart);

    // Prepare content parts
    const contents = [{ text: prompt }, ...imageParts];
    console.log("[Generate] Sending request to Gemini API");

    // Generate content with image
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });
    console.log("[Generate] Received response from Gemini API");

    // Find the generated image in the response
    let imageBuffer: Buffer | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      console.log("[Generate] Processing Gemini response parts");
      for (const part of response.candidates[0].content.parts) {
        if (
          part.inlineData?.mimeType?.startsWith("image/") &&
          part.inlineData.data
        ) {
          imageBuffer = Buffer.from(part.inlineData.data, "base64");
          console.log("[Generate] Successfully extracted image from response");
          break;
        }
      }
    }

    if (!imageBuffer) {
      console.error("[Generate] No image found in Gemini response");
      throw new Error("No image generated in the response");
    }

    console.log("[Generate] Uploading generated image to Firebase Storage");
    // Upload to Firebase Storage
    const imageUrl = await uploadToStorage(imageBuffer, userId);

    console.log("[Generate] Generation process completed successfully");
    // Send response with the image URL
    res.status(200).json({
      message: "Ad generated successfully",
      data: {
        imageUrl,
      },
    } as GenerateResponseData);
  } catch (error) {
    console.error("[Generate] Error in generate route:", error);
    res.status(500).json({
      message: "Error processing generation request",
      data: {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    } as GenerateResponseData);
  }
};

router.post("/", handleGenerateRequest);

export { router };
