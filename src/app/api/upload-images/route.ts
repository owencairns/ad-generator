import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import sharp from "sharp";
import { Buffer } from "node:buffer";

// Ensure Firebase Admin SDK is initialized
// IMPORTANT: Replace with your actual admin SDK initialization logic
// (e.g., loading credentials from environment variables)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!getApps().length && serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Ensure this env var is set
  });
} else if (!getApps().length) {
  console.warn(
    "Firebase Admin SDK not initialized. Missing service account key."
  );
  // Handle initialization without credentials if needed for specific environments,
  // but storage operations might fail.
}

const compressAndUploadImageAdmin = async (
  imageBuffer: Buffer,
  userId: string,
  generationId: string,
  type: "product" | "inspiration",
  index: number
): Promise<string> => {
  console.log(
    `[API Upload] Processing ${type} image ${index + 1} for user ${userId}`
  );
  try {
    // Compress image
    const compressedBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 60 }) // Keep compression consistent
      .toBuffer();

    // Upload to Firebase Storage using Admin SDK
    const bucket = getStorage().bucket(); // Get default bucket instance
    const fileName = `generatedImages/${userId}/${generationId}/${type}-${
      index + 1
    }.jpg`;
    const file = bucket.file(fileName);

    await file.save(compressedBuffer, {
      metadata: {
        contentType: "image/jpeg",
      },
      public: true, // Make the file public directly
    });

    // Construct the public URL manually (ensure bucket name is correct)
    // Alternatively, use file.publicUrl() if your bucket permissions allow,
    // but manual construction is often more reliable for public access.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log(
      `[API Upload] Uploaded ${type} image ${index + 1} to ${publicUrl}`
    );
    return publicUrl;
  } catch (error) {
    console.error(`[API Upload] Error processing ${type} image:`, error);
    throw error; // Re-throw the error to be caught by the handler
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const generationId = formData.get("generationId") as string;
    const productImages = formData.getAll("productImages") as File[];
    const inspirationImages = formData.getAll("inspirationImages") as File[];

    if (!userId || !generationId) {
      return NextResponse.json(
        { message: "User ID and Generation ID are required" },
        { status: 400 }
      );
    }
    if (productImages.length === 0) {
      return NextResponse.json(
        { message: "At least one product image is required" },
        { status: 400 }
      );
    }

    console.log(
      `[API Upload] Received ${productImages.length} product images and ${inspirationImages.length} inspiration images for ${userId}/${generationId}`
    );

    // Process images concurrently
    const [productImageUrls, inspirationImageUrls] = await Promise.all([
      Promise.all(
        productImages.map(async (file, idx) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return compressAndUploadImageAdmin(
            buffer,
            userId,
            generationId,
            "product",
            idx
          );
        })
      ),
      Promise.all(
        inspirationImages.map(async (file, idx) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return compressAndUploadImageAdmin(
            buffer,
            userId,
            generationId,
            "inspiration",
            idx
          );
        })
      ),
    ]);

    return NextResponse.json({
      productImageUrls,
      inspirationImageUrls,
    });
  } catch (error) {
    console.error("[API Upload] Error handling image upload:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
