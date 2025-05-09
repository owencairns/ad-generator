'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingFlow from './components/OnboardingFlow';
import { doc, getDoc, getFirestore, setDoc, serverTimestamp } from 'firebase/firestore';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const db = getFirestore();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // If user is logged in, check if they've already completed onboarding
    if (user) {
      const checkOnboarding = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create user document if it doesn't exist
            console.log("Creating user document for:", user.uid);
            await setDoc(userDocRef, {
              email: user.email,
              joinDate: serverTimestamp(),
              onboardingCompleted: false,
              displayName: user.displayName || null,
              profileImageUrl: user.photoURL || null,
            });
          } else if (userDoc.data().onboardingCompleted) {
            // User has already completed onboarding, redirect to home
            router.push('/');
            return;
          }
          
          setPageLoading(false);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          setPageLoading(false);
        }
      };

      checkOnboarding();
    }
  }, [user, loading, router, db]);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Will be redirected by useEffect

  return (
    <OnboardingProvider user={user}>
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <OnboardingFlow />
        </div>
      </div>
    </OnboardingProvider>
  );
}