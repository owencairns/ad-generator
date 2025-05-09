'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

export default function CompletionStep() {
  const { userData, submitOnboarding, loading, error } = useOnboarding();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  // Automatically check if company and business data exists, and ensure all required fields are present
  const isDataComplete = userData.company?.name && 
                        userData.company?.industry && 
                        userData.business?.products && 
                        userData.business.products.length > 0 && 
                        userData.business?.targetAudience;

  const handleSubmit = useCallback(async () => {
    console.log('Complete Setup button clicked');
    setSubmitted(true);
    try {
      await submitOnboarding();
      console.log('Onboarding submitted successfully');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      // Reset submitted state if there's an error
      setSubmitted(false);
    }
  }, [submitOnboarding]);

  // Auto-submit when the component loads if data is ready
  useEffect(() => {
    // Only auto-submit if this is the first time loading and all data is complete
    if (isDataComplete && !submitted && !loading && !error) {
      console.log('Auto-submitting onboarding with complete data');
      handleSubmit();
    }
  }, [isDataComplete, submitted, loading, error, handleSubmit]);

  // Monitor for changes in the loading and error state
  useEffect(() => {
    if (error) {
      console.log('Error detected in onboarding submission:', error);
      // Reset submitted state if there's an error
      setSubmitted(false);
    }
  }, [error, loading]);

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {!submitted ? (
        <>
          <div className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-primary/20 mb-4">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'Profile'}
                width={96}
                height={96}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 
                 user?.email ? user.email.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-base-content">
            You&apos;re All Set!
          </h1>
          
          <p className="text-lg text-base-content/70 max-w-lg">
            Thank you for completing your profile. We&apos;ll use this information to 
            customize your experience and provide more relevant ad suggestions.
          </p>

          <div className="bg-base-200/50 p-6 rounded-lg max-w-lg w-full">
            <h3 className="font-medium mb-4 text-lg">Your Profile Summary</h3>
            
            <div className="space-y-4 text-left">
              <div>
                <h4 className="font-medium text-sm text-base-content/70">Personal Information</h4>
                <p className="text-base-content">{userData.displayName || user?.displayName || user?.email}</p>
              </div>
              
              {userData.company?.name && (
                <div>
                  <h4 className="font-medium text-sm text-base-content/70">Company</h4>
                  <p className="text-base-content">{userData.company.name}</p>
                  {userData.company.industry && (
                    <p className="text-sm text-base-content/70">{userData.company.industry}</p>
                  )}
                </div>
              )}
              
              {userData.business?.products && userData.business.products.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-base-content/70">Products/Services</h4>
                  <p className="text-base-content">{userData.business.products.join(', ')}</p>
                </div>
              )}
              
              {userData.business?.goals && userData.business.goals.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-base-content/70">Top Marketing Goals</h4>
                  <ul className="text-base-content">
                    {userData.business.goals.slice(0, 3).map(goal => (
                      <li key={goal} className="text-sm">• {goal}</li>
                    ))}
                    {userData.business.goals.length > 3 && (
                      <li className="text-sm text-base-content/70">...and {userData.business.goals.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className={`btn btn-primary btn-lg rounded-full px-10 normal-case text-base font-medium hover:scale-105 transition-transform ${loading ? 'opacity-70' : ''}`}
              type="button" 
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center p-10">
          {error ? (
            <>
              <div className="w-24 h-24 rounded-full bg-error/20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-error">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-error mb-2">Something Went Wrong</h2>
              <p className="text-base-content/70">{error}</p>
              <button 
                onClick={handleSubmit}
                className="btn btn-error mt-6 rounded-full px-8"
                type="button"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-success">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-success mb-2">Profile Saved Successfully!</h2>
              <p className="text-base-content/70">Redirecting you to the dashboard...</p>
              <span className="loading loading-dots loading-md text-primary mt-4"></span>
            </>
          )}
        </div>
      )}
    </div>
  );
}