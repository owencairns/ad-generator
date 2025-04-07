import { Timestamp } from "firebase/firestore";

export type GenerationStatus = "processing" | "completed" | "error";

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
  style?: string;
  aspectRatio?: string;
  textInfo?: {
    mainText: string;
    secondaryText: string;
    position: string;
    styleNotes: string;
  };
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
  style: string;
  aspectRatio: string;
  textInfo?: {
    mainText: string;
    secondaryText: string;
    position: string;
    styleNotes: string;
  };
}

export interface GenerateApiResponse {
  message: string;
  data?: {
    imageUrl?: string;
    error?: string;
  };
}
