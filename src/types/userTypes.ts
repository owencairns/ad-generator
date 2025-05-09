import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  // Basic information
  email: string | null;
  joinDate: Timestamp;
  theme?: string;
  
  // Onboarding status
  onboardingCompleted: boolean;
  
  // Personal Information (optional)
  displayName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  bio?: string;
  
  // Company Information
  company?: {
    name?: string;
    website?: string;
    industry?: string;
    size?: string; // Small, Medium, Large
    founded?: string; // Year
    location?: string;
  };
  
  // Business Information
  business?: {
    products?: string[]; // What products/services they sell
    targetAudience?: string;
    goals?: string[];  // Marketing goals
    adFrequency?: string; // How often they create ads
  };
  
  // Preferences
  preferences?: {
    preferredAdStyle?: string;
    preferredTemplates?: string[];
    notificationSettings?: {
      email: boolean;
      browser: boolean;
    };
  };
}

export interface OnboardingContextType {
  step: number;
  totalSteps: number;
  userData: Partial<UserProfile>;
  updateUserData: (data: Partial<UserProfile>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  submitOnboarding: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface OnboardingProviderProps {
  children: React.ReactNode;
  user: User;
}