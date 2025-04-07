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
    <div className="bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
      <div className="bg-base-200 border-b border-base-300 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">Tell us about your product</h2>
              <p className="text-base-content/70 mt-1">Upload images and describe your product&apos;s key features</p>
            </div>
          </div>
          <div className="bg-primary text-base-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">1</div>
        </div>
      </div>
      
      <div className="p-6 md:p-8">
        <div className="space-y-8">
          {/* Image Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-base-content mb-4">Product Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Existing Images */}
              {productImages.map((img, index) => (
                <div 
                  key={index} 
                  className="group relative bg-base-200 rounded-2xl overflow-hidden"
                >
                  {/* Background blur effect */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
                    style={{ backgroundImage: `url(${img.url})` }}
                  />
                  
                  {/* Main image container */}
                  <div className="relative p-4">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-base-100 shadow-sm">
                      <Image
                        src={img.url}
                        alt={`Product ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute inset-0 bg-base-100/30 backdrop-blur-sm"></div>
                    <div className="relative flex gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(img.url, '_blank')}
                        className="btn btn-circle btn-sm bg-base-100/90 hover:bg-base-100 border-0 text-base-content"
                        title="View full size"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProductImage(index)}
                        className="btn btn-circle btn-sm bg-base-100/90 hover:bg-error/10 border-0 text-error"
                        title="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Image number badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-base-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                    Product Image {index + 1}
                  </div>
                </div>
              ))}

              {/* Upload Area */}
              {productImages.length < 2 && (
                <div
                  onClick={() => productInputRef?.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative group bg-base-200 rounded-2xl border-2 border-base-300 border-dashed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-200"></div>
                  <div className="relative p-8 flex flex-col items-center justify-center min-h-[240px]">
                    <div className="bg-base-100 rounded-full p-4 shadow-sm mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-base-content mb-1">Upload Product Image</h4>
                    <p className="text-base-content/60 text-sm text-center max-w-xs">
                      Drop your image here or click to browse. We recommend high-quality product photos on a clean background.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-base-content/40">
                      <span>Supports:</span>
                      <span className="px-2 py-1 bg-base-300 rounded">PNG</span>
                      <span className="px-2 py-1 bg-base-300 rounded">JPG</span>
                      <span className="px-2 py-1 bg-base-300 rounded">WEBP</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-lg font-semibold text-base-content mb-2">Product Description</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea w-full min-h-[160px] text-base bg-base-200 rounded-2xl border-base-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder:text-base-content/40 resize-none p-6"
              placeholder="Describe your product in detail. Include key features, benefits, materials, dimensions, or any other relevant information that helps understand what the product is. E.g., &apos;Premium whey protein powder with 25g protein per serving, made from grass-fed cows. Available in chocolate and vanilla flavors.&apos;"
            />
            <label className="label px-1 mt-2">
              <span className="text-sm text-base-content/60">Be specific about the product&apos;s features, specifications, and unique selling points</span>
              <span className="text-sm text-base-content/60">{description.length} characters</span>
            </label>
          </div>
        </div>
      </div>

      <input
        ref={productInputRef}
        type="file"
        accept="image/*"
        onChange={handleProductUpload}
        className="hidden"
      />
    </div>
  );
} 