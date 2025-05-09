import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";

// Define a type for version objects
interface Version {
  createdAt: Timestamp;
  imageUrl?: string;
  editDescription?: string;
  status: string;
  error?: string;
  versionId?: string;
  originalImageUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      sourceImageUrl,
      editDescription,
      generationId,
      userId,
      description,
      productDescription,
    } = data;

    // Validate required fields
    if (!sourceImageUrl || !editDescription || !generationId || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the existing generation document
    const generationRef = doc(db, "generations", userId, "items", generationId);
    const generationDoc = await getDoc(generationRef);

    if (!generationDoc.exists()) {
      return NextResponse.json(
        { message: "Generation not found" },
        { status: 404 }
      );
    }

    const generationData = generationDoc.data();
    const currentVersions = generationData.versions || ([] as Version[]);

    // If no versions exist yet, create an initial version for the original image
    if (currentVersions.length === 0) {
      console.log(
        "[Edit Frontend] No versions found, creating initial version from original image"
      );
      currentVersions.push({
        createdAt: generationData.createdAt,
        imageUrl: generationData.generatedImageUrl,
        status: "completed",
        versionId: "original",
      } as Version);
    } else {
      // Check if we have an original version
      const hasOriginalVersion = currentVersions.some(
        (v: Version) => v.versionId === "original"
      );
      if (!hasOriginalVersion && generationData.generatedImageUrl) {
        console.log(
          "[Edit Frontend] No original version found, creating it now"
        );
        // Add the original version
        currentVersions.unshift({
          createdAt: generationData.createdAt,
          imageUrl: generationData.generatedImageUrl,
          status: "completed",
          versionId: "original",
        } as Version);
      }
    }

    // Create a version tag with a unique ID
    const versionId = `v${Date.now()}`;

    // Create a version tag in the document for tracking the processing state
    const processingVersion: Version = {
      createdAt: Timestamp.now(),
      editDescription,
      status: "processing",
      originalImageUrl: sourceImageUrl,
      versionId,
    };

    // Add the processing version to the versions array
    await updateDoc(generationRef, {
      versions: [...currentVersions, processingVersion],
      status: "processing", // Set main document status to processing
      updatedAt: Timestamp.now(),
    });

    // Call the backend API to process the edit
    const backendUrl = process.env.BACKEND_URL;
    const backendResponse = await fetch(`${backendUrl}/api/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        generationId,
        sourceImageUrl,
        editDescription,
        versionId, // Pass the versionId to the backend so it can update the same version
        // Include previous data
        description: description || generationDoc.data().description,
        productDescription:
          productDescription || generationDoc.data().productDescription,
        // Template-specific fields
        template: generationDoc.data().template,
        style: generationDoc.data().style,
        aspectRatio: generationDoc.data().aspectRatio,
        textInfo: generationDoc.data().textInfo,
      }),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error("Edit request failed:", responseData);

      // Get the current document data again to ensure we have the latest
      const updatedDoc = await getDoc(generationRef);

      if (!updatedDoc.exists()) {
        // This should never happen, but handle it just in case
        return NextResponse.json(
          { message: "Generation not found during error recovery" },
          { status: 404 }
        );
      }

      const updatedData = updatedDoc.data();
      let updatedVersions = updatedData.versions || ([] as Version[]);

      // Find and remove the processing version with our versionId
      updatedVersions = updatedVersions.filter(
        (v: Version) => v.versionId !== versionId
      );

      // Update the document to revert the status and remove the failed version
      await updateDoc(generationRef, {
        status: "completed", // Revert to completed
        versions: updatedVersions,
        updatedAt: Timestamp.now(),
      });

      // Special handling for safety system rejections
      const errorMessage = responseData.data?.error || "Unknown error";
      const isSafetyRejection =
        errorMessage.includes("safety system") ||
        errorMessage.includes("rejected") ||
        errorMessage.includes("not allowed");

      const userFriendlyMessage = isSafetyRejection
        ? "Your edit was rejected by the AI safety system. Please try a different edit description."
        : "Failed to generate the edited image. Please try again with different instructions.";

      return NextResponse.json(
        {
          message: "Error processing edit request",
          data: {
            error: userFriendlyMessage,
            details: errorMessage,
          },
        },
        { status: backendResponse.status }
      );
    }

    // Success case - the backend should have already updated the version
    // We don't need to update it again here, just return success
    return NextResponse.json({
      message: "Edit request submitted successfully",
      data: {
        generationId,
      },
    });
  } catch (error) {
    console.error("Error handling edit request:", error);
    return NextResponse.json(
      {
        message: "Error processing edit request",
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
