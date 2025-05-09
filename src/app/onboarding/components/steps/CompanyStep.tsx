'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { useState, useEffect } from 'react';

// Industry options
const INDUSTRIES = [
  'E-commerce',
  'Retail',
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Food & Beverage',
  'Manufacturing',
  'Real Estate',
  'Travel',
  'Entertainment',
  'Marketing',
  'Consulting',
  'Non-profit',
  'Other'
];

// Company size options
const COMPANY_SIZES = [
  'Solo',
  'Small (2-10 employees)',
  'Medium (11-50 employees)',
  'Large (51-200 employees)',
  'Enterprise (201+ employees)'
];

export default function CompanyStep() {
  const { nextStep, prevStep, userData, updateUserData } = useOnboarding();
  
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [founded, setFounded] = useState('');
  const [location, setLocation] = useState('');

  // Initialize form with existing company data if available
  useEffect(() => {
    if (userData.company) {
      setCompanyName(userData.company.name || '');
      setWebsite(userData.company.website || '');
      setIndustry(userData.company.industry || '');
      setSize(userData.company.size || '');
      setFounded(userData.company.founded || '');
      setLocation(userData.company.location || '');
    }
  }, [userData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the userData with company information
    updateUserData({
      company: {
        name: companyName,
        website,
        industry,
        size,
        founded,
        location
      }
    });
    
    // Navigate to the next step (BusinessInfoStep)
    nextStep();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-base-content">Your Company Information</h2>
        <p className="text-base-content/70 mt-2">
          Tell us about your business so we can tailor our service to your needs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Company Name</span>
            </label>
            <input 
              type="text" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company name"
              className="input input-bordered w-full focus:input-primary transition-all duration-200" 
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Website</span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <input 
              type="url" 
              value={website} 
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://your-company.com"
              className="input input-bordered w-full focus:input-primary transition-all duration-200" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Industry</span>
            </label>
            <select 
              value={industry} 
              onChange={(e) => setIndustry(e.target.value)}
              className="select select-bordered w-full focus:select-primary transition-all duration-200"
              required
            >
              <option value="" disabled>Select an industry</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Company Size</span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <select 
              value={size} 
              onChange={(e) => setSize(e.target.value)}
              className="select select-bordered w-full focus:select-primary transition-all duration-200"
            >
              <option value="" disabled>Select company size</option>
              {COMPANY_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Year Founded</span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <input 
              type="text" 
              value={founded} 
              onChange={(e) => setFounded(e.target.value)}
              placeholder="e.g. 2020"
              className="input input-bordered w-full focus:input-primary transition-all duration-200" 
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Location</span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <input 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="input input-bordered w-full focus:input-primary transition-all duration-200" 
            />
          </div>
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