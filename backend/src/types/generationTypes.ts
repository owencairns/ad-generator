import { Timestamp } from "firebase-admin/firestore";

// GenerateRequestBody - Simplified: Backend fetches details from Firestore
export interface GenerateRequestBody {
  // Identifiers passed to trigger the process
  userId: string;
  generationId: string;
}

export interface GenerateResponseData {
  message: string;
  data?: {
    imageUrl?: string;
    error?: string;
  };
}

export type GenerationStatus = "processing" | "completed" | "error";

export interface ProcessedImage {
  type: "product" | "inspiration";
  url: string;
}

// Interface for different versions of the generated image
export interface GenerationVersion {
  versionId: string;
  imageUrl: string;
  createdAt: Timestamp;
  status: GenerationStatus;
  promptUsed?: string;
  revisedPrompt?: string; // For DALL-E 3 response
}

// FirestoreGenerationDocument - Represents the structure in Firestore.
// Frontend saves a SUBSET initially. Backend READS this and ADDS results.
export interface FirestoreGenerationDocument {
  // --- Core Metadata ---
  status: GenerationStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // --- Inputs Provided by User (Saved by Frontend) ---
  productName?: string; // Keep for metadata if saved
  productDescription?: string; // Keep for metadata if saved
  prompt: string; // The core user prompt, now containing all details
  size?: string; // Keep if needed for OpenAI API call
  productImageUrls: string[];
  inspirationImageUrls?: string[];

  // --- Backend Processing Details (Added by Backend) ---
  openaiPrompt?: string; // The prompt sent to OpenAI (could be enhanced one)
  revisedPrompt?: string; // The prompt returned by DALL-E 3
  error?: string;

  // --- Final Result(s) (Added by Backend) ---
  generatedImageUrl?: string;
  versions?: GenerationVersion[]; // Array to hold different versions
}
