'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import TemplateCard, { Template } from '../components/TemplateCard';

const PRESET_TEMPLATES: Template[] = [
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Clean, professional product-focused ads perfect for e-commerce',
    image: '/templates/product-showcase.png',
    platforms: ['Instagram', 'Facebook'],
    features: ['Product-centric layout', 'Clean background', 'Professional lighting'],
    bestFor: ['E-commerce', 'Product launches', 'Feature highlights'],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & UGC',
    description: 'Authentic, relatable ads that showcase products in real life',
    image: '/templates/lifestyle.png',
    platforms: ['Instagram', 'TikTok'],
    features: ['Natural settings', 'Real people', 'Authentic feel'],
    bestFor: ['Fashion', 'Beauty', 'Wellness products'],
  },
  {
    id: 'special-offer',
    name: 'Special Offer',
    description: 'High-converting ads highlighting deals and promotions',
    image: '/templates/special-offer.png',
    platforms: ['Instagram', 'Facebook', 'Pinterest'],
    features: ['Prominent CTA', 'Price highlighting', 'Urgency elements'],
    bestFor: ['Sales', 'Limited time offers', 'Promotions'],
  },
];

export default function SelectGenerationTypePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-base-300">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
              How would you like to create your ad?
            </h1>
            <p className="text-lg text-base-content/70">
              Choose a template for quick results, or start from scratch for complete control
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Custom Option */}
            <button
              onClick={() => router.push('/generate/custom')}
              className="group relative bg-base-200 rounded-3xl p-8 border-2 border-base-300 hover:cursor-pointer hover:border-primary transition-all duration-300 text-left"
            >
              <div className="flex items-start gap-6">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-2">Custom Design</h2>
                  <p className="text-base-content/70 mb-4">
                    Start from scratch and customize every aspect of your ad. Perfect for unique visions and specific requirements.
                  </p>
                  <span className="text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Start Custom
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>

            {/* Template Option */}
            <button
              onClick={() => router.push('/generate/templates')}
              className="group relative bg-base-200 rounded-3xl p-8 border-2 border-base-300 hover:cursor-pointer hover:border-primary transition-all duration-300 text-left"
            >
              <div className="flex items-start gap-6">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-base-content mb-2">Start from Template</h2>
                  <p className="text-base-content/70 mb-4">
                    Choose from our proven templates designed for specific industries and goals. Fast and effective.
                  </p>
                  <span className="text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Browse Templates
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Popular Templates Preview */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-base-content">Popular Templates</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRESET_TEMPLATES.slice(0, 3).map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 