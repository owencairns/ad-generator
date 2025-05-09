import { Router, RequestHandler } from "express";
import { storage, db } from "../config/firebase";
import {
  GenerateResponseData,
  FirestoreGenerationDocument,
  GenerationStatus,
} from "../types";
import { Timestamp } from "firebase-admin/firestore";
import { OpenAI } from "openai";
import { File } from "node:buffer";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const router = Router();

/**
 * Request body for edit endpoint
 */
interface EditRequestBody {
  sourceImageUrl: string;
  editDescription: string;
  generationId: string;
  userId: string;
  versionId: string;
  description?: string;
  productDescription?: string;
  style?: string;
  aspectRatio?: string;
  textInfo?: {
    mainText: string;
    secondaryText: string;
    position: string;
    styleNotes: string;
  };
  template?: string;
}

/**
 * Handler for editing an existing generated image
 */
const handleEditRequest: RequestHandler = async (req, res) => {
  console.log("[Edit] Received new edit request");
  try {
    const {
      sourceImageUrl,
      editDescription,
      description,
      productDescription,
      userId,
      generationId,
      versionId,
      style,
      aspectRatio,
      textInfo,
    } = req.body as EditRequestBody;

    // Validate request
    if (!userId || !generationId || !sourceImageUrl || !versionId) {
      console.warn("[Edit] Missing required fields in request");
      res.status(400).json({
        message:
          "User ID, Generation ID, Version ID, and Source Image URL are required",
      } as GenerateResponseData);
      return;
    }

    if (!editDescription) {
      console.warn("[Edit] Missing edit description in request");
      res.status(400).json({
        message: "Edit description is required",
      } as GenerateResponseData);
      return;
    }

    // Get the generation document to access required data
    const generationRef = db
      .collection("generations")
      .doc(userId)
      .collection("items")
      .doc(generationId);

    const generationDoc = await generationRef.get();

    if (!generationDoc.exists) {
      console.warn("[Edit] Generation not found");
      res.status(404).json({
        message: "Generation not found",
      } as GenerateResponseData);
      return;
    }

    const generationData = generationDoc.data() as FirestoreGenerationDocument;

    // Download the source image from Firebase Storage
    const sourceImageFileName = sourceImageUrl.split("/").pop()?.split("?")[0];
    if (!sourceImageFileName) {
      throw new Error("Could not parse source image URL");
    }

    const bucket = storage.bucket();
    const [sourceImageBuffer] = await bucket
      .file(decodeURIComponent(sourceImageFileName))
      .download();

    if (!sourceImageBuffer || sourceImageBuffer.length === 0) {
      throw new Error("Failed to download source image");
    }

    // Prepare an OpenAI image file from the buffer
    const openaiImageFile = new File([sourceImageBuffer], "source.png", {
      type: "image/png",
    });

    // Prepare the prompt
    const systemMessage = `You are an AI specialized in editing product advertisements based on user requests. Your goal is to modify an existing advertisement image according to the user's instructions while maintaining the overall quality and professional look.`;

    const editPrompt = `${systemMessage}

I have an existing advertisement image that I want to modify. Here's what I want to change:

${editDescription}

Please make only the specific changes requested while keeping everything else looking professional and maintaining the original quality. The changes should be seamless and the final result should still look like a professional advertisement.

Original Advertisement Description:
${description || generationData.description}

Product Description:
${productDescription || generationData.productDescription}

Style Requirements:
${style || generationData.style || ""}

Aspect Ratio:
${aspectRatio || generationData.aspectRatio || "1:1"}

${
  textInfo || generationData.textInfo
    ? `Text Requirements:
${
  (textInfo || generationData.textInfo)?.mainText
    ? `- Heading: "${(textInfo || generationData.textInfo)?.mainText}"`
    : "- No heading specified"
}
${
  (textInfo || generationData.textInfo)?.secondaryText
    ? `- Subheading: "${(textInfo || generationData.textInfo)?.secondaryText}"`
    : "- No subheading specified"
}
${
  (textInfo || generationData.textInfo)?.position === "auto"
    ? "- Text Placement: Choose the best placement for the text"
    : (textInfo || generationData.textInfo)?.styleNotes
    ? `- Text Placement: ${(textInfo || generationData.textInfo)?.styleNotes}`
    : "- Text Placement: Choose the best placement for the text"
}`
    : "- There should be no text in the image other than what is on the product"
}

Important Guidelines:
- Follow the edit description precisely
- Ensure the product is still clearly visible and recognizable
- Maintain high visual quality and appeal
- Keep the general style consistent with the original
${
  textInfo || generationData.textInfo
    ? "- Maintain the specified text exactly as provided"
    : ""
}
- The generated image should still be a complete advertisement`;

    // Call OpenAI image edit endpoint
    let imageBuffer: Buffer | null = null;
    try {
      console.log("[Edit] Calling OpenAI to edit the image");
      const result = await openai.images.edit({
        model: "gpt-image-1",
        image: openaiImageFile,
        prompt: editPrompt,
      });

      const imageBase64 = result.data?.[0]?.b64_json;
      if (!imageBase64) throw new Error("No image returned from OpenAI");
      imageBuffer = Buffer.from(imageBase64, "base64");
    } catch (error) {
      console.error("[Edit] OpenAI image editing failed:", error);

      // Get existing versions and append error version
      const versions = generationData.versions || [];

      // If no versions exist yet, create an initial version
      if (versions.length === 0) {
        versions.push({
          createdAt: generationData.createdAt,
          imageUrl: generationData.generatedImageUrl,
          status: "completed",
        });
      }

      // Find and update the version with the provided versionId
      const updatedVersions = versions.map((version) => {
        if (version.versionId === versionId) {
          return {
            ...version,
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "OpenAI image editing failed",
            updatedAt: Timestamp.now(),
          };
        }
        return version;
      });

      await generationRef.update({
        versions: updatedVersions,
        status: "completed" as GenerationStatus, // Revert to completed
        updatedAt: Timestamp.now(),
      });

      throw error;
    }

    if (!imageBuffer) {
      const error = new Error("No image generated in the OpenAI response");

      // Get existing versions and update the error version
      const versions = generationData.versions || [];

      // If no versions exist yet, create an initial version
      if (versions.length === 0) {
        versions.push({
          createdAt: generationData.createdAt,
          imageUrl: generationData.generatedImageUrl,
          status: "completed",
        });
      }

      // Find and update the version with the provided versionId
      const updatedVersions = versions.map((version) => {
        if (version.versionId === versionId) {
          return {
            ...version,
            status: "error",
            error: error.message,
            updatedAt: Timestamp.now(),
          };
        }
        return version;
      });

      await generationRef.update({
        versions: updatedVersions,
        status: "completed" as GenerationStatus, // Revert to completed
        updatedAt: Timestamp.now(),
      });

      throw error;
    }

    // Use the versionId provided from the frontend instead of generating a new one
    const fileName = `generatedImages/${userId}/${generationId}/${versionId}.png`;
    console.log(`[Edit] Uploading edited image to path: ${fileName}`);
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    await file.makePublic();
    const newVersionImageUrl = file.publicUrl();

    // Get existing versions
    const versions = generationData.versions || [];

    // If no versions exist yet, create an initial version for the original image
    if (versions.length === 0) {
      console.log(
        "[Edit] No versions found, creating initial version from original image"
      );
      versions.push({
        createdAt: generationData.createdAt,
        imageUrl: generationData.generatedImageUrl,
        status: "completed",
        versionId: "original",
      });
    }

    // Update the existing version with the provided versionId
    const updatedVersions = versions.map((version) => {
      if (version.versionId === versionId) {
        return {
          ...version,
          editDescription,
          imageUrl: newVersionImageUrl,
          status: "completed",
          updatedAt: Timestamp.now(),
        };
      }
      return version;
    });

    // Update Firestore document with the updated version and set it as the current image
    await generationRef.update({
      versions: updatedVersions,
      status: "completed" as GenerationStatus,
      generatedImageUrl: newVersionImageUrl, // Update the main image URL to the latest version
      updatedAt: Timestamp.now(),
    });

    // Send response
    res.status(200).json({
      message: "Image edited successfully",
      data: {
        imageUrl: newVersionImageUrl,
      },
    } as GenerateResponseData);
  } catch (error) {
    console.error("[Edit] Error in edit route:", error);
    res.status(500).json({
      message: "Error processing edit request",
      data: {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    } as GenerateResponseData);
  }
};

router.post("/", handleEditRequest);

export { router };
