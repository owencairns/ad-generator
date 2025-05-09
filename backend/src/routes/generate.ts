import { Router, RequestHandler } from "express";
import { storage, db } from "../config/firebase";
import sharp from "sharp";
import {
  GenerateRequestBody,
  GenerateResponseData,
  FirestoreGenerationDocument,
  ProcessedImage,
  GenerationStatus,
  TemplateType,
} from "../types";
import { Timestamp } from "firebase-admin/firestore";
import { OpenAI } from "openai";
import { File } from "node:buffer";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

// Helper function to recursively clean undefined values from objects
const cleanUndefinedValues = (
  obj: Partial<FirestoreGenerationDocument>
): Partial<FirestoreGenerationDocument> => {
  if (!obj || typeof obj !== "object") {
    return {};
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === null || value === undefined) {
      return acc;
    }

    if (Array.isArray(value)) {
      const cleanedArray = value.filter(
        (item) => item !== null && item !== undefined
      );
      if (cleanedArray.length > 0) {
        (acc as any)[key] = cleanedArray;
      }
      return acc;
    }

    if (typeof value === "object") {
      const cleanedObj = cleanUndefinedValues(
        value as Partial<FirestoreGenerationDocument>
      );
      if (Object.keys(cleanedObj).length > 0) {
        (acc as any)[key] = cleanedObj;
      }
      return acc;
    }

    (acc as any)[key] = value;
    return acc;
  }, {} as Partial<FirestoreGenerationDocument>);
};

// Modified the function signature to accept Partial<FirestoreGenerationDocument>
const createFirestoreDocument = async (
  userId: string,
  generationId: string,
  data: Partial<
    Omit<FirestoreGenerationDocument, "status" | "createdAt" | "updatedAt">
  >
) => {
  const docRef = db
    .collection("generations")
    .doc(userId)
    .collection("items")
    .doc(generationId);

  const now = Timestamp.now();

  // Clean undefined values before saving to Firestore
  const cleanedData = cleanUndefinedValues(data);

  // Make sure required fields are present
  if (!cleanedData.description || !cleanedData.productDescription) {
    throw new Error(
      "Required fields missing: description and productDescription are required"
    );
  }

  // Ensure productImageUrls is an array
  const productImageUrls = Array.isArray(cleanedData.productImageUrls)
    ? cleanedData.productImageUrls
    : [];

  // Create a base document with required fields
  const docData: FirestoreGenerationDocument = {
    description: cleanedData.description as string,
    productDescription: cleanedData.productDescription as string,
    productImageUrls: productImageUrls as string[],
    status: "processing",
    createdAt: now,
    updatedAt: now,
  };

  // Add optional fields if they exist
  if (cleanedData.productName)
    docData.productName = cleanedData.productName as string;
  if (cleanedData.inspirationImageUrls)
    docData.inspirationImageUrls = cleanedData.inspirationImageUrls as string[];
  if (cleanedData.style) docData.style = cleanedData.style as string;
  if (cleanedData.aspectRatio)
    docData.aspectRatio = cleanedData.aspectRatio as string;
  if (cleanedData.template)
    docData.template = cleanedData.template as TemplateType;
  if (cleanedData.textInfo)
    docData.textInfo =
      cleanedData.textInfo as FirestoreGenerationDocument["textInfo"];

  // Add template-specific fields
  if (cleanedData.lifestyleDescription)
    docData.lifestyleDescription = cleanedData.lifestyleDescription as string;
  if (cleanedData.environment)
    docData.environment = cleanedData.environment as string;
  if (cleanedData.timeOfDay)
    docData.timeOfDay = cleanedData.timeOfDay as string;
  if (cleanedData.activityDescription)
    docData.activityDescription = cleanedData.activityDescription as string;
  if (cleanedData.moodKeywords)
    docData.moodKeywords = cleanedData.moodKeywords as string;
  if (cleanedData.clothingType)
    docData.clothingType = cleanedData.clothingType as string;
  if (cleanedData.shotType) docData.shotType = cleanedData.shotType as string;
  if (cleanedData.viewType) docData.viewType = cleanedData.viewType as string;
  if (cleanedData.offerDescription)
    docData.offerDescription = cleanedData.offerDescription as string;
  if (cleanedData.price) docData.price = cleanedData.price as string;
  if (cleanedData.discount) docData.discount = cleanedData.discount as string;

  await docRef.set(docData);
  return docRef;
};

