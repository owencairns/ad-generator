"use client";

import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UploadedImage, GenerationUIStatus } from '@/types/generation';
import GenerationLoadingState from '../../components/GenerationLoadingState';
import ProductSection from '../../components/ProductSection';

export default function ProductShowcaseGenerator() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

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
        template: 'product-showcase'
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
          <p className="text-base-content/70">Loading product showcase generator...</p>
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
                <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">Product Showcase</h1>
                <p className="text-lg text-base-content/70">Create a clean, professional showcase of your product</p>
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
              </div>

              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="submit"
                  className={`btn rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform gap-2 min-w-[200px] ${
                    productImages.length === 0 || isGenerating
                      ? 'btn-disabled bg-base-300'
                      : 'btn-primary'
                  }`}
                  disabled={productImages.length === 0 || isGenerating}
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