'use client';

import React from 'react';

export default function ExplorePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Explore Ad Generator</h1>
        <p className="text-lg text-base-content/70 mb-8">
          Discover the latest AI-generated ads from our community. Coming soon!
        </p>
        
        {/* Placeholder Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="animate-pulse">
                  <div className="h-48 bg-base-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-base-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 