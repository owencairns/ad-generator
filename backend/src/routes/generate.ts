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
  console.log("[Generate] Processing image for Gemini input");
  try {
    // Extract the mime type and base64 data from the data URL
    const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);

    if (!matches) {
      console.error("[Generate] Invalid data URL format");
      throw new Error("Invalid data URL format");
    }

    const [, mimeType, base64Data] = matches;
    console.log(`[Generate] Image mime type: ${mimeType}`);

    // Verify we have a valid image mime type
    if (!mimeType.startsWith("image/")) {
      console.error(`[Generate] Invalid mime type: ${mimeType}`);
      throw new Error(`Invalid mime type: ${mimeType}`);
    }

    return {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };
  } catch (error) {
    console.error("[Generate] Error processing image:", error);
    throw error;
  }
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
    const systemMessage = `You are an AI specialized in generating creative and effective product advertisements. Your goal is to create visually appealing advertisements that showcase products clearly while maintaining engaging and professional design standards.`;

    const productImagesPrompt = `This is what the product looks like - make sure to maintain a clear and prominent view of the product in the generated advertisement. The product should be the focal point while incorporating it into an attractive advertisement design. NEVER CHANGE WHAT THE PRODUCT LOOKS LIKE UNLESS SPECIFIED.`;

    const inspirationPrompt =
      inspirationImages.length > 0
        ? `These additional images are for inspiration. Draw inspiration from their design style, composition, and aesthetic while creating the advertisement for our product. NEVER INCLUDE ANY TEXT FROM THESE IMAGES. GET RID OF WATERMARKS.`
        : "";

    const prompt = `${systemMessage}

${productImagesPrompt}

${inspirationPrompt}

Advertisement Requirements:
${description}

Important Guidelines:
- Ensure the product is clearly visible and recognizable
- Create a professional and polished advertisement
- Maintain high visual quality and appeal
- The generated image should be a complete advertisement`;

    // Process product images and inspiration images separately
    console.log(
      `[Generate] Processing ${productImages.length} product images and ${inspirationImages.length} inspiration images`
    );

    const contents = [];

    // Add the initial prompt
    contents.push({ text: prompt });

    // Add product images with clear labeling
    try {
      for (let i = 0; i < productImages.length; i++) {
        // Add the label first
        contents.push({
          text: `[Product Image ${
            i + 1
          }] This is the product to advertise. Maintain its exact appearance.`,
        });
        // Then add the image
        contents.push(base64ToGenerativePart(productImages[i]));
      }
      console.log("[Generate] Successfully processed product images");
    } catch (error) {
      console.error("[Generate] Failed to process product images:", error);
      res.status(400).json({
        message: "Failed to process product images",
        data: {
          error:
            error instanceof Error
              ? error.message
              : "Unknown error processing product images",
        },
      } as GenerateResponseData);
      return;
    }

    // Add inspiration images with clear labeling
    if (inspirationImages.length > 0) {
      try {
        for (let i = 0; i < inspirationImages.length; i++) {
          // Add the label first
          contents.push({
            text: `[Inspiration Image ${
              i + 1
            }] Use this image for style and composition inspiration only.`,
          });
          // Then add the image
          contents.push(base64ToGenerativePart(inspirationImages[i]));
        }
        console.log("[Generate] Successfully processed inspiration images");
      } catch (error) {
        console.error(
          "[Generate] Failed to process inspiration images:",
          error
        );
        res.status(400).json({
          message: "Failed to process inspiration images",
          data: {
            error:
              error instanceof Error
                ? error.message
                : "Unknown error processing inspiration images",
          },
        } as GenerateResponseData);
        return;
      }
    }

    console.log(
      "[Generate] Sending request to Gemini API with",
      contents.length,
      "content parts"
    );

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
