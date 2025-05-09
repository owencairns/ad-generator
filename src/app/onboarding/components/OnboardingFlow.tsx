'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import WelcomeStep from './steps/WelcomeStep';
import PersonalInfoStep from './steps/PersonalInfoStep';
import CompanyStep from './steps/CompanyStep';
import BusinessInfoStep from './steps/BusinessInfoStep';
import CompletionStep from './steps/CompletionStep';

export default function OnboardingFlow() {
  const { step, totalSteps, error } = useOnboarding();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <PersonalInfoStep />;
      case 3:
        return <CompanyStep />;
      case 4:
        return <BusinessInfoStep />;
      case 5: // This case handles completion
        return <CompletionStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden transition-all duration-300 animate-fadeIn">
      {/* Progress Bar */}
      <div className="w-full bg-base-200">
        <div
          className="h-1 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 pt-6 pb-4 border-b border-base-200">
        <div className="flex justify-between">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300
                  ${idx + 1 < step ? 'bg-primary text-primary-content' : 
                    idx + 1 === step ? 'bg-primary/20 text-primary border-2 border-primary' : 
                    'bg-base-200 text-base-content/50'}
                `}
              >
                {idx + 1}
              </div>
              <span className="text-xs mt-1 text-base-content/70">
                {idx === 0 ? 'Welcome' : 
                 idx === 1 ? 'Personal' : 
                 idx === 2 ? 'Company' : 
                 idx === 3 ? 'Business' :
                 'Complete'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error/10 border-l-4 border-error mx-6 mt-4 rounded">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Current Step Content */}
      <div className="p-6">
        {renderStep()}
      </div>
    </div>
  );
}