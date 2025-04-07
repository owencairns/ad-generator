'use client';

import React, { useState, useRef, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  UploadedImage,
  GenerationUIStatus,
  GenerateApiRequest,
  GenerateApiResponse,
  GenerationDocument
} from '@/types/generation';
import { STYLE_PRESETS } from './constants/styles';

import ProductSection from './components/ProductSection';
import StyleSection from './components/StyleSection';
import AspectRatioSection from './components/AspectRatioSection';
import TextSection from './components/TextSection';
import InspirationSection from './components/InspirationSection';
import GenerationLoadingState from './components/GenerationLoadingState';

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [inspirationImages, setInspirationImages] = useState<UploadedImage[]>([]);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [description, setDescription] = useState('');
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
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (isGenerating && user && currentGenerationId) {
      // Subscribe to Firestore updates for the specific generation
      const unsubscribe = onSnapshot(
        doc(db, 'generations', user.uid, 'items', currentGenerationId),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as GenerationDocument;
            
            if (data.status === 'completed') {
              // Immediately redirect to the generation detail page
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

    // Generate a new generation ID using timestamp
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

      const inspirationImagesBase64 = await Promise.all(
        inspirationImages.map(async (img) => {
          const buffer = await img.file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return `data:${img.file.type};base64,${base64}`;
        })
      );

      const requestData: GenerateApiRequest = {
        description: adDescription.trim(),
        productDescription: description.trim(),
        productImages: productImagesBase64,
        inspirationImages: inspirationImagesBase64.length > 0 ? inspirationImagesBase64 : [],
        userId: user.uid,
        generationId: newGenerationId,
        style: selectedStyle === 'custom' ? customStyle : STYLE_PRESETS[selectedStyle]?.description || selectedStyle,
        aspectRatio: selectedAspectRatio,
        textInfo: {
          mainText: mainText.trim(),
          secondaryText: secondaryText.trim(),
          position: textPosition,
          styleNotes: textStyleNotes.trim()
        }
      };

      console.log('Request data:', {
        description: requestData.description.length,
        productDescription: requestData.productDescription.length,
        productImagesCount: requestData.productImages.length,
        inspirationImagesCount: requestData.inspirationImages?.length,
        userId: requestData.userId,
        generationId: requestData.generationId,
        style: requestData.style,
        aspectRatio: requestData.aspectRatio,
        textInfo: requestData.textInfo ? {
          hasHeading: !!requestData.textInfo.mainText,
          hasSubheading: !!requestData.textInfo.secondaryText,
          position: requestData.textInfo.position
        } : 'No text'
      });

      // Verify data before sending
      if (!requestData.userId || !requestData.generationId) {
        throw new Error('Missing required fields: userId or generationId');
      }

      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      // Log raw response
      console.log('Raw response status:', response.status);

      const responseData: GenerateApiResponse = await response.json();
      console.log('Response data:', responseData);

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
          <p className="text-base-content/70">Loading ad generator...</p>
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
              <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Create Your Ad</h1>
                <p className="text-lg text-neutral-600">Transform your product into a stunning advertisement using our AI-powered generator</p>
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
                  />
                </div>

                {/* Style Area */}
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="bg-neutral-50 border-b border-neutral-200 p-6 md:p-8">
                      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Style Settings</h2>
                      <p className="text-neutral-600">Define how your ad will look</p>
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
                          <span className="text-lg font-semibold text-neutral-900">Ad Description</span>
                        </label>
                        <textarea
                          value={adDescription}
                          onChange={(e) => setAdDescription(e.target.value)}
                          className="textarea w-full min-h-[160px] text-base bg-neutral-50 rounded-2xl border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-neutral-400 resize-none p-6"
                          placeholder="Describe how you want your ad to look. What should be the focus? How should the product be presented? What mood or atmosphere do you want to create? E.g., 'Show the product in an outdoor setting with natural lighting, positioned at an angle to highlight its design. Create a bright, energetic mood with emphasis on the product&apos;s premium features.'"
                        />
                        <label className="label px-1 mt-2">
                          <span className="text-sm text-neutral-500">Be specific about the composition, lighting, mood, and what elements should be emphasized</span>
                          <span className="text-sm text-neutral-500">{adDescription.length} characters</span>
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
                  className={`btn btn-lg gap-2 px-8 min-w-[200px] hover:shadow-lg transition-all duration-200 ${
                    productImages.length === 0 || !adDescription.trim() || isGenerating
                      ? 'btn-disabled bg-neutral-200'
                      : 'btn-primary'
                  }`}
                  disabled={productImages.length === 0 || !adDescription.trim() || isGenerating}
                >
                  {isGenerating ? (
                    'Generating...'
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
      )}
    </div>
  );
} 