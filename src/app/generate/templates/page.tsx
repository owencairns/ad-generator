'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import TemplateCard, { Template } from '../components/TemplateCard';

// In a real app, this would be in a shared location
const PRESET_TEMPLATES: Template[] = [
  {
    id: 'clothing-showcase',
    name: 'Clothing Showcase',
    description: 'Professional template optimized for fashion and apparel products',
    image: '/templates/clothing-showcase.png',
    platforms: ['Instagram', 'Facebook', 'Pinterest'],
    features: ['360° product view', 'Size selector', 'Color variants', 'Material details'],
    bestFor: ['Fashion brands', 'Apparel stores', 'Accessories'],
  },
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
    <main className="min-h-screen bg-base-300">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/generate"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-base-200 hover:bg-base-300 text-base-content transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-base-content">Ad Templates</h1>
              <p className="text-base-content/70">Choose a template to get started quickly</p>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="bg-base-200/50 dark:bg-base-200/20 p-6 rounded-2xl mb-8 border border-base-300 dark:border-base-200/30 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-base-content/70 mb-2 block">Search templates</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name or description..." 
                    className="input input-bordered w-full pr-10 bg-base-100 dark:bg-base-200/40 border-base-300 dark:border-base-200/40 focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select className="select select-bordered bg-base-100 dark:bg-base-200/40 border-base-300 dark:border-base-200/40 focus:border-primary focus:ring-1 focus:ring-primary/30">
                  <option value="">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Pinterest">Pinterest</option>
                </select>
                <select className="select select-bordered bg-base-100 dark:bg-base-200/40 border-base-300 dark:border-base-200/40 focus:border-primary focus:ring-1 focus:ring-primary/30">
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="az">A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Templates Grid with better spacing and animation delays */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRESET_TEMPLATES.map((template, index) => (
              <div 
                key={template.id} 
                className="animate-fadeIn h-full" 
                style={{animationDelay: `${index * 100}ms`}}
              >
                <TemplateCard
                  template={template}
                  variant="compact"
                  className="h-full"
                />
              </div>
            ))}
          </div>
          
          {/* Coming Soon Section */}
          <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/25 dark:to-primary/15 rounded-2xl text-center border border-base-200 dark:border-primary/20 shadow-md">
            <h2 className="text-2xl font-bold text-base-content mb-3">More Templates Coming Soon</h2>
            <p className="text-base-content/70 max-w-2xl mx-auto mb-6">
              Our design team is working on new high-converting templates. Subscribe to get notified when we release new templates.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="input input-bordered flex-1 bg-base-100 dark:bg-base-200/50 border-base-300 dark:border-primary/20" />
              <button className="btn btn-primary px-6 shadow-md hover:shadow-lg transition-shadow">Notify Me</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 