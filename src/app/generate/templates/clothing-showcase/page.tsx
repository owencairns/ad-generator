'use client';

import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UploadedImage, GenerationUIStatus } from '@/types/generation';
import GenerationLoadingState from '../../components/GenerationLoadingState';
import ProductSection from '../../components/ProductSection';

type ShotType = 'closeup' | 'full-body';
type ViewType = 'single' | 'multiple';

export default function ClothingShowcaseGenerator() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  // Clothing-specific states
  const [clothingType, setClothingType] = useState('');
  const [shotType, setShotType] = useState<ShotType>('full-body');
  const [viewType, setViewType] = useState<ViewType>('single');

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

    if (!clothingType.trim()) {
      alert('Please describe the type of clothing');
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
        template: 'clothing-showcase',
        clothingType: clothingType.trim(),
        shotType,
        viewType,
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
          <p className="text-base-content/70">Loading clothing showcase generator...</p>
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
                <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">Clothing Showcase</h1>
                <p className="text-lg text-base-content/70">Create a professional showcase of your clothing item</p>
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

                {/* Clothing Specific Options */}
                <div className="bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
                  <div className="bg-base-200 border-b border-base-300 p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-3 rounded-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-base-content">Clothing Details</h2>
                          <p className="text-base-content/70 mt-1">Specify how you want your clothing item to be showcased</p>
                        </div>
                      </div>
                      <div className="bg-primary text-base-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">2</div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-8">
                    {/* Clothing Type */}
                    <div>
                      <h3 className="text-lg font-semibold text-base-content mb-2">Clothing Type</h3>
                      <textarea
                        value={clothingType}
                        onChange={(e) => setClothingType(e.target.value)}
                        className="textarea w-full min-h-[120px] text-base bg-base-200 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-base-content/40 resize-none p-6"
                        placeholder="Describe the type of clothing (e.g., 'A casual cotton t-shirt with a crew neck and short sleeves' or 'High-waisted slim-fit jeans with distressed details')"
                      />
                      <label className="label px-1 mt-2">
                        <span className="text-sm text-base-content/60">Be specific about the style, fit, and key features</span>
                      </label>
                    </div>

                    {/* Shot Type */}
                    <div>
                      <h3 className="text-lg font-semibold text-base-content mb-4">Shot Type</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="relative">
                          <input
                            type="radio"
                            name="shotType"
                            className="peer sr-only"
                            checked={shotType === 'closeup'}
                            onChange={() => setShotType('closeup')}
                          />
                          <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                            <div className="font-medium mb-1">Closeup Shot</div>
                            <p className="text-sm text-base-content/70">Focus on specific details and features of the clothing item</p>
                          </div>
                        </label>
                        <label className="relative">
                          <input
                            type="radio"
                            name="shotType"
                            className="peer sr-only"
                            checked={shotType === 'full-body'}
                            onChange={() => setShotType('full-body')}
                          />
                          <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                            <div className="font-medium mb-1">Full Body Shot</div>
                            <p className="text-sm text-base-content/70">Show how the clothing looks on a complete outfit</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* View Type */}
                    <div>
                      <h3 className="text-lg font-semibold text-base-content mb-4">Views Needed</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="relative">
                          <input
                            type="radio"
                            name="viewType"
                            className="peer sr-only"
                            checked={viewType === 'single'}
                            onChange={() => setViewType('single')}
                          />
                          <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                            <div className="font-medium mb-1">Single View</div>
                            <p className="text-sm text-base-content/70">One perspective is sufficient</p>
                          </div>
                        </label>
                        <label className="relative">
                          <input
                            type="radio"
                            name="viewType"
                            className="peer sr-only"
                            checked={viewType === 'multiple'}
                            onChange={() => setViewType('multiple')}
                          />
                          <div className="p-4 rounded-2xl bg-base-200 border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-colors duration-200 cursor-pointer">
                            <div className="font-medium mb-1">Multiple Views</div>
                            <p className="text-sm text-base-content/70">Show front and back views</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="submit"
                  className={`btn rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform gap-2 min-w-[200px] ${
                    productImages.length === 0 || !clothingType.trim() || isGenerating
                      ? 'btn-disabled bg-base-300'
                      : 'btn-primary'
                  }`}
                  disabled={productImages.length === 0 || !clothingType.trim() || isGenerating}
                >
                  {isGenerating ? (
                    'Generating...'
                  ) : (
                    <>
                      Generate Showcase
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