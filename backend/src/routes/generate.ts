import { Router, RequestHandler } from "express";
import { GoogleGenAI } from "@google/genai";
import { storage, db } from "../config/firebase";
import sharp from "sharp";
import {
  GenerateRequestBody,
  GenerateResponseData,
  FirestoreGenerationDocument,
  ProcessedImage,
  GeminiContent,
  GenerationStatus,
} from "../types";
import { Timestamp } from "firebase-admin/firestore";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });
const router = Router();

const compressAndUploadImage = async (
  base64Image: string,
  userId: string,
  generationId: string,
  type: ProcessedImage["type"],
  index: number
): Promise<string> => {
  console.log(
    `[Storage] Processing ${type} image ${index + 1} for user ${userId}`
  );
  try {
    // Extract base64 data
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid image format");
    const base64Data = matches[2];

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Compress image
    const compressedBuffer = await sharp(imageBuffer)
      .resize(1024, 1024, { fit: "inside" })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload to Firebase Storage
    const fileName = `generatedImages/${userId}/${generationId}/${type}-${
      index + 1
    }.jpg`;
    const bucket = storage.bucket();
    const file = bucket.file(fileName);

    await file.save(compressedBuffer, {
      metadata: {
        contentType: "image/jpeg",
      },
    });

    await file.makePublic();
    return file.publicUrl();
  } catch (error) {
    console.error(`[Storage] Error processing ${type} image:`, error);
    throw error;
  }
};

const uploadToStorage = async (
  imageBuffer: Buffer,
  userId: string,
  generationId: string
): Promise<string> => {
  console.log(
    `[Storage] Starting upload for generated image for user ${userId}`
  );
  try {
    const fileName = `generatedImages/${userId}/${generationId}/final-1.png`;
    console.log(`[Storage] Uploading to path: ${fileName}`);
    const bucket = storage.bucket();
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    await file.makePublic();
    return file.publicUrl();
  } catch (error) {
    console.error("[Storage] Error uploading to storage:", error);
    throw error;
  }
};

