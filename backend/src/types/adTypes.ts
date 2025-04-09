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
}

export interface ChatMessage {
  content: string;
  isUser: boolean;
}

export interface BrainstormState {
  messages: ChatMessage[];
  adState: Partial<AdState>;
  isComplete: boolean;
}
