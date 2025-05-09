import { User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";
import {
  UploadedImage,
  GenerationUIStatus,
  GenerationDocument,
  GenerateApiRequest,
  TemplateType,
} from "@/types/generation";

// Get router type from next/navigation's useRouter return type
type Router = ReturnType<typeof useRouter>;

interface GenerateAdOptions {
  user: User;
  router: Router;
  productImages: UploadedImage[];
  inspirationImages?: UploadedImage[];
  productName?: string;
  description?: string;
  adDescription?: string;
  style?: string;
  aspectRatio?: string;
  template?: TemplateType;
  textInfo?: {
    mainText: string;
    secondaryText: string;
    position: string;
    styleNotes: string;
  };
  // Template-specific fields
  environment?: "indoor" | "outdoor" | "both";
  timeOfDay?: "day" | "night" | "any";
  lifestyleDescription?: string;
  activityDescription?: string;
  moodKeywords?: string;
  clothingType?: string;
  shotType?: "closeup" | "full-body";
  viewType?: "single" | "multiple";
  offerDescription?: string;
  price?: string;
  discount?: string;
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
    productName = "",
    description = "",
    adDescription = "",
    style = "",
    aspectRatio = "1:1",
    template,
    textInfo = {
      mainText: "",
      secondaryText: "",
      position: "",
      styleNotes: "",
    },
    // Template-specific options
    environment,
    timeOfDay,
    lifestyleDescription,
    activityDescription,
    moodKeywords,
    clothingType,
    shotType,
    viewType,
    offerDescription,
    price,
    discount,
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

  // Generate a new generation ID
  const newGenerationId = Date.now().toString();
  console.log(`Starting generation with ID: ${newGenerationId}`);

  try {
    // Update local state
    setIsGenerating(true);
    setGenerationStatus(null);
    // Only update currentGenerationId if the setter is provided
    if (setCurrentGenerationId) {
      setCurrentGenerationId(newGenerationId);
    }

    // Update global state for notification
    setGlobalGenerationId(newGenerationId);

    // Set up Firestore subscription for this generation
    setupFirestoreSubscription({
      userId: user.uid,
      generationId: newGenerationId,
      router,
      setIsGenerating,
      setGenerationStatus,
      setGlobalGenerationId,
    });

    // Convert images to base64
    const productImagesBase64 = await Promise.all(
      productImages.map(async (img) => {
        const buffer = await img.file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return `data:${img.file.type};base64,${base64}`;
      })
    );

    const inspirationImagesBase64 = await Promise.all(
      inspirationImages.map(async (img) => {
        const buffer = await img.file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return `data:${img.file.type};base64,${base64}`;
      })
    );

    // Build request data
    const requestData: Partial<GenerateApiRequest> = {
      productImages: productImagesBase64,
      inspirationImages:
        inspirationImagesBase64.length > 0 ? inspirationImagesBase64 : [],
      productDescription: description.trim(),
      description:
        adDescription.trim() || "Create a compelling ad for the product.",
      productName: productName.trim(),
      userId: user.uid,
      generationId: newGenerationId,
      style,
      aspectRatio,
      textInfo,
    };

    // Add template-specific fields if provided
    if (template) {
      requestData.template = template;
    }

    if (environment) requestData.environment = environment;
    if (timeOfDay) requestData.timeOfDay = timeOfDay;
    if (lifestyleDescription)
      requestData.lifestyleDescription = lifestyleDescription;
    if (activityDescription)
      requestData.activityDescription = activityDescription;
    if (moodKeywords) requestData.moodKeywords = moodKeywords;
    if (clothingType) requestData.clothingType = clothingType;
    if (shotType) requestData.shotType = shotType;
    if (viewType) requestData.viewType = viewType;
    if (offerDescription) requestData.offerDescription = offerDescription;
    if (price) requestData.price = price;
    if (discount) requestData.discount = discount;

    // Make API request
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${apiUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message ||
          responseData.data?.error ||
          "Failed to start generation"
      );
    }

    console.log("Generation started successfully:", newGenerationId);

    // Immediately redirect to gallery after successful API response
    router.push("/gallery");

    return newGenerationId;
  } catch (error) {
    console.error("Error starting generation:", error);
    setIsGenerating(false);
    // Only update currentGenerationId if the setter is provided
    if (setCurrentGenerationId) {
      setCurrentGenerationId(null);
    }
    // Clear the global generation ID on error
    setGlobalGenerationId(null);
    setGenerationStatus({
      status: "error",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
    return null;
  }
};

/**
 * Sets up a Firestore subscription to track generation status.
 */
interface SubscriptionOptions {
  userId: string;
  generationId: string;
  router: Router; // Keeping for backward compatibility
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

  // Subscribe to Firestore updates
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

          // Don't redirect here as we're already redirecting after API response
          // Keep the global generation ID active so notification can still show on gallery page
        } else if (data.status === "error") {
          console.log("Generation failed with error:", data.error);
          setGenerationStatus({
            status: data.status,
            error: data.error,
          });
          setIsGenerating(false);
          // Clear the global generation ID on error
          setGlobalGenerationId(null);
        }
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
