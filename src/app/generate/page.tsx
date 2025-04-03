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
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'advanced'
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

            if (data.status === 'completed' || data.status === 'error') {
              setIsGenerating(false);
            }
          }
        }
      );

      return () => unsubscribe();
    }
  }, [isGenerating, user, currentGenerationId]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Create Your Ad</h1>
            <p className="text-base-content/70 mt-1">Upload your product images and customize your ad preferences</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 w-fit">
          <button
            className={`tab ${activeTab === 'basic' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic
          </button>
          <button
            className={`tab ${activeTab === 'advanced' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Options
          </button>
        </div>

        {/* Generation Status Alert */}
        {generationStatus && (
          <div className={`alert ${generationStatus.status === 'error' ? 'alert-error' : generationStatus.status === 'completed' ? 'alert-success' : 'alert-info'} shadow-lg`}>
            <div className="flex w-full justify-between items-center">
              <div className="flex items-center">
                {generationStatus.status === 'processing' && (
                  <>
                    <span className="loading loading-spinner"></span>
                    <span>Generating your ad... This may take a moment.</span>
                  </>
                )}
                {generationStatus.status === 'completed' && (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Ad generated successfully!</span>
                  </>
                )}
                {generationStatus.status === 'error' && (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Error: {generationStatus.error}</span>
                  </>
                )}
              </div>
              {generationStatus.status === 'completed' && (
                <Link href={`/generate/sample-${new Date().getTime()}`} className="btn btn-sm">View in Gallery</Link>
              )}
            </div>

            {generationStatus.status === 'completed' && generationStatus.imageUrl && (
              <div className="mt-4 flex justify-center">
                <div className="relative bg-base-200 p-2 rounded-lg shadow-md">
                  <Image
                    src={generationStatus.imageUrl}
                    alt="Generated Ad"
                    width={400}
                    height={400}
                    className="rounded-lg"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="btn btn-circle btn-sm bg-base-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button className="btn btn-circle btn-sm bg-base-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inspiration Images Section */}
            <div className="bg-base-100 rounded-box shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-base-content">Inspiration Images</h2>
                  <p className="text-base-content/70 text-sm">Upload up to 2 examples of ads you&apos;d like yours to look like</p>
                </div>
                <div className="tooltip" data-tip="Provide examples of styles you like">
                  <button type="button" className="btn btn-circle btn-ghost btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-base-200 rounded-lg p-6 mb-4 min-h-[200px] flex flex-col items-center justify-center">
                {inspirationImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {inspirationImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="overflow-hidden rounded-lg bg-white shadow-md aspect-square">
                          <Image
                            src={img.url}
                            alt={`Inspiration ${index + 1}`}
                            fill
                            className="object-cover rounded-lg transition-transform group-hover:scale-105"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInspirationImage(index)}
                          className="btn btn-circle btn-sm btn-error absolute -top-2 -right-2 opacity-90"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-base-content/50">No inspiration images uploaded</p>
                    <p className="text-base-content/50 text-sm">Optional but recommended for better results</p>
                  </div>
                )}
              </div>

              {inspirationImages.length < 2 && (
                <button
                  type="button"
                  onClick={() => inspirationInputRef.current?.click()}
                  className="btn btn-outline btn-secondary w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload Inspiration Image
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

            {/* Product Images Section */}
            <div className="bg-base-100 rounded-box shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-base-content">Product Images</h2>
                  <p className="text-base-content/70 text-sm">Upload 1-2 images of your product</p>
                </div>
                <div className="indicator">
                  <span className="indicator-item badge badge-secondary">Required</span>
                  <div className="tooltip" data-tip="Images of your product to include in the ad">
                    <button type="button" className="btn btn-circle btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-base-200 rounded-lg p-6 mb-4 min-h-[200px] flex flex-col items-center justify-center">
                {productImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {productImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="overflow-hidden rounded-lg bg-white shadow-md aspect-square">
                          <Image
                            src={img.url}
                            alt={`Product ${index + 1}`}
                            fill
                            className="object-cover rounded-lg transition-transform group-hover:scale-105"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProductImage(index)}
                          className="btn btn-circle btn-sm btn-error absolute -top-2 -right-2 opacity-90"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-base-content/50">No product images uploaded</p>
                    <p className="text-base-content/50 text-sm">At least one product image is required</p>
                  </div>
                )}
              </div>

              {productImages.length < 2 && (
                <button
                  type="button"
                  onClick={() => productInputRef.current?.click()}
                  className="btn btn-primary w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
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
          </div>

          {/* Description Section */}
          <div className="bg-base-100 rounded-box shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-base-content">Ad Description</h2>
                <p className="text-base-content/70 text-sm">Describe your product and how you want the ad to look</p>
              </div>
            </div>

            <div className="form-control">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full h-32 text-base"
                placeholder="Example: I want to create a modern, minimalist ad for my eco-friendly water bottle. The ad should emphasize its sleek design and sustainable materials..."
              />
              <label className="label">
                <span className="label-text-alt">Be specific about the style, mood, and key features to highlight</span>
                <span className="label-text-alt">{description.length} characters</span>
              </label>
            </div>

            {activeTab === 'advanced' && (
              <div className="mt-4">
                <div className="divider">Advanced Options</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Target Platform</span>
                    </label>
                    <select className="select select-bordered w-full">
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Ad Style</span>
                    </label>
                    <select className="select select-bordered w-full">
                      <option value="modern">Modern & Minimalist</option>
                      <option value="bold">Bold & Vibrant</option>
                      <option value="luxury">Luxury & Elegant</option>
                      <option value="playful">Playful & Fun</option>
                    </select>
                  </div>
                </div>

                <div className="form-control mt-4">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input type="checkbox" className="checkbox checkbox-primary" />
                    <span className="label-text">Include brand logo in the ad</span>
                  </label>
                </div>

                <div className="form-control mt-2">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input type="checkbox" className="checkbox checkbox-primary" />
                    <span className="label-text">Generate multiple variations (uses additional credits)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-3 mt-8">
            <Link href="/dashboard" className="btn btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-lg gap-2"
              disabled={productImages.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  Generate Ad
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 