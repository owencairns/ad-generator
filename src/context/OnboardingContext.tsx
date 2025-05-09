'use client';

import { createContext, useContext, useState } from 'react';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { OnboardingContextType, OnboardingProviderProps, UserProfile } from '@/types/userTypes';

const OnboardingContext = createContext<OnboardingContextType>({
  step: 1,
  totalSteps: 5,
  userData: {},
  updateUserData: () => {},
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
  submitOnboarding: async () => {},
  loading: false,
  error: null,
});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children, user }: OnboardingProviderProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [userData, setUserData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();

  const updateUserData = (data: Partial<UserProfile>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setStep(step);
    }
  };

  const submitOnboarding = async () => {
    if (!user.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Make sure business data is included correctly
      const businessData = userData.business;
      
      // Create a flat doc update that explicitly sets each field
      // This works more reliably with Firebase than nested objects
      const docData: Record<string, unknown> = {
        onboardingCompleted: true,
        lastUpdated: serverTimestamp(),
      };
      
      // Include personal data
      if (userData.displayName) docData.displayName = userData.displayName;
      if (userData.phoneNumber) docData.phoneNumber = userData.phoneNumber;
      if (userData.bio) docData.bio = userData.bio;
      
      // Include company data - ensure it's explicitly set
      if (userData.company) {
        docData.company = {
          name: userData.company.name || '',
          website: userData.company.website || '',
          industry: userData.company.industry || '',
          size: userData.company.size || '',
          founded: userData.company.founded || '',
          location: userData.company.location || ''
        };
      }
      
      // Include business data - explicitly set each field
      if (businessData) {
        docData.business = {
          products: businessData.products || [],
          targetAudience: businessData.targetAudience || '',
          goals: businessData.goals || [],
          adFrequency: businessData.adFrequency || ''
        };
      }
      
      console.log('Saving onboarding data:', docData);
      
      // Use setDoc with merge instead of updateDoc
      await setDoc(doc(db, 'users', user.uid), docData, { merge: true });
      console.log('Onboarding completed and saved to Firebase for user:', user.uid);
      
      // Redirect to profile page with a parameter indicating we came from onboarding
      setTimeout(() => {
        window.location.href = '/profile?from=onboarding&tab=business';
      }, 500);
    } catch (err) {
      console.error('Error saving onboarding data:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingContext.Provider 
      value={{
        step,
        totalSteps,
        userData,
        updateUserData,
        nextStep,
        prevStep,
        goToStep,
        submitOnboarding,
        loading,
        error
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};