function base64ToBuffer(base64Image: string): Buffer {
  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image format");
  return Buffer.from(matches[2], "base64");
}

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
      template,
      // Lifestyle template fields
      lifestyleDescription,
      environment,
      timeOfDay,
      activityDescription,
      moodKeywords,
      // Clothing showcase fields
      clothingType,
      shotType,
      viewType,
      // Special offer fields
      offerDescription,
      price,
      discount,
    } = req.body as GenerateRequestBody;

    // --- TEMPLATE-SPECIFIC LOGIC ---
    let finalDescription = description;
    let finalProductDescription = productDescription;
    let finalStyle = style || "";
    let finalAspectRatio = aspectRatio || "1:1";
    let finalTextInfo = textInfo;
    let finalInspirationImages = inspirationImages;
    let firestoreData: Partial<FirestoreGenerationDocument> = {};

    if (template === "product-showcase") {
      // Product Showcase Template
      finalDescription =
        description ||
        "Create a clean, professional product showcase advertisement that highlights the product clearly and attractively.";
      finalProductDescription =
        productDescription ||
        "Showcase the product with a focus on clarity, lighting, and minimal distractions.";
      finalStyle =
        style ||
        "Minimal, clean background, professional lighting, product-centric composition, e-commerce ready.";
      finalAspectRatio = aspectRatio || "1:1";
      finalTextInfo = undefined; // No extra text by default
      finalInspirationImages = [];
    } else if (template === "lifestyle") {
      // Lifestyle Template
      if (!lifestyleDescription || !activityDescription) {
        console.warn(
          "[Generate] Missing lifestyle description or activity description"
        );
        res.status(400).json({
          message:
            "Lifestyle description and activity description are required",
        } as GenerateResponseData);
        return;
      }

      finalDescription = `Create a lifestyle advertisement that shows the product in use in a ${
        environment || "versatile"
      } environment during ${timeOfDay || "daytime"}.`;

      if (moodKeywords) {
        finalDescription += ` The mood should be: ${moodKeywords}.`;
      }

      finalProductDescription = `${productDescription}\n\nLifestyle Context: ${lifestyleDescription}\n\nActivity/Scene: ${activityDescription}`;
      finalStyle =
        style ||
        "Natural, authentic, lifestyle photography with realistic lighting";
      finalAspectRatio = aspectRatio || "4:5";

      // Store lifestyle specific fields
      firestoreData = {
        lifestyleDescription,
        environment,
        timeOfDay,
        activityDescription,
        moodKeywords,
      };
    } else if (template === "clothing-showcase") {
      // Clothing Showcase Template
      if (!clothingType) {
        console.warn("[Generate] Missing clothing type description");
        res.status(400).json({
          message: "Clothing type description is required",
        } as GenerateResponseData);
        return;
      }

      const viewTypeText =
        viewType === "multiple"
          ? "showing multiple angles (front and back)"
          : "from a single clear angle";
      const shotTypeText =
        shotType === "closeup"
          ? "with close-up details of textures and features"
          : "full-body to show the complete look";

      finalDescription = `Create a professional clothing showcase for ${clothingType} ${viewTypeText} ${shotTypeText}.`;
      finalProductDescription = `${productDescription}\n\nClothing details: ${clothingType}`;
      finalStyle =
        style ||
        "Clean, professional fashion photography style with neutral background";
      finalAspectRatio = aspectRatio || "4:5";

      // Store clothing specific fields
      firestoreData = {
        clothingType,
        shotType,
        viewType,
      };
    } else if (template === "special-offer") {
      // Special Offer Template
      if (!offerDescription) {
        console.warn("[Generate] Missing offer description");
        res.status(400).json({
          message: "Offer description is required",
        } as GenerateResponseData);
        return;
      }

      finalDescription = `Create an attention-grabbing special offer advertisement highlighting: ${offerDescription}`;

      if (price) {
        finalDescription += ` with price: ${price}`;
      }

      if (discount) {
        finalDescription += ` featuring discount: ${discount}`;
      }

      finalProductDescription = productDescription;
      finalStyle =
        style || "Bold, promotional, high-contrast, with focus on the offer";
      finalAspectRatio = aspectRatio || "1:1";

      // Include price as text in the image
      let offerText = offerDescription;
      if (price) offerText += ` - ${price}`;
      if (discount) offerText += ` - ${discount}`;

      finalTextInfo = {
        mainText: offerText,
        secondaryText: `Limited Time Offer`,
        position: "auto",
        styleNotes: "Bold, promotional text that stands out",
      };

      // Store special offer specific fields
      firestoreData = {
        offerDescription,
        price,
        discount,
      };
    }

    // Validate request (use final* variables)
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

    if (finalInspirationImages && finalInspirationImages.length > 2) {
      console.warn(
        `[Generate] Too many inspiration images: ${finalInspirationImages.length}`
      );
      res.status(400).json({
        message: "Maximum of 2 inspiration images allowed",
      } as GenerateResponseData);
      return;
    }

    if (!finalDescription || !finalProductDescription) {
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
        finalInspirationImages.map((img, idx) =>
          compressAndUploadImage(img, userId, generationId, "inspiration", idx)
        )
      ),
    ]);

    // Ensure required fields have default values if not provided
    const finalDescriptionValue = finalDescription || "Product Advertisement";
    const finalProductDescriptionValue =
      finalProductDescription || "Product advertisement description";

    // Create Firestore document
    const firestoreDataToSave: Partial<FirestoreGenerationDocument> = {
      description: finalDescriptionValue,
      productDescription: finalProductDescriptionValue,
      productName: req.body.productName,
      productImageUrls,
      ...(inspirationImageUrls.length > 0 ? { inspirationImageUrls } : {}),
      style: finalStyle || "",
      aspectRatio: finalAspectRatio || "1:1",
      textInfo: finalTextInfo,
      // Save template type if specified
      template,
      // Include any template-specific data
      ...firestoreData,
    };

    const docRef = await createFirestoreDocument(
      userId,
      generationId,
      firestoreDataToSave
    );

    // Prepare prompt with template-specific guidance
    let systemMessage = `You are an AI specialized in generating creative and effective product advertisements. Your goal is to create visually appealing advertisements that showcase products clearly while maintaining engaging and professional design standards.`;

    // Add template-specific system message
    if (template) {
      systemMessage += `\n\nYou are generating a ${template.replace(
        "-",
        " "
      )} advertisement. `;

      if (template === "product-showcase") {
        systemMessage += `Focus on showcasing the product clearly with professional lighting and a clean background. The product should be the focal point of the image.`;
      } else if (template === "lifestyle") {
        systemMessage += `Create a natural, authentic scene showing the product being used in a real-life context. The scene should feel realistic and relatable.`;
      } else if (template === "clothing-showcase") {
        systemMessage += `Create a professional fashion photography style advertisement that showcases the clothing item clearly and attractively.`;
      } else if (template === "special-offer") {
        systemMessage += `Create an eye-catching promotional advertisement that highlights the special offer. Use bold, attention-grabbing design elements.`;
      }
    }

    const productImagesPrompt = `This is what the product looks like - make sure to maintain a clear and prominent view of the product in the generated advertisement. The product should be the focal point while incorporating it into an attractive advertisement design. NEVER CHANGE WHAT THE PRODUCT LOOKS LIKE UNLESS SPECIFIED.\n\nProduct Description:\n${finalProductDescription}`;

    const inspirationPrompt =
      finalInspirationImages.length > 0
        ? `These additional images are for inspiration. Draw inspiration from their design style, composition, and aesthetic while creating the advertisement for our product. NEVER INCLUDE ANY TEXT FROM THESE IMAGES. GET RID OF WATERMARKS.`
        : "";

    const prompt = `${systemMessage}

${productImagesPrompt}

${inspirationPrompt}

Advertisement Requirements:
${finalDescription}

Style Requirements:
${finalStyle}

Aspect Ratio:
${finalAspectRatio}

$${
      !finalTextInfo ||
      (!finalTextInfo.mainText && !finalTextInfo.secondaryText)
        ? "\nText Requirements:\n- There should be no text in the image other than what is on the product"
        : `\nText Requirements:\n$${
            finalTextInfo.mainText
              ? `- Heading: \"$${finalTextInfo.mainText}\"`
              : "- No heading specified"
          }
