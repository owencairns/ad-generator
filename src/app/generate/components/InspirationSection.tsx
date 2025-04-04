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
    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-neutral-100 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Inspiration</h2>
              <p className="text-neutral-600 mt-1">Upload examples of ads you like for reference</p>
            </div>
          </div>
          <div className="bg-neutral-200 text-neutral-700 px-4 py-1.5 rounded-lg text-sm font-medium">Optional</div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {inspirationImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {inspirationImages.map((img, index) => (
              <div key={index} className="relative group">
                <div className="overflow-hidden rounded-xl bg-white shadow-sm aspect-square group-hover:shadow-md transition-all duration-300">
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
        ) : null}

        {inspirationImages.length < 2 && (
          <div
            onClick={() => inspirationInputRef?.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-neutral-50 rounded-2xl p-8 border-2 border-neutral-200 border-dashed cursor-pointer hover:bg-neutral-100/50 transition-colors duration-200 text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-neutral-600 font-medium">Drop your image here</p>
            <p className="text-neutral-500 text-sm mt-1">or click to browse</p>
          </div>
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
  );
} 