'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGeneration } from '@/app/layout';
import {
  UploadedImage,
  GenerationUIStatus,
} from '@/types/generation';
import { STYLE_PRESETS } from '../constants/styles';
import { generateAd } from '@/utils/generateAd';

import ProductSection from '../components/ProductSection';
import StyleSection from '../components/StyleSection';
import AspectRatioSection from '../components/AspectRatioSection';
import TextSection from '../components/TextSection';
import InspirationSection from '../components/InspirationSection';

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setCurrentGenerationId: setGlobalGenerationId } = useGeneration();
  const [inspirationImages, setInspirationImages] = useState<UploadedImage[]>([]);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [description, setDescription] = useState('');
  const [productName, setProductName] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('photo-realistic');
  const [customStyle, setCustomStyle] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');
  const [mainText, setMainText] = useState('');
  const [secondaryText, setSecondaryText] = useState('');
  const [textPosition, setTextPosition] = useState('');
  const [textStyleNotes, setTextStyleNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);

  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + inspirationImages.length > 2) {
      alert('You can only upload up to 2 inspiration images');
      return;
    }

    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setInspirationImages([...inspirationImages, ...newImages]);
  };

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

  const removeInspirationImage = (index: number) => {
    const newImages = [...inspirationImages];
    URL.revokeObjectURL(newImages[index].url);
    newImages.splice(index, 1);
    setInspirationImages(newImages);
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

    if (!adDescription.trim()) {
      alert('Please provide a description for your ad');
      return;
    }

    try {
      // Use the shared utility function to generate the ad
      await generateAd({
        user,
        router,
        productImages,
        inspirationImages,
        productName,
        description,
        adDescription,
        style: selectedStyle === 'custom' ? customStyle : STYLE_PRESETS[selectedStyle]?.description || selectedStyle,
        aspectRatio: selectedAspectRatio,
        textInfo: {
          mainText: mainText.trim(),
          secondaryText: secondaryText.trim(),
          position: textPosition,
          styleNotes: textStyleNotes.trim()
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

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading ad generator...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-base-300">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12">
          {/* Page Header */}
          <div className="flex flex-col items-center text-center relative">
            {/* Back Button */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <Link
                href="/generate/select"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-base-200 hover:bg-base-300 text-base-content transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">Create Your Ad</h1>
              <p className="text-lg text-base-content/70">Transform your product into a stunning advertisement using our AI-powered generator</p>
            </div>
          </div>

          {/* Only show error status */}
          {generationStatus?.status === 'error' && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{generationStatus.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-7xl mx-auto">
            <div className="grid gap-8">
              {/* Product Area */}
              <div className="space-y-8">
                <ProductSection
                  productImages={productImages}
                  description={description}
                  setDescription={setDescription}
                  handleProductUpload={handleProductUpload}
                  removeProductImage={removeProductImage}
                  productInputRef={productInputRef as React.RefObject<HTMLInputElement>}
                  productName={productName}
                  setProductName={setProductName}
                />
              </div>

              {/* Style Area */}
              <div className="space-y-8">
                <div className="bg-base-200 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
                  <div className="bg-base-100 border-b border-base-300 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-base-content mb-2">Style Settings</h2>
                    <p className="text-base-content/70">Define how your ad will look</p>
                  </div>
                  <div className="p-6 md:p-8 space-y-8">
                    <StyleSection
                      selectedStyle={selectedStyle}
                      setSelectedStyle={setSelectedStyle}
                      customStyle={customStyle}
                      setCustomStyle={setCustomStyle}
                    />

                    {/* Ad Description */}
                    <div className="form-control">
                      <label className="label px-1">
                        <span className="text-lg font-semibold text-base-content">Ad Description</span>
                      </label>
                      <textarea
                        value={adDescription}
                        onChange={(e) => setAdDescription(e.target.value)}
                        className="textarea w-full min-h-[160px] text-base bg-base-200 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-base-content/40 resize-none p-6"
                        placeholder="Describe how you want your ad to look. What should be the focus? How should the product be presented? What mood or atmosphere do you want to create? E.g., 'Show the product in an outdoor setting with natural lighting, positioned at an angle to highlight its design. Create a bright, energetic mood with emphasis on the product&apos;s premium features.'"
                      />
                      <label className="label px-1 mt-2">
                        <span className="text-sm text-base-content/60">Be specific about the composition, lighting, mood, and what elements should be emphasized</span>
                        <span className="text-sm text-base-content/60">{adDescription.length} characters</span>
                      </label>
                    </div>

                    <TextSection
                      mainText={mainText}
                      setMainText={setMainText}
                      secondaryText={secondaryText}
                      setSecondaryText={setSecondaryText}
                      textPosition={textPosition}
                      setTextPosition={setTextPosition}
                      textStyleNotes={textStyleNotes}
                      setTextStyleNotes={setTextStyleNotes}
                    />

                    <AspectRatioSection
                      selectedAspectRatio={selectedAspectRatio}
                      setSelectedAspectRatio={setSelectedAspectRatio}
                    />

                    <InspirationSection
                      inspirationImages={inspirationImages}
                      handleInspirationUpload={handleInspirationUpload}
                      removeInspirationImage={removeInspirationImage}
                      inspirationInputRef={inspirationInputRef as React.RefObject<HTMLInputElement>}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="submit"
                className={`btn rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform gap-2 min-w-[200px] ${
                  productImages.length === 0 || !adDescription.trim() || isGenerating
                    ? 'btn-disabled bg-base-300'
                    : 'btn-primary'
                }`}
                disabled={productImages.length === 0 || !adDescription.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Ad
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
    </div>
  );
} 