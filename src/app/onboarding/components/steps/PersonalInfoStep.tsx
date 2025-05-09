'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function PersonalInfoStep() {
  const { nextStep, prevStep, userData, updateUserData } = useOnboarding();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Initialize form with existing user data if available
  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
    if (user?.phoneNumber) {
      setPhone(user.phoneNumber);
    }
    if (userData.bio) {
      setBio(userData.bio);
    }
  }, [user, userData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateUserData({
      displayName: name || user?.displayName || undefined,
      phoneNumber: phone,
      bio: bio
    });
    
    nextStep();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">Tell us about yourself</h2>
        <p className="text-base-content/70 mt-2">
          All fields are optional, but help us personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Full Name</span>
            <span className="label-text-alt text-base-content/50">Optional</span>
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input input-bordered w-full focus:input-primary transition-all duration-200" 
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Phone Number</span>
            <span className="label-text-alt text-base-content/50">Optional</span>
          </label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            className="input input-bordered w-full focus:input-primary transition-all duration-200" 
          />
        </div>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Short Bio</span>
            <span className="label-text-alt text-base-content/50">Optional</span>
          </label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself..."
            className="textarea textarea-bordered w-full h-32 focus:textarea-primary transition-all duration-200" 
          />
        </div>

        <div className="pt-4 flex justify-between">
          <button 
            type="button"
            onClick={prevStep}
            className="btn btn-outline rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>

          <button 
            type="submit"
            className="btn btn-primary rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform"
          >
            Continue
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}