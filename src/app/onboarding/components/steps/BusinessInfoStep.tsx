'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { useState, useEffect } from 'react';

// Marketing goals options
const GOALS = [
  'Increase brand awareness',
  'Generate leads/customers',
  'Promote new products/services',
  'Engage with existing customers',
  'Drive website traffic',
  'Boost sales conversion',
  'Increase social media presence',
  'Improve customer retention',
  'Enter new markets',
  'Enhance brand image'
];

// Ad frequency options
const AD_FREQUENCIES = [
  'Daily',
  'Weekly',
  'Bi-weekly',
  'Monthly',
  'Quarterly',
  'Occasionally as needed'
];

export default function BusinessInfoStep() {
  const { nextStep, prevStep, userData, updateUserData, loading } = useOnboarding();
  
  const [products, setProducts] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [adFrequency, setAdFrequency] = useState('');

  // Initialize form with existing business data if available
  useEffect(() => {
    if (userData.business) {
      setProducts(userData.business.products?.join(', ') || '');
      setTargetAudience(userData.business.targetAudience || '');
      setSelectedGoals(userData.business.goals || []);
      setAdFrequency(userData.business.adFrequency || '');
    }
  }, [userData]);

  const handleGoalToggle = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for required fields
    if (!products.trim()) {
      alert("Please enter at least one product or service");
      return;
    }

    if (!targetAudience.trim()) {
      alert("Please describe your target audience");
      return;
    }

    if (selectedGoals.length === 0) {
      alert("Please select at least one marketing goal");
      return;
    }

    if (!adFrequency) {
      alert("Please select your ad creation frequency");
      return;
    }
    
    // Create the business data object
    const businessData = {
      products: products.split(',').map(p => p.trim()).filter(p => p),
      targetAudience,
      goals: selectedGoals,
      adFrequency
    };
    
    // First update the user data
    updateUserData({
      business: businessData
    });
    
    // Navigate to the completion step instead of submitting directly
    nextStep();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">Your Business Needs</h2>
        <p className="text-base-content/70 mt-2">
          Help us understand your advertising goals and requirements
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Products or Services</span>
          </label>
          <textarea 
            value={products} 
            onChange={(e) => setProducts(e.target.value)}
            placeholder="What products or services do you offer? (separate with commas)"
            className="textarea textarea-bordered w-full h-20 focus:textarea-primary transition-all duration-200" 
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Target Audience</span>
          </label>
          <textarea 
            value={targetAudience} 
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Describe your ideal customer or target audience"
            className="textarea textarea-bordered w-full h-20 focus:textarea-primary transition-all duration-200" 
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Marketing Goals</span>
            <span className="label-text-alt text-base-content/50">Select all that apply</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
            {GOALS.map(goal => (
              <div key={goal} className="form-control">
                <label className="cursor-pointer label justify-start gap-2 hover:bg-base-200/50 rounded-lg px-2">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary checkbox-sm" 
                    checked={selectedGoals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                  />
                  <span className="label-text">{goal}</span> 
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Ad Creation Frequency</span>
          </label>
          <select 
            value={adFrequency} 
            onChange={(e) => setAdFrequency(e.target.value)}
            className="select select-bordered w-full focus:select-primary transition-all duration-200"
            required
          >
            <option value="" disabled>How often do you create ads?</option>
            {AD_FREQUENCIES.map(freq => (
              <option key={freq} value={freq}>{freq}</option>
            ))}
          </select>
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
            disabled={loading}
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
      </form>
    </div>
  );
}