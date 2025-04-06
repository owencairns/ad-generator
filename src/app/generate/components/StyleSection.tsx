'use client';

import React from 'react';
import Image from 'next/image';
import { STYLE_PRESETS } from '../constants/styles';

interface StyleSectionProps {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  customStyle: string;
  setCustomStyle: (style: string) => void;
}

export default function StyleSection({
  selectedStyle,
  setSelectedStyle,
  customStyle,
  setCustomStyle
}: StyleSectionProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.172 2.172a2 2 0 010 2.828l-8.486 8.486a2 2 0 01-2.828 0l-2.172-2.172a2 2 0 010-2.828L7.343 11" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Choose Ad Style
                <span className="tooltip tooltip-right ml-1" data-tip="Visual aesthetic for your ad">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </h2>
              <p className="text-neutral-600 mt-1">Select a visual style that best fits your brand and product</p>
            </div>
          </div>
          <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">3</div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(STYLE_PRESETS).map(([key, preset]) => (
            <label key={key} className="relative cursor-pointer">
              <input
                type="radio"
                name="style"
                value={key}
                checked={selectedStyle === key}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="peer sr-only"
              />
              <div className="p-3 rounded-xl border-2 border-neutral-200 bg-neutral-50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all duration-200 h-full flex flex-col">
                <div className="rounded-lg bg-white shadow-sm mb-2.5 overflow-hidden">
                  <Image
                    src={`/images/style-examples/${key === 'photo-realistic' ? 'example-fr' : 
                         key === '3d-rendered' ? 'example-3d' :
                         key === 'vintage' ? 'example-retro' :
                         `example-${key}`}.png`}
                    alt={`${preset.name} style example`}
                    width={300}
                    height={300}
                    className="w-full h-auto"
                  />
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm">{preset.name}</h3>
                <div className="mt-1.5 space-y-1 text-xs">
                  <p className="text-neutral-600">
                    <span className="font-medium text-neutral-700">Used for:</span> {preset.usedFor.join(', ')}
                  </p>
                  <p className="text-neutral-600">
                    <span className="font-medium text-neutral-700">Think:</span> {preset.thinkOf}
                  </p>
                </div>
              </div>
            </label>
          ))}

          {/* Divider with "or" */}
          <div className="col-span-2 lg:col-span-5 flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-neutral-200"></div>
            <div className="text-neutral-500 text-sm font-medium">or</div>
            <div className="flex-1 h-px bg-neutral-200"></div>
          </div>

          {/* Custom Style */}
          <label className="relative cursor-pointer block col-span-2 lg:col-span-5">
            <input
              type="radio"
              name="style"
              value="custom"
              checked={selectedStyle === 'custom'}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="peer sr-only"
            />
            <div className="p-3 rounded-xl border-2 border-neutral-200 bg-neutral-50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-neutral-900">Describe Your Style</h3>
                <span className="text-xs text-neutral-500">(describe your own style)</span>
              </div>
              <textarea
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                disabled={selectedStyle !== 'custom'}
                placeholder="Example: A modern, high-contrast style with dramatic shadows and a cinematic feel..."
                className="textarea w-full h-20 text-sm bg-white border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-neutral-100 disabled:cursor-not-allowed transition-colors duration-200"
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
} 