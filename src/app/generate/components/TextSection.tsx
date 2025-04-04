'use client';

import React from 'react';

interface TextSectionProps {
  mainText: string;
  setMainText: (text: string) => void;
  secondaryText: string;
  setSecondaryText: (text: string) => void;
  textPosition: string;
  setTextPosition: (position: string) => void;
  textStyleNotes: string;
  setTextStyleNotes: (notes: string) => void;
}

export default function TextSection({
  mainText,
  setMainText,
  secondaryText,
  setSecondaryText,
  textPosition,
  setTextPosition,
  textStyleNotes,
  setTextStyleNotes
}: TextSectionProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Add Text</h2>
              <p className="text-neutral-600 mt-1">Add optional text to your ad</p>
            </div>
          </div>
          <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">5</div>
        </div>
      </div>
      
      <div className="p-6 md:p-8">
        <div className="space-y-6">
          {/* Heading Input */}
          <div className="form-control">
            <label className="label px-1">
              <span className="text-sm font-medium text-neutral-900">Heading</span>
            </label>
            <input
              type="text"
              placeholder="Short, bold hook – max 6 words"
              className="input input-bordered w-full bg-neutral-50 rounded-xl border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
              value={mainText}
              onChange={(e) => setMainText(e.target.value)}
              maxLength={50}
            />
          </div>
          
          {/* Subheading Input */}
          <div className="form-control">
            <label className="label px-1">
              <span className="text-sm font-medium text-neutral-900">Subheading</span>
            </label>
            <input
              type="text"
              placeholder="Optional support line under the main headline"
              className="input input-bordered w-full bg-neutral-50 rounded-xl border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
              value={secondaryText}
              onChange={(e) => setSecondaryText(e.target.value)}
              maxLength={100}
            />
          </div>
          
          {/* Text Placement - Only show if text is entered */}
          {(mainText || secondaryText) && (
            <div className="form-control">
              <label className="label px-1">
                <span className="text-sm font-medium text-neutral-900">Text Placement</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary"
                  checked={textPosition === 'auto'}
                  onChange={(e) => setTextPosition(e.target.checked ? 'auto' : '')}
                />
                <span className="text-sm text-neutral-700">Auto</span>
              </div>
              {textPosition !== 'auto' && (
                <textarea
                  placeholder="E.g., 'Place heading at the top and subheading at the bottom' or 'Text should be centered on a dark overlay'"
                  className="textarea textarea-bordered w-full h-20 bg-neutral-50 rounded-xl border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
                  value={textStyleNotes}
                  onChange={(e) => setTextStyleNotes(e.target.value)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 