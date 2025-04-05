'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { UploadedImage } from '@/types/generation';

interface ProductSectionProps {
  productImages: UploadedImage[];
  description: string;
  setDescription: (description: string) => void;
  handleProductUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeProductImage: (index: number) => void;
  productInputRef: React.RefObject<HTMLInputElement>;
}

export default function ProductSection({
  productImages,
  description,
  setDescription,
  handleProductUpload,
  removeProductImage,
  productInputRef
}: ProductSectionProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && productInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      productInputRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      productInputRef.current.dispatchEvent(event);
    }
  }, [productInputRef]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Tell us about your product</h2>
              <p className="text-neutral-600 mt-1">Upload images and describe your product&apos;s key features</p>
            </div>
          </div>
          <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">1</div>
        </div>
      </div>
      
      <div className="p-6 md:p-8">
        <div className="space-y-8">
          {/* Image Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Product Images</h3>
            {productImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {productImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm aspect-square group-hover:shadow-md transition-all duration-300">
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
                      className="btn btn-circle btn-sm absolute -top-2 -right-2 bg-white border-neutral-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:border-red-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {productImages.length < 2 && (
              <div
                onClick={() => productInputRef?.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="bg-neutral-50 rounded-2xl p-8 border-2 border-neutral-200 border-dashed cursor-pointer hover:bg-neutral-100/50 transition-colors duration-200 text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-neutral-600 font-medium">Drop your product image here</p>
                <p className="text-neutral-500 text-sm mt-1">or click to browse</p>
              </div>
            )}

            <input
              ref={productInputRef}
              type="file"
              accept="image/*"
              onChange={handleProductUpload}
              className="hidden"
            />
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Product Description</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea w-full min-h-[160px] text-base bg-neutral-50 rounded-2xl border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-neutral-400 resize-none p-6"
              placeholder="Describe your product in detail. Include key features, benefits, materials, dimensions, or any other relevant information that helps understand what the product is. E.g., &apos;Premium whey protein powder with 25g protein per serving, made from grass-fed cows. Available in chocolate and vanilla flavors.&apos;"
            />
            <label className="label px-1 mt-2">
              <span className="text-sm text-neutral-500">Be specific about the product&apos;s features, specifications, and unique selling points</span>
              <span className="text-sm text-neutral-500">{description.length} characters</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 