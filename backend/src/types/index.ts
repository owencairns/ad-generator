export type GenerationStatus = "processing" | "completed" | "error";
export type TemplateType =
  | "product-showcase"
  | "lifestyle"
  | "clothing-showcase"
  | "special-offer";

export interface GenerateRequestBody {
  description: string;
  productDescription: string;
  productName?: string;
  inspirationImages?: string[];
  productImages: string[];
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
  // Template information
  template?: TemplateType;

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

export interface GenerateResponseData {
  message: string;
  data?: {
    imageUrl?: string;
    error?: string;
  };
}

export interface GenerationVersion {
  createdAt: FirebaseFirestore.Timestamp;
  imageUrl?: string;
  editDescription?: string;
  status: GenerationStatus;
  error?: string;
  versionId?: string;
}

export interface FirestoreGenerationDocument {
  description: string;
  productDescription: string;
  productName?: string;
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
  // Template information
  template?: TemplateType;

  // Lifestyle template specific fields
  lifestyleDescription?: string;
  environment?: string;
  timeOfDay?: string;
  activityDescription?: string;
  moodKeywords?: string;

  // Clothing showcase template specific fields
  clothingType?: string;
  shotType?: string;
  viewType?: string;

  // Special offer template specific fields
  offerDescription?: string;
  price?: string;
  discount?: string;
  
  // Version tracking
  versions?: GenerationVersion[];
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
