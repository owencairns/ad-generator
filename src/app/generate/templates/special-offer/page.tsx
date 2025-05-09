'use client';

import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UploadedImage, GenerationUIStatus, GenerationDocument } from '@/types/generation';
import ProductSection from '../../components/ProductSection';
import GenerationStatusNotification from '@/components/GenerationStatusNotification';

export default function SpecialOfferGenerator() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationUIStatus | null>(null);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  // Offer-specific states
  const [offerDescription, setOfferDescription] = useState('');
  const [includePrice, setIncludePrice] = useState(false);
  const [price, setPrice] = useState('');
  const [includeDiscount, setIncludeDiscount] = useState(false);
  const [discount, setDiscount] = useState('');

  const productInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

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
              // Redirect to gallery instead of generation detail
              router.push('/gallery');
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
      
      // Create request data in the format expected by the API
      const requestData = {
        // Standard fields that all templates use
        productImages: productImagesBase64,
        productName: productName.trim(),
        // Use product description as the productDescription field
        productDescription: description.trim(),
        // Create a specific description for the special offer template
        description: finalOfferDescription,
        userId: user.uid,
        generationId: newGenerationId,
        // Template-specific fields
        template: 'special-offer',
        // Keep offer-specific fields
        offerDescription: offerDescription.trim(),
        price: includePrice ? price.trim() : "",
        discount: includeDiscount ? discount.trim() : "",
        // Style settings
        style: "Bold, promotional, high-contrast, with focus on the offer",
        aspectRatio: "1:1",
        // Empty inspiration images array
        inspirationImages: [],
        // Include text information for the special offer
        textInfo: {
          mainText: offerText,
          secondaryText: "Limited Time Offer",
          position: "auto",
          styleNotes: "Bold, promotional text that stands out"
        }
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/generate`, {
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
      
      // Redirect to gallery instead of waiting
      router.push('/gallery');
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
          <p className="text-base-content/70">Loading special offer generator...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-base-100">
      {currentGenerationId && <GenerationStatusNotification generationId={currentGenerationId} />}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12">
          {/* Page Header */}
          <div className="flex flex-col items-center text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">Special Offer</h1>
              <p className="text-lg text-base-content/70">Create an eye-catching special offer advertisement</p>
            </div>
          </div>

          {/* Error Display */}
          {generationStatus?.status === 'error' && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{generationStatus.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-7xl mx-auto">
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

              {/* Offer Details */}
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
            </div>

            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="submit"
                className={`btn rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform gap-2 min-w-[200px] ${
                  productImages.length === 0 || !description.trim() || isGenerating
                    ? 'btn-disabled bg-base-300'
                    : 'btn-primary'
                }`}
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