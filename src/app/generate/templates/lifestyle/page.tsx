'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useGeneration } from '@/app/layout';
import { UploadedImage, GenerationUIStatus } from '@/types/generation';
import { generateAd } from '@/utils/generateAd';
import AdTemplateBase from '@/components/AdTemplateBase';

type Environment = 'indoor' | 'outdoor' | 'both';
type TimeOfDay = 'day' | 'night' | 'any';

export default function LifestyleGenerator() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentGenerationId: setGlobalGenerationId } = useGeneration();
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);

  // Lifestyle-specific states
  const [lifestyleDescription, setLifestyleDescription] = useState('');
  const [environment, setEnvironment] = useState<Environment>('both');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('any');
  const [activityDescription, setActivityDescription] = useState('');
  const [moodKeywords, setMoodKeywords] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to generate ads');
      router.push('/login');
      return;
    }

    if (productImages.length === 0) {
      alert('At least one product image is required');
      return;
    }

    if (!lifestyleDescription.trim()) {
      alert('Please describe the lifestyle context');
      return;
    }

    if (!activityDescription.trim()) {
      alert('Please describe the activity or scene');
      return;
    }

    try {
      // Use the shared utility function
      await generateAd({
        user,
        router,
        productImages,
        productName: productName.trim(),
        description: description.trim(),
        adDescription: `Create a lifestyle advertisement that shows the product in use in a ${environment} environment during ${timeOfDay}.${moodKeywords ? ` The mood should be: ${moodKeywords}.` : ''}`,
        style: "Natural, authentic, lifestyle photography with realistic lighting",
        aspectRatio: "4:5",
        template: 'lifestyle',
        lifestyleDescription: lifestyleDescription.trim(),
        environment,
        timeOfDay,
        activityDescription: activityDescription.trim(),
        moodKeywords: moodKeywords.trim(),
        textInfo: {
          mainText: "",
          secondaryText: "",
          position: "auto",
          styleNotes: ""
        },
        setIsGenerating,
        setGenerationStatus,
        setGlobalGenerationId
      });
    } catch (error) {
      console.error('Error starting generation:', error);
      alert('Failed to start generation. Please try again.');
    }
  };

  const validateForm = () => {
    return productImages.length > 0 && 
           lifestyleDescription.trim() !== '' && 
           activityDescription.trim() !== '';
  };

  // Template-specific fields component
  const LifestyleFields = (
    <div className="bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
      <div className="bg-base-200 border-b border-base-300 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">Lifestyle Context</h2>
              <p className="text-base-content/70 mt-1">Define the lifestyle and environment for your ad</p>
            </div>
          </div>
          <div className="bg-primary text-base-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">2</div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Lifestyle Description */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-2">Lifestyle Description</h3>
          <textarea
            value={lifestyleDescription}
            onChange={(e) => setLifestyleDescription(e.target.value)}
            className="textarea w-full min-h-[120px] text-base bg-base-200 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-base-content/40 resize-none p-6"
            placeholder="Describe the lifestyle you want to portray (e.g., 'Active and health-conscious young professionals who value sustainable products' or 'Adventurous outdoor enthusiasts who enjoy hiking and camping')"
          />
          <label className="label px-1 mt-2">
            <span className="text-sm text-base-content/60">Paint a picture of your target audience&apos;s lifestyle</span>
          </label>
        </div>

        {/* Activity Description */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-2">Activity or Scene</h3>
          <textarea
            value={activityDescription}
            onChange={(e) => setActivityDescription(e.target.value)}
            className="textarea w-full min-h-[120px] text-base bg-base-200 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-base-content/40 resize-none p-6"
            placeholder="Describe the specific activity or scene where your product is being used (e.g., 'A group of friends enjoying a picnic in a sunny park' or 'A person working out in a modern home gym')"
          />
          <label className="label px-1 mt-2">
            <span className="text-sm text-base-content/60">Be specific about the action and context</span>
          </label>
        </div>

        {/* Environment Selection */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-4">Environment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative">
              <input
                type="radio"
                name="environment"
                className="peer sr-only"
                checked={environment === 'indoor'}
                onChange={() => setEnvironment('indoor')}
              />
              <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                <div className="font-medium mb-1">Indoor</div>
                <p className="text-sm text-base-content/70">Home, office, gym, etc.</p>
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                name="environment"
                className="peer sr-only"
                checked={environment === 'outdoor'}
                onChange={() => setEnvironment('outdoor')}
              />
              <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                <div className="font-medium mb-1">Outdoor</div>
                <p className="text-sm text-base-content/70">Nature, urban, beach, etc.</p>
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                name="environment"
                className="peer sr-only"
                checked={environment === 'both'}
                onChange={() => setEnvironment('both')}
              />
              <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                <div className="font-medium mb-1">Both</div>
                <p className="text-sm text-base-content/70">Mix of indoor and outdoor</p>
              </div>
            </label>
          </div>
        </div>

        {/* Time of Day */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-4">Time of Day</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative">
              <input
                type="radio"
                name="timeOfDay"
                className="peer sr-only"
                checked={timeOfDay === 'day'}
                onChange={() => setTimeOfDay('day')}
              />
              <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                <div className="font-medium mb-1">Daytime</div>
                <p className="text-sm text-base-content/70">Bright, natural lighting</p>
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                name="timeOfDay"
                className="peer sr-only"
                checked={timeOfDay === 'night'}
                onChange={() => setTimeOfDay('night')}
              />
              <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                <div className="font-medium mb-1">Nighttime</div>
                <p className="text-sm text-base-content/70">Evening or night setting</p>
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                name="timeOfDay"
                className="peer sr-only"
                checked={timeOfDay === 'any'}
                onChange={() => setTimeOfDay('any')}
              />
              <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                <div className="font-medium mb-1">Any Time</div>
                <p className="text-sm text-base-content/70">No specific preference</p>
              </div>
            </label>
          </div>
        </div>

        {/* Mood Keywords */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-2">Mood Keywords</h3>
          <input
            type="text"
            value={moodKeywords}
            onChange={(e) => setMoodKeywords(e.target.value)}
            className="input w-full bg-base-200 rounded-2xl border-base-300"
            placeholder="Enter mood keywords (e.g., energetic, peaceful, luxurious, fun)"
          />
          <label className="label px-1 mt-2">
            <span className="text-sm text-base-content/60">Separate keywords with commas</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <AdTemplateBase
      title="Lifestyle Ad"
      subtitle="Create a lifestyle-focused advertisement for your product"
      templateSpecificFields={LifestyleFields}
      onSubmit={handleSubmit}
      productImages={productImages}
      setProductImages={setProductImages}
      productName={productName}
      setProductName={setProductName}
      description={description}
      setDescription={setDescription}
      isGenerating={isGenerating}
      generationStatus={generationStatus}
      validationCheck={validateForm}
    />
  );
} 