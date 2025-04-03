export type GenerationStatus = "processing" | "completed" | "error";

export interface GenerateRequestBody {
  description: string;
  inspirationImages?: string[];
  productImages: string[];
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

export interface FirestoreGenerationDocument {
  description: string;
  productImageUrls: string[];
  inspirationImageUrls?: string[];
  status: GenerationStatus;
  generatedImageUrl?: string;
  error?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface ProcessedImage {
  url: string;
  type: "inspiration" | "product";
  index: number;
}

export interface GeminiContent {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}
