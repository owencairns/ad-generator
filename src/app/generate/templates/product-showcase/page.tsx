"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useGeneration } from '@/app/layout';
import { UploadedImage, GenerationUIStatus } from '@/types/generation';
import { generateAd } from '@/utils/generateAd';
import AdTemplateBase from '@/components/AdTemplateBase';

export default function ProductShowcaseGenerator() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentGenerationId: setGlobalGenerationId } = useGeneration();
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);

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

    try {
      // Use our shared utility function
      await generateAd({
        user,
        router,
        productImages,
        productName: productName.trim(),
        description: description.trim(),
        adDescription: "Create a clean, professional product showcase advertisement that highlights the product clearly and attractively.",
        style: "Minimal, clean background, professional lighting, product-centric composition, e-commerce ready.",
        aspectRatio: "1:1",
        template: 'product-showcase',
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
    return productImages.length > 0;
  };

  // The product showcase doesn't have any template-specific fields
  // We can pass an empty div or null, but for consistency we'll pass a small message
  const ProductShowcaseFields = (
    <div className="bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
      <div className="bg-base-200 border-b border-base-300 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">Product Showcase</h2>
              <p className="text-base-content/70 mt-1">Clean, professional presentation of your product</p>
            </div>
          </div>
          <div className="bg-primary text-base-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">2</div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <p className="text-base-content/70">
          This template focuses on presenting your product in a clean, professional environment 
          with optimal lighting and composition. Great for e-commerce and product listings.
        </p>
      </div>
    </div>
  );

  return (
    <AdTemplateBase
      title="Product Showcase"
      subtitle="Create a professional showcase of your product"
      templateSpecificFields={ProductShowcaseFields}
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