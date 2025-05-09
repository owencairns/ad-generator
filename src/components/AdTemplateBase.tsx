import React, { useEffect, useRef, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadedImage, GenerationUIStatus } from '@/types/generation';
import ProductSection from '@/app/generate/components/ProductSection';

interface AdTemplateBaseProps {
  title: string;
  subtitle: string;
  templateSpecificFields: ReactNode;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  productImages: UploadedImage[];
  setProductImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  productName: string;
  setProductName: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  isGenerating: boolean;
  generationStatus: GenerationUIStatus | null;
  validationCheck: () => boolean;
}

const AdTemplateBase: React.FC<AdTemplateBaseProps> = ({
  title,
  subtitle,
  templateSpecificFields,
  onSubmit,
  productImages,
  setProductImages,
  productName,
  setProductName,
  description,
  setDescription,
  isGenerating,
  generationStatus,
  validationCheck
}) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const productInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading {title.toLowerCase()} generator...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12">
          {/* Page Header */}
          <div className="flex flex-col items-center text-center relative">
            {/* Back Button */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <Link
                href="/generate/templates"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-base-200 hover:bg-base-300 text-base-content transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">{title}</h1>
              <p className="text-lg text-base-content/70">{subtitle}</p>
            </div>
          </div>

          {/* Error Display */}
          {generationStatus?.status === 'error' && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{generationStatus.error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-8 max-w-7xl mx-auto">
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

              {/* Template-specific fields passed as props */}
              {templateSpecificFields}
            </div>

            <div className="mt-10 flex items-center justify-end gap-4">
              <button
                type="submit"
                className={`btn btn-primary rounded-full px-8 normal-case text-base font-medium hover:scale-105 transition-transform gap-2 min-w-[200px] ${
                  !validationCheck() || isGenerating ? 'btn-disabled' : ''
                }`}
                disabled={!validationCheck() || isGenerating}
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
};

export default AdTemplateBase; 