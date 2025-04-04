'use client';

import React from 'react';
import Link from 'next/link';
import { GenerationUIStatus } from '@/types/generation';

interface GenerationStatusProps {
  generationStatus: GenerationUIStatus | null;
  currentGenerationId: string | null;
}

export default function GenerationStatus({
  generationStatus,
  currentGenerationId
}: GenerationStatusProps) {
  if (!generationStatus) return null;

  return (
    <div className={`alert ${
      generationStatus.status === 'error' 
        ? 'alert-error' 
        : generationStatus.status === 'completed' 
          ? 'alert-success' 
          : 'alert-info'
    } max-w-3xl mx-auto shadow-sm`}>
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-3">
          {generationStatus.status === 'processing' && (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              <span>Creating your perfect ad... This may take a moment.</span>
            </>
          )}
          {generationStatus.status === 'completed' && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ad generated successfully! Redirecting you to view it...</span>
            </>
          )}
          {generationStatus.status === 'error' && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error: {generationStatus.error}</span>
            </>
          )}
        </div>
        {generationStatus.status === 'completed' && currentGenerationId && (
          <Link href={`/generate/${currentGenerationId}`} className="btn btn-sm btn-ghost">
            View Result
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
} 