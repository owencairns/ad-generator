import { Timestamp } from "firebase/firestore";

export type GenerationStatus = "processing" | "completed" | "error";

export interface GenerationVersion {
  createdAt: Timestamp;
  imageUrl?: string;
  editDescription?: string;
  status: GenerationStatus;
  error?: string;
  versionId?: string;
}

export interface GenerationDocument {
  description: string;
  productDescription: string;
  productName?: string;
  productImageUrls: string[];
  inspirationImageUrls?: string[];
  status: GenerationStatus;
  generatedImageUrl?: string;
  error?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  prompt: string;
  template: string;
  size?: string;

  // Version tracking
  versions?: GenerationVersion[];
}

export interface UploadedImage {
  url: string;
  file: File;
}

export interface GenerationUIStatus {
  status: GenerationStatus;
  imageUrl?: string;
  error?: string;
}

export interface GenerateApiRequest {
  description: string;
  productDescription: string;
  productName?: string;
  productImages: string[]; // base64 encoded images
  inspirationImages?: string[]; // base64 encoded images
  userId: string;
  generationId: string;
  style?: string;
  aspectRatio?: string;
  textInfo?: {
    mainText: string;
    secondaryText: string;
    position: string;
    styleNotes: string;
  };

  template: string;
  // Lifestyle template specific fields
  lifestyleDescription?: string;
  environment?: "indoor" | "outdoor" | "both";
  timeOfDay?: "day" | "night" | "any";
  activityDescription?: string;
  moodKeywords?: string;

  // Clothing showcase template specific fields
  clothingType?: string;
  shotType?: "closeup" | "full-body";
  viewType?: "single" | "multiple";

  // Special offer template specific fields
  offerDescription?: string;
  price?: string;
  discount?: string;
}

export interface EditApiRequest {
  sourceImageUrl: string; // URL of the image to edit
  editDescription: string; // User's description of the changes to make
  previousGenerationId: string; // ID of the original generation being edited
  userId: string; // User ID
}

export interface GenerateApiResponse {
  message: string;
  data?: {
    imageUrl?: string;
    error?: string;
  };
}

export interface EditApiResponse {
  message: string;
  data?: {
    generationId?: string;
    error?: string;
  };
}
