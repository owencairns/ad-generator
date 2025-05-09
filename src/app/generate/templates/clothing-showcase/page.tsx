'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useGeneration } from '@/app/layout';
import { UploadedImage, GenerationUIStatus } from '@/types/generation';
import { generateAd } from '@/utils/generateAd';
import AdTemplateBase from '@/components/AdTemplateBase';

type ShotType = 'closeup' | 'full-body';
type ViewType = 'single' | 'multiple';

export default function ClothingShowcaseGenerator() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentGenerationId: setGlobalGenerationId } = useGeneration();
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);

  // Clothing-specific states
  const [clothingType, setClothingType] = useState('');
  const [shotType, setShotType] = useState<ShotType>('full-body');
  const [viewType, setViewType] = useState<ViewType>('single');

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

    try {
      // Create viewType and shotType text descriptions
      const viewTypeText = viewType === "multiple" ? "showing multiple angles (front and back)" : "from a single clear angle";
      const shotTypeText = shotType === "closeup" ? "with close-up details of textures and features" : "full-body to show the complete look";
      
      // Use our shared utility function
      await generateAd({
        user,
        router,
        productImages,
        productName: productName.trim(),
        description: description.trim(),
        adDescription: `Create a professional clothing showcase for ${clothingType.trim()} ${viewTypeText} ${shotTypeText}.`,
        style: "Clean, professional fashion photography style with neutral background",
        aspectRatio: "4:5",
        template: 'clothing-showcase',
        // Template-specific fields
        clothingType: clothingType.trim(),
        shotType,
        viewType,
        // No text by default for clothing showcase
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
    return productImages.length > 0 && clothingType.trim() !== '';
  };

  // Clothing-specific template fields
  const ClothingShowcaseFields = (
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
  );

  return (
    <AdTemplateBase
      title="Clothing Showcase"
      subtitle="Create a professional showcase of your clothing item"
      templateSpecificFields={ClothingShowcaseFields}
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