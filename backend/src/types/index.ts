export type GenerationStatus = "processing" | "completed" | "error";

export interface GenerateRequestBody {
  description: string;
  productDescription: string;
  inspirationImages?: string[];
  productImages: string[];
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

export interface GenerateResponseData {
  message: string;
  data?: {
    imageUrl?: string;
    error?: string;
  };
}

export interface FirestoreGenerationDocument {
  description: string;
  productDescription: string;
  productImageUrls: string[];
  inspirationImageUrls?: string[];
  status: GenerationStatus;
  generatedImageUrl?: string;
  error?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  style?: string;
  aspectRatio?: string;
  textInfo?: {
    mainText: string;
    secondaryText: string;
    position: string;
    styleNotes: string;
  };
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
