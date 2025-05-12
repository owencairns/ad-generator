import { User } from "firebase/auth";
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";
import {
  UploadedImage,
  GenerationUIStatus,
  GenerationDocument,
} from "@/types/generation";

// Get router type from next/navigation's useRouter return type
type Router = ReturnType<typeof useRouter>;

// No longer need GenerateImageApiRequest if backend fetches details from Firestore

interface GenerateAdOptions {
  user: User;
  router: Router;
  productImages: UploadedImage[];
  inspirationImages?: UploadedImage[];
  size?: string;
  template?: string;
  prompt: string;
  // State setters
  setIsGenerating: (isGenerating: boolean) => void;
  setGenerationStatus: (status: GenerationUIStatus | null) => void;
  setCurrentGenerationId?: (id: string | null) => void;
  setGlobalGenerationId: (id: string | null) => void;
}

/**
 * Utility function for generating an ad across any template.
 * Handles the Firestore subscription, notification management, and API call.
 */
export const generateAd = async (
  options: GenerateAdOptions
): Promise<string | null> => {
  const {
    user,
    router,
    productImages,
    inspirationImages = [],
    // --- Use simplified prompt fields ---
    prompt,
    template,
    size = "1024x1024",

    // State setters
    setIsGenerating,
    setGenerationStatus,
    setCurrentGenerationId,
    setGlobalGenerationId,
  } = options;

  // Validate required fields
  if (!user) {
    throw new Error("User is required");
  }
  if (productImages.length === 0) {
    throw new Error("At least one product image is required");
  }
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const newGenerationId = Date.now().toString();
  console.log(`Starting generation with ID: ${newGenerationId}`);

  // Initial state updates
  setIsGenerating(true);
  setGenerationStatus(null);
  if (setCurrentGenerationId) {
    setCurrentGenerationId(newGenerationId);
  }
  setGlobalGenerationId(newGenerationId);

  // --- Start Firestore Listener EARLY ---
  const unsubscribe = setupFirestoreSubscription({
    userId: user.uid,
    generationId: newGenerationId,
    router,
    setIsGenerating,
    setGenerationStatus,
    setGlobalGenerationId,
  });

  try {
    // --- 1. Upload Images via Next.js API Route ---
    console.log(`[generateAd] Uploading images for ${newGenerationId}...`);
    const formData = new FormData();
    formData.append("userId", user.uid);
    formData.append("generationId", newGenerationId);
    productImages.forEach((img) => formData.append("productImages", img.file));
    inspirationImages.forEach((img) =>
      formData.append("inspirationImages", img.file)
    );

    const uploadResponse = await fetch("/api/upload-images", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(
        `Image upload failed: ${errorData.message || uploadResponse.statusText}`
      );
    }

    const { productImageUrls, inspirationImageUrls } =
      await uploadResponse.json();
    console.log(`[generateAd] Images uploaded for ${newGenerationId}:`, {
      productImageUrls,
      inspirationImageUrls,
    });

    // --- 2. Create Initial Firestore Document ---
    console.log(
      `[generateAd] Creating Firestore doc for ${newGenerationId}...`
    );
    const generationRef = doc(
      db,
      "generations",
      user.uid,
      "items",
      newGenerationId
    );

    // Simplified initial data based on the new options
    const initialDocData: Partial<GenerationDocument> = {
      status: "processing",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      prompt: prompt, // Store the main prompt
      productImageUrls: productImageUrls,
      inspirationImageUrls: inspirationImageUrls?.length
        ? inspirationImageUrls
        : undefined,
      template: template || undefined, // Store template identifier
      size: size || undefined, // Renamed from aspectRatio
    };

    // Revert to using 'any' for the accumulator assignment to bypass complex type error
    const cleanedData = Object.entries(initialDocData).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc as any)[key] = value; // Reverted casting
        }
        return acc;
      },
      {} as Partial<GenerationDocument>
    );

    await setDoc(generationRef, cleanedData);
    console.log(`[generateAd] Firestore doc created for ${newGenerationId}`);

    // --- 3. Call Refactored Backend Endpoint ---
    console.log(`[generateAd] Calling backend for ${newGenerationId}...`);
    const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const backendRequestData = {
      // Payload remains simple
      userId: user.uid,
      generationId: newGenerationId,
    };

    const backendResponse = await fetch(`${backendApiUrl}/api/generate-image`, {
      // Correct endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendRequestData),
    });

    const backendResponseData = await backendResponse.json();

    if (!backendResponse.ok) {
      throw new Error(
        `Backend generation request failed: ${
          backendResponseData.message || "Unknown error"
        }`
      );
    }

    console.log(
      `[generateAd] Backend processing initiated for ${newGenerationId}`
    );

    // --- 4. Redirect ---
    router.push("/gallery");

    return newGenerationId;
  } catch (error) {
    console.error("[generateAd] Error during generation process:", error);

    setIsGenerating(false);
    if (setCurrentGenerationId) {
      setCurrentGenerationId(null);
    }
    setGlobalGenerationId(null);
    setGenerationStatus({
      status: "error",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });

    if (unsubscribe) {
      unsubscribe();
    }
    return null;
  }
};

/**
 * Sets up a Firestore subscription to track generation status.
 */
interface SubscriptionOptions {
  userId: string;
  generationId: string;
  router: Router;
  setIsGenerating: (isGenerating: boolean) => void;
  setGenerationStatus: (status: GenerationUIStatus | null) => void;
  setGlobalGenerationId: (id: string | null) => void;
}

export const setupFirestoreSubscription = (
  options: SubscriptionOptions
): (() => void) => {
  const {
    userId,
    generationId,
    // router is not used but kept in the interface for backward compatibility
    setIsGenerating,
    setGenerationStatus,
    setGlobalGenerationId,
  } = options;

  const generationRef = doc(db, "generations", userId, "items", generationId);

  const unsubscribe = onSnapshot(
    generationRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as GenerationDocument;
        console.log(`Generation ${generationId} status update:`, data.status);

        if (data.status === "completed") {
          console.log("Generation completed, updating status");
          setIsGenerating(false);
          setGenerationStatus({
            status: "completed",
            imageUrl: data.generatedImageUrl,
          });
        } else if (data.status === "error") {
          console.log("Generation failed with error:", data.error);
          setGenerationStatus({
            status: data.status,
            error: data.error,
          });
          setIsGenerating(false);
          setGlobalGenerationId(null);
        }
        // If status is 'processing', we typically don't do anything here,
        // as the UI is already in a generating state.
      }
    },
    (error) => {
      console.error("Error in Firestore subscription:", error);
      setIsGenerating(false);
      setGenerationStatus({
        status: "error",
        error: "Failed to track generation status",
      });
      setGlobalGenerationId(null);
    }
  );

  return unsubscribe;
};
