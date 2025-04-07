'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { UploadedImage } from '@/types/generation';

interface InspirationSectionProps {
  inspirationImages: UploadedImage[];
  handleInspirationUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeInspirationImage: (index: number) => void;
  inspirationInputRef: React.RefObject<HTMLInputElement>;
}

export default function InspirationSection({
  inspirationImages,
  handleInspirationUpload,
  removeInspirationImage,
  inspirationInputRef
}: InspirationSectionProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && inspirationInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      inspirationInputRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      inspirationInputRef.current.dispatchEvent(event);
    }
  }, [inspirationInputRef]);

  return (
    <div className="bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
      <div className="bg-base-200 border-b border-base-300 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-base-200 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">Inspiration</h2>
              <p className="text-base-content/70 mt-1">Upload examples of ads you like for reference</p>
            </div>
          </div>
          <div className="bg-base-300 text-base-content/80 px-4 py-1.5 rounded-lg text-sm font-medium">Optional</div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inspirationImages.map((img, index) => (
            <div 
              key={index} 
              className="group relative bg-base-200 rounded-2xl overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
                style={{ backgroundImage: `url(${img.url})` }}
              />
              
              <div className="relative p-4">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-base-100 shadow-sm">
                  <Image
                    src={img.url}
                    alt={`Inspiration ${index + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>

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
                    onClick={() => removeInspirationImage(index)}
                    className="btn btn-circle btn-sm bg-base-100/90 hover:bg-error/10 border-0 text-error"
                    title="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="absolute top-3 left-3 px-2 py-1 bg-base-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-base-content/70">
                Inspiration {index + 1}
              </div>
            </div>
          ))}

          {inspirationImages.length < 2 && (
            <div
              onClick={() => inspirationInputRef?.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative group bg-base-200 rounded-2xl border-2 border-base-300 border-dashed overflow-hidden"
            >
              <div className="absolute inset-0 bg-base-200/0 group-hover:bg-base-200/50 transition-colors duration-200"></div>
              <div className="relative p-8 flex flex-col items-center justify-center min-h-[240px]">
                <div className="bg-base-100 rounded-full p-4 shadow-sm mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-base-content mb-1">Add Inspiration</h4>
                <p className="text-base-content/60 text-sm text-center max-w-xs">
                  Drop reference images here or click to browse. These will help guide the style of your ad.
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

        <input
          ref={inspirationInputRef}
          type="file"
          accept="image/*"
          onChange={handleInspirationUpload}
          className="hidden"
        />
      </div>
    </div>
  );
} 