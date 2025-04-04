'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadedImage,
  GenerationUIStatus,
  GenerateApiRequest,
  GenerateApiResponse,
  GenerationDocument
} from '@/types/generation';

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [inspirationImages, setInspirationImages] = useState<UploadedImage[]>([]);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [description, setDescription] = useState('');
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
            setGenerationStatus({
              status: data.status,
              imageUrl: data.generatedImageUrl,
              error: data.error
            });

            if (data.status === 'completed') {
              // Redirect to the generation detail page when complete
              setTimeout(() => {
                router.push(`/generate/${currentGenerationId}`);
              }, 2000); // Give user time to see success message before redirect
              setIsGenerating(false);
            } else if (data.status === 'error') {
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

    if (!description.trim()) {
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
        description: description.trim(),
        productImages: productImagesBase64,
        inspirationImages: inspirationImagesBase64.length > 0 ? inspirationImagesBase64 : [],
        userId: user.uid,
        generationId: newGenerationId
      };

      console.log('Request data:', {
        description: requestData.description.length,
        productImagesCount: requestData.productImages.length,
        inspirationImagesCount: requestData.inspirationImages?.length,
        userId: requestData.userId,
        generationId: requestData.generationId
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
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12">
          {/* Page Header */}
          <div className="flex flex-col items-center text-center">
            <Link 
              href="/gallery" 
              className="btn btn-ghost btn-sm gap-2 absolute left-4 md:left-8 top-24"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Gallery
            </Link>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Create Your Ad</h1>
              <p className="text-lg text-neutral-600">Transform your product into a stunning advertisement using our AI-powered generator</p>
            </div>
          </div>

          {/* Generation Status Alert */}
          {generationStatus && (
            <div className={`alert ${
              generationStatus.status === 'error' 
                ? 'alert-error' 
                : generationStatus.status === 'completed' 
                  ? 'alert-success' 
                  : 'alert-info'
            } max-w-3xl mx-auto shadow-sm`}>
              <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-3">
                  {generationStatus.status === 'processing' && (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Creating your perfect ad... This may take a moment.</span>
                    </>
                  )}
                  {generationStatus.status === 'completed' && (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ad generated successfully! Redirecting you to view it...</span>
                    </>
                  )}
                  {generationStatus.status === 'error' && (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Error: {generationStatus.error}</span>
                    </>
                  )}
                </div>
                {generationStatus.status === 'completed' && currentGenerationId && (
                  <Link href={`/generate/${currentGenerationId}`} className="btn btn-sm btn-ghost">
                    View Result
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-5xl mx-auto">
            {/* Description Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 md:p-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Describe Your Ad</h2>
                  <p className="text-neutral-600 mt-1">Tell us about your product and how you want the ad to look</p>
                </div>
                <div className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap">Step&nbsp;1</div>
              </div>
              
              <div className="form-control">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea w-full min-h-[160px] text-base bg-neutral-50 rounded-2xl border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-neutral-400 resize-none p-6"
                  placeholder="Example: I want to create a modern, minimalist ad for my eco-friendly water bottle. The ad should emphasize its sleek design and sustainable materials..."
                />
                <label className="label px-1 mt-2">
                  <span className="text-sm text-neutral-500">Be specific about the style, mood, and key features to highlight</span>
                  <span className="text-sm text-neutral-500">{description.length} characters</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Images Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Product Images</h2>
                    <p className="text-neutral-600 mt-1">Upload 1-2 high-quality images of your product</p>
                  </div>
                  <div className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap">Step&nbsp;2</div>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-8 mb-6 border border-neutral-200 border-dashed">
                  {productImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {productImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="overflow-hidden rounded-xl bg-white shadow-sm aspect-square">
                            <Image
                              src={img.url}
                              alt={`Product ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProductImage(index)}
                            className="btn btn-circle btn-sm absolute -top-2 -right-2 bg-white border-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-neutral-600 font-medium">No product images uploaded</p>
                      <p className="text-neutral-500 text-sm mt-1">At least one product image is required</p>
                    </div>
                  )}
                </div>

                {productImages.length < 2 && (
                  <button
                    type="button"
                    onClick={() => productInputRef.current?.click()}
                    className="btn btn-primary w-full gap-2 hover:shadow-md transition-shadow duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload Product Image
                  </button>
                )}
                <input
                  ref={productInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProductUpload}
                  className="hidden"
                />
              </div>

              {/* Inspiration Images Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Inspiration</h2>
                    <p className="text-neutral-600 mt-1">Upload examples of ads you like for reference</p>
                  </div>
                  <div className="bg-white text-neutral-600 px-4 py-1.5 rounded-lg text-sm font-medium">Optional</div>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-8 mb-6 border border-neutral-200 border-dashed">
                  {inspirationImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {inspirationImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="overflow-hidden rounded-xl bg-white shadow-sm aspect-square">
                            <Image
                              src={img.url}
                              alt={`Inspiration ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeInspirationImage(index)}
                            className="btn btn-circle btn-sm absolute -top-2 -right-2 bg-white border-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-neutral-600 font-medium">No inspiration images</p>
                      <p className="text-neutral-500 text-sm mt-1">Upload examples to guide the style</p>
                    </div>
                  )}
                </div>

                {inspirationImages.length < 2 && (
                  <button
                    type="button"
                    onClick={() => inspirationInputRef.current?.click()}
                    className="btn w-full gap-2 bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900 hover:shadow-md transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Add Inspiration
                  </button>
                )}
                <input
                  ref={inspirationInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInspirationUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="submit"
                className="btn btn-primary btn-lg gap-2 px-8 min-w-[200px] hover:shadow-lg transition-all duration-200"
                disabled={productImages.length === 0 || !description.trim() || isGenerating}
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