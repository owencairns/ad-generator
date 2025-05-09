'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/config/firebase';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsOnboarding: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  needsOnboarding: false,
  signInWithGoogle: async () => { },
  signInWithEmail: async () => { },
  registerWithEmail: async () => { },
  logout: async () => { },
  authError: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Set cookie for middleware
        document.cookie = `user=${user.uid}; path=/`;
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          try {
            await setDoc(userDocRef, {
              email: user.email,
              joinDate: serverTimestamp(),
              onboardingCompleted: false, // New users need to complete onboarding
              displayName: user.displayName || null,
              profileImageUrl: user.photoURL || null,
            });
            console.log("User document created for:", user.uid);
            setNeedsOnboarding(true);
          } catch (error) {
            console.error("Error creating user document:", error);
          }
        } else {
          // Check if user needs to complete onboarding
          const userData = docSnap.data();
          // Make sure we explicitly check for false, not just falsy values
          setNeedsOnboarding(userData.onboardingCompleted === false);
          console.log('Onboarding status:', userData.onboardingCompleted === false ? 'needs onboarding' : 'onboarding completed');
        }
      } else {
        setUser(null);
        setNeedsOnboarding(false);
        // Remove cookie when user logs out
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleAuthError = (error: unknown): string => {
    if (error instanceof FirebaseError) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setAuthError(handleAuthError(error));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      setAuthError(handleAuthError(error));
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error registering with email:', error);
      setAuthError(handleAuthError(error));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      needsOnboarding, 
      signInWithGoogle, 
      signInWithEmail,
      registerWithEmail,
      logout,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 