'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function WelcomeStep() {
  const { nextStep } = useOnboarding();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center text-center space-y-6">
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
        Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!
      </h1>
      
      <p className="text-lg text-base-content/70 max-w-lg">
        We&apos;re excited to have you join our platform. Let&apos;s take a few moments to set up your profile 
        and get to know a bit about you and your business.
      </p>

      <div className="bg-base-200/50 p-4 rounded-lg max-w-lg">
        <h3 className="font-medium mb-2">What&apos;s next?</h3>
        <ul className="text-sm text-left space-y-2">
          <li className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center bg-primary/20 text-primary w-5 h-5 rounded-full text-xs mt-0.5">1</span>
            <span>Basic profile information (all optional)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center bg-primary/20 text-primary w-5 h-5 rounded-full text-xs mt-0.5">2</span>
            <span>Company details to personalize your experience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center bg-primary/20 text-primary w-5 h-5 rounded-full text-xs mt-0.5">3</span>
            <span>Business needs to help us customize our service for you</span>
          </li>
        </ul>
      </div>

      <div className="pt-6">
        <button 
          onClick={nextStep}
          className="btn btn-primary btn-lg rounded-full px-10 normal-case text-base font-medium hover:scale-105 transition-transform"
        >
          Let&apos;s Get Started
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}