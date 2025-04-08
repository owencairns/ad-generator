'use client';

import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UploadedImage, GenerationUIStatus } from '@/types/generation';
import GenerationLoadingState from '../../components/GenerationLoadingState';
import ProductSection from '../../components/ProductSection';

type Environment = 'indoor' | 'outdoor' | 'both';
type TimeOfDay = 'day' | 'night' | 'any';

export default function LifestyleGenerator() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  // Lifestyle-specific states
  const [lifestyleDescription, setLifestyleDescription] = useState('');
  const [environment, setEnvironment] = useState<Environment>('both');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('any');
  const [activityDescription, setActivityDescription] = useState('');
  const [moodKeywords, setMoodKeywords] = useState('');

  const productInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (isGenerating && user && currentGenerationId) {
      const unsubscribe = onSnapshot(
        doc(db, 'generations', user.uid, 'items', currentGenerationId),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            
            if (data.status === 'completed') {
              router.push(`/generate/${currentGenerationId}`);
              setIsGenerating(false);
            } else if (data.status === 'error') {
              setGenerationStatus({
                status: data.status,
                error: data.error
              });
              setIsGenerating(false);
            }
          }
        }
      );

      return () => unsubscribe();
    }
  }, [isGenerating, user, currentGenerationId, router]);

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + productImages.length > 2) {
      alert('You can only upload up to 2 product images');
      return;
    }

    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setProductImages([...productImages, ...newImages]);
  };

  const removeProductImage = (index: number) => {
    const newImages = [...productImages];
    URL.revokeObjectURL(newImages[index].url);
    newImages.splice(index, 1);
    setProductImages(newImages);
  };

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

    const newGenerationId = Date.now().toString();

    try {
      setIsGenerating(true);
      setGenerationStatus(null);
      setCurrentGenerationId(newGenerationId);

      // Convert images to base64
      const productImagesBase64 = await Promise.all(
        productImages.map(async (img) => {
          const buffer = await img.file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return `data:${img.file.type};base64,${base64}`;
        })
      );

      const requestData = {
        productImages: productImagesBase64,
        productName: productName.trim(),
        description: description.trim(),
        userId: user.uid,
        generationId: newGenerationId,
        template: 'lifestyle',
        lifestyleDescription: lifestyleDescription.trim(),
        environment,
        timeOfDay,
        activityDescription: activityDescription.trim(),
        moodKeywords: moodKeywords.trim(),
      };

      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.data?.error || 'Failed to start generation');
      }

      console.log('Generation started successfully');
    } catch (error) {
      console.error('Error starting generation:', error);
      setIsGenerating(false);
      setCurrentGenerationId(null);
      setGenerationStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      alert('Failed to start generation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading lifestyle ad generator...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-base-100">
      {isGenerating ? (
        <GenerationLoadingState />
      ) : (
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col gap-12">
            {/* Page Header */}
            <div className="flex flex-col items-center text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">Lifestyle Ad</h1>
                <p className="text-lg text-base-content/70">Create an engaging lifestyle advertisement featuring your product</p>
              </div>
            </div>

            {/* Error Display */}
            {generationStatus?.status === 'error' && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{generationStatus.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
              <div className="space-y-8">
                <ProductSection
                  productImages={productImages}
                  description={description}
                  setDescription={setDescription}
                  handleProductUpload={handleProductUpload}
                  removeProductImage={removeProductImage}
                  productInputRef={productInputRef}
                  productName={productName}
                  setProductName={setProductName}
                />

                {/* Lifestyle Details */}
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
              </div>

              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="submit"
                  className={`btn rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform gap-2 min-w-[200px] ${
                    productImages.length === 0 || !lifestyleDescription.trim() || !activityDescription.trim() || isGenerating
                      ? 'btn-disabled bg-base-300'
                      : 'btn-primary'
                  }`}
                  disabled={productImages.length === 0 || !lifestyleDescription.trim() || !activityDescription.trim() || isGenerating}
                >
                  {isGenerating ? (
                    'Generating...'
                  ) : (
                    <>
                      Generate Lifestyle Ad
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 