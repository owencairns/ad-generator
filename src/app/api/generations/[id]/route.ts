import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const generationId = id;

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the ID token
    const idToken = authHeader.split("Bearer ")[1];

    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Reference to the generation document
    const generationRef = adminDb
      .collection("generations")
      .doc(userId)
      .collection("items")
      .doc(generationId);

    // Get the generation document to retrieve image URLs
    const generationDoc = await generationRef.get();

    if (!generationDoc.exists) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    const generationData = generationDoc.data();

    // Helper function to extract storage path from URL
    const getStoragePathFromUrl = (url: string): string | null => {
      try {
        const imageUrl = new URL(url);
        const pathName = decodeURIComponent(imageUrl.pathname);

        // Firebase Storage URLs are in the format:
        // https://firebasestorage.googleapis.com/v0/b/[BUCKET_NAME]/o/[ENCODED_OBJECT_PATH]?[QUERY_PARAMS]
        const parts = pathName.split("/o/");
        if (parts.length > 1) {
          return parts[1];
        }
        return null;
      } catch (error) {
        console.error("Error extracting path from URL:", error);
        return null;
      }
    };

    // Helper function to delete a file from storage
    const deleteFile = async (fileUrl: string) => {
      try {
        const filePath = getStoragePathFromUrl(fileUrl);
        if (filePath) {
          const fileRef = adminStorage.bucket().file(filePath);
          await fileRef.delete();
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        // Continue despite errors
      }
    };

    // Delete operations
    const deleteOperations = [];

    // Delete generated image if it exists
    if (generationData?.generatedImageUrl) {
      deleteOperations.push(deleteFile(generationData.generatedImageUrl));
    }

    // Delete product images if they exist
    if (
      generationData?.productImageUrls &&
      Array.isArray(generationData.productImageUrls)
    ) {
      for (const imageUrl of generationData.productImageUrls) {
        if (imageUrl) {
          deleteOperations.push(deleteFile(imageUrl));
        }
      }
    }

    // Delete inspiration images if they exist
    if (
      generationData?.inspirationImageUrls &&
      Array.isArray(generationData.inspirationImageUrls)
    ) {
      for (const imageUrl of generationData.inspirationImageUrls) {
        if (imageUrl) {
          deleteOperations.push(deleteFile(imageUrl));
        }
      }
    }

    // Execute all delete operations in parallel
    await Promise.allSettled(deleteOperations);

    // Delete the document from Firestore
    await generationRef.delete();

    return NextResponse.json({
      success: true,
      message: "Generation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting generation:", error);
    return NextResponse.json(
      { error: "Failed to delete generation" },
      { status: 500 }
    );
  }
}