const createFirestoreDocument = async (
  userId: string,
  generationId: string,
  data: Omit<FirestoreGenerationDocument, "status" | "createdAt" | "updatedAt">
) => {
  const docRef = db
    .collection("generations")
    .doc(userId)
    .collection("items")
    .doc(generationId);

  const now = Timestamp.now();
  const docData: FirestoreGenerationDocument = {
    ...data,
    status: "processing",
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(docData);
  return docRef;
};

const base64ToGenerativePart = (base64String: string): GeminiContent => {
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

const handleGenerateRequest: RequestHandler = async (req, res) => {
  console.log("[Generate] Received new generation request");
  try {
    const {
      description,
      productDescription,
      inspirationImages = [],
      productImages,
      userId,
      generationId,
      style,
      aspectRatio,
      textInfo,
    } = req.body as GenerateRequestBody;

    // Validate request
    if (!userId || !generationId) {
      console.warn("[Generate] Missing user ID or generation ID in request");
      res.status(400).json({
        message: "User ID and Generation ID are required",
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

    if (!description || !productDescription) {
      console.warn(
        "[Generate] Missing description or product description in request"
      );
      res.status(400).json({
        message: "Both ad description and product description are required",
      } as GenerateResponseData);
      return;
    }

    // Process and upload images concurrently
    console.log("[Generate] Starting image processing and upload");
    const [productImageUrls, inspirationImageUrls] = await Promise.all([
      Promise.all(
        productImages.map((img, idx) =>
          compressAndUploadImage(img, userId, generationId, "product", idx)
        )
      ),
      Promise.all(
        inspirationImages.map((img, idx) =>
          compressAndUploadImage(img, userId, generationId, "inspiration", idx)
        )
      ),
    ]);

    // Create Firestore document
    const docRef = await createFirestoreDocument(userId, generationId, {
      description,
      productDescription,
      productName: req.body.productName,
      productImageUrls,
      // Only include inspirationImageUrls if there are actually images
      ...(inspirationImageUrls.length > 0 ? { inspirationImageUrls } : {}),
      style,
      aspectRatio,
      textInfo: textInfo
        ? {
            mainText: textInfo.mainText,
            secondaryText: textInfo.secondaryText,
            position: textInfo.position,
            styleNotes: textInfo.styleNotes,
          }
        : undefined,
    });

    // Prepare Gemini prompt and generate image
    const systemMessage = `You are an AI specialized in generating creative and effective product advertisements. Your goal is to create visually appealing advertisements that showcase products clearly while maintaining engaging and professional design standards.`;

    const productImagesPrompt = `This is what the product looks like - make sure to maintain a clear and prominent view of the product in the generated advertisement. The product should be the focal point while incorporating it into an attractive advertisement design. NEVER CHANGE WHAT THE PRODUCT LOOKS LIKE UNLESS SPECIFIED.

Product Description:
${productDescription}`;

    const inspirationPrompt =
      inspirationImages.length > 0
        ? `These additional images are for inspiration. Draw inspiration from their design style, composition, and aesthetic while creating the advertisement for our product. NEVER INCLUDE ANY TEXT FROM THESE IMAGES. GET RID OF WATERMARKS.`
        : "";

    const prompt = `${systemMessage}

${productImagesPrompt}

${inspirationPrompt}

Advertisement Requirements:
${description}

Style Requirements:
${style}

Aspect Ratio:
${aspectRatio}
${
  textInfo
    ? `
Text Requirements:
${
  textInfo.mainText
    ? `- Heading: "${textInfo.mainText}"`
    : "- No heading specified"
}
${
  textInfo.secondaryText
    ? `- Subheading: "${textInfo.secondaryText}"`
    : "- No subheading specified"
}
${
  textInfo.position === "auto"
    ? "- Text Placement: Choose the best placement for the text"
    : textInfo.styleNotes
    ? `- Text Placement: ${textInfo.styleNotes}`
    : "- Text Placement: Choose the best placement for the text"
}
`
    : ""
}

Important Guidelines:
- Ensure the product is clearly visible and recognizable
- Create a professional and polished advertisement
- Maintain high visual quality and appeal
- Follow the specified style requirements exactly
${
  textInfo && (textInfo.mainText || textInfo.secondaryText)
    ? "- Include the specified text exactly as provided"
    : ""
}
- The generated image should be a complete advertisement`;

    const contents: GeminiContent[] = [{ text: prompt }];

    // Add product images with clear labeling
    try {
      for (let i = 0; i < productImages.length; i++) {
        contents.push({
          text: `[Product Image ${
            i + 1
          }] This is the product to advertise. Maintain its exact appearance.`,
        });
        contents.push(base64ToGenerativePart(productImages[i]));
      }
    } catch (error) {
      console.error("[Generate] Failed to process product images:", error);
      await docRef.update({
        status: "error" as GenerationStatus,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process product images",
        updatedAt: Timestamp.now(),
      });
      throw error;
    }

    // Add inspiration images with clear labeling
    if (inspirationImages.length > 0) {
      try {
        for (let i = 0; i < inspirationImages.length; i++) {
          contents.push({
            text: `[Inspiration Image ${
              i + 1
            }] Use this image for style and composition inspiration only.`,
          });
          contents.push(base64ToGenerativePart(inspirationImages[i]));
        }
      } catch (error) {
        console.error(
          "[Generate] Failed to process inspiration images:",
          error
        );
        await docRef.update({
          status: "error" as GenerationStatus,
          error:
            error instanceof Error
              ? error.message
              : "Failed to process inspiration images",
          updatedAt: Timestamp.now(),
        });
        throw error;
      }
    }

    // Generate content with Gemini
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    // Process Gemini response
    let imageBuffer: Buffer | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (
          part.inlineData?.mimeType?.startsWith("image/") &&
          part.inlineData.data
        ) {
          imageBuffer = Buffer.from(part.inlineData.data, "base64");
          break;
        }
      }
    }

    if (!imageBuffer) {
      const error = new Error("No image generated in the response");
      await docRef.update({
        status: "error" as GenerationStatus,
        error: error.message,
        updatedAt: Timestamp.now(),
      });
      throw error;
    }

    // Upload generated image
    const generatedImageUrl = await uploadToStorage(
      imageBuffer,
      userId,
      generationId
    );

    // Update Firestore document
    await docRef.update({
      status: "completed" as GenerationStatus,
      generatedImageUrl,
      updatedAt: Timestamp.now(),
    });

    // Send response
    res.status(200).json({
      message: "Ad generated successfully",
      data: {
        imageUrl: generatedImageUrl,
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
