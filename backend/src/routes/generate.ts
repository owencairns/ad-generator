import { Router, RequestHandler } from "express";
import { storage, db } from "../config/firebase";
import {
  GenerateRequestBody,
  FirestoreGenerationDocument,
  GenerationVersion,
} from "../types/generationTypes";
import { Timestamp } from "firebase-admin/firestore";
import OpenAI from "openai";
import { File } from "node:buffer";
import axios from "axios";

// Instantiate OpenAI client correctly
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const router = Router();

// Keep uploadToStorage for the FINAL generated image
const uploadToStorage = async (
  imageBuffer: Buffer,
  userId: string,
  generationId: string
): Promise<string> => {
  console.log(
    `[Storage] Starting upload for generated image for user ${userId}, genId ${generationId}`
  );
  try {
    const fileName = `generatedImages/${userId}/${generationId}/final-1.png`;
    const bucket = storage.bucket();
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: { contentType: "image/png" },
    });
    await file.makePublic();
    const publicUrl = file.publicUrl();
    console.log(`[Storage] Upload complete: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("[Storage] Error uploading to storage:", error);
    throw error;
  }
};

// Helper to fetch an image URL and return a Buffer
async function fetchImageAsBuffer(imageUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    if (!Buffer.isBuffer(response.data)) {
      throw new Error(`Invalid response data type for ${imageUrl}`);
    }
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch image ${imageUrl}:`, error);
    throw new Error(`Failed to fetch image: ${imageUrl}`);
  }
}
// Integrated Enhance Prompt Logic (from newGenerate.ts)
const enhancePromptWithGPT = async (prompt: string): Promise<string | null> => {
  try {
    console.log("[Enhance] Enhancing prompt with gpt-4o-mini...");
    const result = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that enhances prompts for image generation.
          Give the following prompt for generating an image for a product, turn the prompt into a complex and detailed json object which expertly explains the image that the user is trying to generate.
          You can create any number of keys and values you want in the json object. Make it as detailed as possible.

          Values can be sub-objects to categorize the image generation details. Make sure to include all of the details given and others that you may think are helpful.
          
          Return the json object as a string in the following format:
          {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3",
          }`,
        },
        { role: "user", content: prompt },
      ],
    });
    const enhancedContent = result.choices[0]?.message?.content;
    if (!enhancedContent) {
      console.warn("[Enhance] GPT returned no content for prompt enhancement.");
      return prompt; // Return original prompt if enhancement fails
    }
    console.log("[Enhance] Prompt enhancement successful.");
    return enhancedContent;
  } catch (error) {
    console.error("[Enhance] Error enhancing prompt:", error);
    return prompt; // Fallback to original prompt on error
  }
};

const handleGenerateRequest: RequestHandler = async (req, res) => {
  console.log("[Generate] Received trigger for generation process");
  const { userId, generationId } = req.body as GenerateRequestBody;

  // --- 1. Validation ---
  if (!userId || !generationId) {
    console.warn("[Generate] Missing user ID or generation ID");
    return res
      .status(400)
      .json({ message: "User ID and Generation ID are required" });
  }
  console.log(`[Generate] User: ${userId}, Generation: ${generationId}`);

  const docRef = db
    .collection("generations")
    .doc(userId)
    .collection("items")
    .doc(generationId);

  try {
    // --- 2. Fetch Firestore Document ---
    console.log(`[Generate] Fetching Firestore document: ${docRef.path}`);
    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      console.error(`[Generate] Firestore document not found: ${docRef.path}`);
      return res.status(404).json({ message: "Generation record not found" });
    }
    const generationData = docSnapshot.data() as FirestoreGenerationDocument;
    console.log("[Generate] Fetched Firestore document.");

    // --- 3. Extract Essential Data ---
    const {
      prompt, // This prompt now contains all details
      productImageUrls,
      inspirationImageUrls = [],
      size = "1024x1024", // Keep size if needed for API
      // REMOVED: template, style, productDescription, textElements etc. - assumed in prompt
    } = generationData;

    // --- 4. Validate Essential Fetched Data ---
    if (!prompt) throw new Error("Missing 'prompt' in Firestore document");
    if (!productImageUrls || productImageUrls.length === 0) {
      throw new Error("Missing 'productImageUrls' in Firestore document");
    }

    // --- 5. Fetch Image Buffers ---
    console.log("[Generate] Fetching image buffers from URLs...");
    let productImageBuffers: Buffer[];
    let inspirationImageBuffers: Buffer[];
    try {
      productImageBuffers = await Promise.all(
        productImageUrls.map((url) => fetchImageAsBuffer(url))
      );
      inspirationImageBuffers = await Promise.all(
        inspirationImageUrls.map((url) => fetchImageAsBuffer(url))
      );
      console.log(
        `[Generate] Fetched ${productImageBuffers.length} product image(s) and ${inspirationImageBuffers.length} inspiration image(s).`
      );
    } catch (fetchError) {
      console.error("[Generate] Failed to fetch image buffers:", fetchError);
      await docRef.update({
        status: "error",
        error: `Failed to fetch image buffers: ${
          (fetchError as Error).message
        }`,
        updatedAt: Timestamp.now(),
      });
      return res.status(500).json({
        message: "Failed to fetch necessary image resources.",
        data: { error: (fetchError as Error).message },
      });
    }

    // --- 6. Enhance Prompt ---
    const initialPrompt = prompt; // Keep original for potential saving
    const enhancedPromptResult = await enhancePromptWithGPT(initialPrompt);
    // Use enhanced prompt, or fallback to original if enhancement failed
    const finalPromptForOpenAI = enhancedPromptResult || initialPrompt;

    // --- 7. Prepare Images for OpenAI ---
    console.log("[Generate] Preparing image Files for OpenAI...");
    const allImageFiles: File[] = [];
    productImageBuffers.forEach((buffer, index) => {
      allImageFiles.push(
        new File([buffer], `product_image_${index}.png`, { type: "image/png" })
      );
    });
    inspirationImageBuffers.forEach((buffer, index) => {
      allImageFiles.push(
        new File([buffer], `inspiration_image_${index}.png`, {
          type: "image/png",
        })
      );
    });
    console.log(
      `[Generate] Prepared ${allImageFiles.length} total image File(s).`
    );

    // Add note about extra images to prompt if applicable (as in newGenerate.ts)
    let finalPromptWithImageNotes = finalPromptForOpenAI;
    if (productImageBuffers.length > 1) {
      finalPromptWithImageNotes += ` (Note: ${
        productImageBuffers.length - 1
      } additional product images provided)`;
    }
    if (inspirationImageBuffers.length > 0) {
      finalPromptWithImageNotes += ` (Note: ${inspirationImageBuffers.length} inspiration images provided)`;
    }

    // --- 8. Call OpenAI API (using images.edit logic) ---
    console.log("[Generate] Calling OpenAI images.edit API...");
    let generatedImageBuffer: Buffer | null = null;
    const revisedPromptFromOpenAI: string | undefined = undefined;

    try {
      const apiParams: OpenAI.Images.ImageEditParams = {
        model: "gpt-image-1",
        image: allImageFiles,
        prompt: finalPromptWithImageNotes,
      };

      // THIS CAN BE UPDATED LATER TO BE DYNAMIC. For testing use MEDIUM, production use HIGH.
      const quality = "medium";

      if (size) apiParams.size = size as OpenAI.Images.ImageEditParams["size"];
      if (quality) apiParams.quality = quality;

      console.info("[Generate] Calling OpenAI images.edit with params:", {
        model: apiParams.model,
        prompt: apiParams.prompt,
        size: size,
        quality: apiParams.quality,
        image_count: allImageFiles.length,
      });

      const result = await openaiClient.images.edit(apiParams);
      console.log("[Generate] OpenAI generation successful.");

      const imageBase64 = result.data?.[0]?.b64_json;
      if (!imageBase64)
        throw new Error(
          "No b64_json image data returned from OpenAI images.edit"
        );
      generatedImageBuffer = Buffer.from(imageBase64, "base64");
    } catch (openaiError) {
      console.error("[Generate] OpenAI API call failed:", openaiError);
      const errorMessage =
        openaiError instanceof Error ? openaiError.message : "OpenAI API error";
      await docRef.update({
        status: "error",
        error: `OpenAI Error: ${errorMessage}`,
        updatedAt: Timestamp.now(),
      });
      return res.status(500).json({
        message: "Image generation failed during OpenAI processing.",
        data: { error: errorMessage },
      });
    }

    // --- 9. Upload Generated Image ---
    console.log("[Generate] Uploading generated image...");
    if (!generatedImageBuffer) {
      console.error(
        "[Generate] Generated image buffer is null after API call."
      );
      await docRef.update({
        status: "error",
        error: "No image buffer received after OpenAI call",
        updatedAt: Timestamp.now(),
      });
      return res
        .status(500)
        .json({ message: "Image generation failed: No image data received." });
    }
    let generatedImageUrl: string;
    try {
      generatedImageUrl = await uploadToStorage(
        generatedImageBuffer,
        userId,
        generationId
      );
    } catch (uploadError) {
      console.error(
        "[Generate] Failed to upload generated image:",
        uploadError
      );
      const errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload result";
      await docRef.update({
        status: "error",
        error: `Upload Error: ${errorMessage}`,
        updatedAt: Timestamp.now(),
      });
      return res.status(500).json({
        message: "Image generation succeeded but upload failed.",
        data: { error: errorMessage },
      });
    }

    // --- 10. Create Initial Version Entry ---
    const now = Timestamp.now();
    const initialVersion: GenerationVersion = {
      versionId: "original",
      imageUrl: generatedImageUrl,
      createdAt: now,
      status: "completed",
      promptUsed: finalPromptForOpenAI, // Record the potentially enhanced prompt
      revisedPrompt: revisedPromptFromOpenAI, // Will likely be undefined for images.edit
    };

    // --- 11. Update Firestore Document (Final) ---
    console.log("[Generate] Updating Firestore with final status and URL...");
    await docRef.update({
      status: "completed",
      generatedImageUrl: generatedImageUrl,
      versions: [initialVersion],
      updatedAt: now,
      error: null, // Clear any previous error
      revisedPrompt: revisedPromptFromOpenAI || null, // Store revised prompt if available
    });

    console.log(
      `[Generate] Process completed successfully for ${generationId}.`
    );
    // --- 12. Send Response ---
    res.status(200).json({
      message: "Image generation process initiated successfully.",
    });
  } catch (error) {
    console.error("[Generate] Unhandled error in generation process:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error in generation process";
    try {
      await docRef.update({
        status: "error",
        error: errorMessage,
        updatedAt: Timestamp.now(),
      });
    } catch (updateError) {
      console.error(
        "[Generate] Failed to update Firestore with final error status:",
        updateError
      );
    }
    res.status(500).json({
      message: "Error processing generation request",
      data: { error: errorMessage },
    });
  }
};

router.post("/generate-image", handleGenerateRequest); // Ensure route matches frontend call

export { router };
