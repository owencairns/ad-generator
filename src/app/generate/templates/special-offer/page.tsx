"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useGeneration } from '@/app/layout';
import { UploadedImage, GenerationUIStatus } from '@/types/generation';
import { generateAd } from '@/utils/generateAd';
import AdTemplateBase from '@/components/AdTemplateBase';

export default function SpecialOfferGenerator() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentGenerationId: setGlobalGenerationId } = useGeneration();
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);
  
  // Offer-specific states
  const [offerDescription, setOfferDescription] = useState('');
  const [includePrice, setIncludePrice] = useState(false);
  const [price, setPrice] = useState('');
  const [includeDiscount, setIncludeDiscount] = useState(false);
  const [discount, setDiscount] = useState('');

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

    if (!offerDescription.trim()) {
      alert('Please describe the special offer');
      return;
    }

    if (includePrice && !price.trim()) {
      alert('Please enter the price');
      return;
    }

    if (includeDiscount && !discount.trim()) {
      alert('Please enter the discount');
      return;
    }

    try {
      // Build offer description with optional price and discount
      let finalOfferDescription = `Create an attention-grabbing special offer advertisement highlighting: ${offerDescription.trim()}`;
      if (includePrice && price.trim()) {
        finalOfferDescription += ` with price: ${price.trim()}`;
      }
      if (includeDiscount && discount.trim()) {
        finalOfferDescription += ` featuring discount: ${discount.trim()}`;
      }
      
      // Create offer text for the image
      let offerText = offerDescription.trim();
      if (includePrice && price.trim()) offerText += ` - ${price.trim()}`;
      if (includeDiscount && discount.trim()) offerText += ` - ${discount.trim()}`;
      
      // Use our shared utility function
      await generateAd({
        user,
        router,
        productImages,
        productName: productName.trim(),
        description: description.trim(),
        adDescription: finalOfferDescription,
        style: "Bold, promotional, high-contrast, with focus on the offer",
        aspectRatio: "1:1",
        template: 'special-offer',
        offerDescription: offerDescription.trim(),
        price: includePrice ? price.trim() : "",
        discount: includeDiscount ? discount.trim() : "",
        textInfo: {
          mainText: offerText,
          secondaryText: "Limited Time Offer",
          position: "auto",
          styleNotes: "Bold, promotional text that stands out"
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
    return (
      productImages.length > 0 && 
      offerDescription.trim() !== '' && 
      (!includePrice || (includePrice && price.trim() !== '')) &&
      (!includeDiscount || (includeDiscount && discount.trim() !== ''))
    );
  };

  // Template-specific fields for Special Offer
  const SpecialOfferFields = (
    <div className="bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
      <div className="bg-base-200 border-b border-base-300 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">Offer Details</h2>
              <p className="text-base-content/70 mt-1">Describe your special offer and pricing details</p>
            </div>
          </div>
          <div className="bg-primary text-base-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">2</div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Offer Description */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-2">Special Offer Description</h3>
          <textarea
            value={offerDescription}
            onChange={(e) => setOfferDescription(e.target.value)}
            className="textarea w-full min-h-[120px] text-base bg-base-200 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-base-content/40 resize-none p-6"
            placeholder="Describe your special offer (e.g., 'Limited time summer sale' or 'Buy one get one free weekend special')"
          />
          <label className="label px-1 mt-2">
            <span className="text-sm text-base-content/60">Be specific about the offer duration and conditions</span>
          </label>
        </div>

        {/* Price Option */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-4">Price Details</h3>
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={includePrice}
                onChange={(e) => setIncludePrice(e.target.checked)}
              />
              <span>Include specific price in the ad</span>
            </label>
            
            {includePrice && (
              <div className="pl-8">
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input w-full max-w-xs bg-base-200 rounded-2xl border-base-300"
                  placeholder="Enter price (e.g., $99.99)"
                />
              </div>
            )}
          </div>
        </div>

        {/* Discount Option */}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-4">Discount Details</h3>
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={includeDiscount}
                onChange={(e) => setIncludeDiscount(e.target.checked)}
              />
              <span>Include specific discount in the ad</span>
            </label>
            
            {includeDiscount && (
              <div className="pl-8">
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="input w-full max-w-xs bg-base-200 rounded-2xl border-base-300"
                  placeholder="Enter discount (e.g., 20% OFF)"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdTemplateBase
      title="Special Offer"
      subtitle="Create an eye-catching special offer advertisement"
      templateSpecificFields={SpecialOfferFields}
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