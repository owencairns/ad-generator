'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import TemplateCard, { Template } from '../components/TemplateCard';

// In a real app, this would be in a shared location
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
    id: 'brand-story',
    name: 'Brand Story',
    description: 'Emotional, narrative-driven ads that connect with your audience',
    image: '/templates/brand-story.png',
    platforms: ['Facebook', 'LinkedIn'],
    features: ['Storytelling format', 'Brand-focused', 'Emotional appeal'],
    bestFor: ['Brand awareness', 'Company culture', 'Mission statements'],
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
  {
    id: 'lifestyle',
    name: 'Lifestyle & UGC',
    description: 'Authentic, relatable ads that showcase products in real life',
    image: '/templates/lifestyle.png',
    platforms: ['Instagram', 'TikTok'],
    features: ['Natural settings', 'Real people', 'Authentic feel'],
    bestFor: ['Fashion', 'Beauty', 'Wellness products'],
  }
];

export default function TemplatesPage() {
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
    <main className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-12">
            <Link
              href="/generate"
              className="btn btn-circle btn-ghost"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-base-content">Ad Templates</h1>
              <p className="text-base-content/70">Choose a template to get started quickly</p>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRESET_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 