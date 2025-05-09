export type TemplateType = "product-showcase" | "lifestyle" | "clothing-showcase" | "special-offer";

export interface AdState {
  platform: string;
  objective: string;
  targetAudience: string;
  tone: string;
  productDescription: string;
  keyFeatures: string[];
  callToAction: string;
  budget?: string;
  imageStyle?: string;
  summary?: string;
  template?: TemplateType;
}

export interface ChatMessage {
  content: string;
  isUser: boolean;
}