$${
            finalTextInfo.secondaryText
              ? `- Subheading: \"$${finalTextInfo.secondaryText}\"`
              : "- No subheading specified"
          }
$${
            finalTextInfo.position === "auto"
              ? "- Text Placement: Choose the best placement for the text"
              : finalTextInfo.styleNotes
              ? `- Text Placement: $${finalTextInfo.styleNotes}`
              : "- Text Placement: Choose the best placement for the text"
          }
`
    }

Important Guidelines:
- Ensure the product is clearly visible and recognizable
- Create a professional and polished advertisement
- Maintain high visual quality and appeal
- Follow the specified style requirements exactly
$${
      finalTextInfo && (finalTextInfo.mainText || finalTextInfo.secondaryText)
        ? "- Include the specified text exactly as provided"
        : ""
    }
- The generated image should be a complete advertisement`;

    // Prepare image file for OpenAI (only the first product image as base image)
    let openaiImageFile: File;
    try {
      if (!productImages[0]) {
        throw new Error(
          "No product image provided for OpenAI image edit endpoint"
        );
      }
      const buffer = base64ToBuffer(productImages[0]);
      openaiImageFile = new File([buffer], "product.png", {
        type: "image/png",
      });
    } catch (error) {
      console.error("[Generate] Failed to process image for OpenAI:", error);
      await docRef.update({
        status: "error" as GenerationStatus,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process image for OpenAI",
        updatedAt: Timestamp.now(),
      });
      throw error;
    }

    // Call OpenAI image edit endpoint
    let imageBuffer: Buffer | null = null;
    try {
      const result = await openai.images.edit({
        model: "gpt-image-1",
        image: openaiImageFile,
        prompt,
      });
      const imageBase64 = result.data?.[0]?.b64_json;
      if (!imageBase64) throw new Error("No image returned from OpenAI");
      imageBuffer = Buffer.from(imageBase64, "base64");
    } catch (error) {
      console.error("[Generate] OpenAI image generation failed:", error);
      await docRef.update({
        status: "error" as GenerationStatus,
        error:
          error instanceof Error
            ? error.message
            : "OpenAI image generation failed",
        updatedAt: Timestamp.now(),
      });
      throw error;
    }

    if (!imageBuffer) {
      const error = new Error("No image generated in the OpenAI response");
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

    // Create a versions array with the original version
    const initialVersion = {
      createdAt: Timestamp.now(),
      imageUrl: generatedImageUrl,
      status: "completed" as GenerationStatus,
      versionId: "original",
    };

    // Update Firestore document
    await docRef.update({
      status: "completed" as GenerationStatus,
      generatedImageUrl,
      updatedAt: Timestamp.now(),
      versions: [initialVersion],
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
