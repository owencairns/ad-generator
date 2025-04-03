import { Timestamp } from "firebase/firestore";

export type GenerationStatus = "processing" | "completed" | "error";

export interface GenerationDocument {
  description: string;
  productImageUrls: string[];
  inspirationImageUrls?: string[];
  status: GenerationStatus;
  generatedImageUrl?: string;
  error?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  productImages: string[]; // base64 encoded images
  inspirationImages?: string[]; // base64 encoded images
  userId: string;
  generationId: string;
}

export interface GenerateApiResponse {
  message: string;
  data?: {
    imageUrl?: string;
    error?: string;
  };
}
