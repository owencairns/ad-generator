'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UploadedImage {
  url: string;
  file: File;
}

interface GenerationStatus {
  status: 'processing' | 'completed' | 'error';
  imageUrl?: string;
  error?: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [inspirationImages, setInspirationImages] = useState<UploadedImage[]>([]);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  
  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (isGenerating && user) {
      // Subscribe to Firestore updates
      const unsubscribe = onSnapshot(
        doc(db, 'generatedImages', user.uid),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as GenerationStatus;
            setGenerationStatus(data);
            
            if (data.status === 'completed' || data.status === 'error') {
              setIsGenerating(false);
            }
          }
        }
      );

      return () => unsubscribe();
    }
  }, [isGenerating, user]);

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

    setIsGenerating(true);
    setGenerationStatus(null);

    try {
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

      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          productImages: productImagesBase64,
          inspirationImages: inspirationImagesBase64,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const data = await response.json();
      console.log('Generation started:', data);
    } catch (error) {
      console.error('Error starting generation:', error);
      setIsGenerating(false);
      alert('Failed to start generation. Please try again.');
    }
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-primary mb-8">Create Your Ad</h1>
      
      {generationStatus && (
        <div className={`alert ${generationStatus.status === 'error' ? 'alert-error' : 'alert-info'} mb-4`}>
          <div>
            {generationStatus.status === 'processing' && (
              <>
                <span className="loading loading-spinner"></span>
                <span>Generating your ad...</span>
              </>
            )}
            {generationStatus.status === 'completed' && (
              <>
                <span className="text-success">✓</span>
                <span>Ad generated successfully!</span>
                {generationStatus.imageUrl && (
                  <div className="mt-4">
                    <Image
                      src={generationStatus.imageUrl}
                      alt="Generated Ad"
                      width={400}
                      height={400}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </>
            )}
            {generationStatus.status === 'error' && (
              <>
                <span>Error: {generationStatus.error}</span>
              </>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Inspiration Images Section */}
        <div className="card bg-base-200 p-6">
          <h2 className="text-2xl font-semibold mb-4">Inspiration Images (Optional)</h2>
          <p className="text-base-content/70 mb-4">Upload up to 2 examples of ads you&apos;d like yours to look like</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {inspirationImages.map((img, index) => (
              <div key={index} className="relative">
                <Image
                  src={img.url}
                  alt={`Inspiration ${index + 1}`}
                  width={150}
                  height={150}
                  className="rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeInspirationImage(index)}
                  className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-error text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {inspirationImages.length < 2 && (
            <button
              type="button"
              onClick={() => inspirationInputRef.current?.click()}
              className="btn btn-secondary"
            >
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
        <div className="card bg-base-200 p-6">
          <h2 className="text-2xl font-semibold mb-4">Product Images (Required)</h2>
          <p className="text-base-content/70 mb-4">Upload 1-2 images of your product</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {productImages.map((img, index) => (
              <div key={index} className="relative">
                <Image
                  src={img.url}
                  alt={`Product ${index + 1}`}
                  width={150}
                  height={150}
                  className="rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeProductImage(index)}
                  className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-error text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {productImages.length < 2 && (
            <button
              type="button"
              onClick={() => productInputRef.current?.click()}
              className="btn btn-primary"
            >
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

        {/* Description Section */}
        <div className="card bg-base-200 p-6">
          <h2 className="text-2xl font-semibold mb-4">Ad Description</h2>
          <p className="text-base-content/70 mb-4">Describe your product and how you want the ad to look</p>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full h-32"
            placeholder="Example: I want to create a modern, minimalist ad for my eco-friendly water bottle. The ad should emphasize its sleek design and sustainable materials..."
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={productImages.length === 0 || isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="loading loading-spinner"></span>
              Generating...
            </>
          ) : (
            'Generate Ad'
          )}
        </button>
      </form>
    </main>
  );
} 