'use client';

import React, { useRef, useState } from 'react';

interface AspectRatioSectionProps {
  selectedAspectRatio: string;
  setSelectedAspectRatio: (ratio: string) => void;
}

export default function AspectRatioSection({
  selectedAspectRatio,
  setSelectedAspectRatio
}: AspectRatioSectionProps) {
  const widthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateCustomRatio = () => {
    const width = widthInputRef.current?.value;
    const height = heightInputRef.current?.value;
    if (width && height) {
      setSelectedAspectRatio(`${width}:${height}`);
    }
  };

  return (
    <div className="bg-base-100 rounded-3xl shadow-sm border border-base-300 overflow-hidden">
      <div className="bg-base-200 border-b border-base-300 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                Choose Aspect Ratio
                <span className="tooltip tooltip-right ml-1" data-tip="The width-to-height ratio of your ad">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/40 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </h2>
              <p className="text-base-content/70 mt-1">Select the dimensions that best fit your platform</p>
            </div>
          </div>
          <div className="bg-primary text-base-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">4</div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Platform Quick Select - Moved to top and enhanced */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-base-content mb-4">Quick Select by Platform</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Square Format Group */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-base-content/70 mb-1">Square Format (1:1)</div>
              <button
                type="button"
                onClick={() => setSelectedAspectRatio('1:1')}
                className={`btn btn-lg h-auto flex-col gap-3 normal-case ${
                  selectedAspectRatio === '1:1' 
                  ? 'btn-primary shadow-lg' 
                  : 'btn-outline hover:bg-primary/5'
                } w-full py-6`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-base">Instagram Feed</span>
              </button>
            </div>

            {/* Story Format Group */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-base-content/70 mb-1">Story Format (9:16)</div>
              <button
                type="button"
                onClick={() => setSelectedAspectRatio('9:16')}
                className={`btn btn-lg h-auto flex-col gap-3 normal-case ${
                  selectedAspectRatio === '9:16' 
                  ? 'btn-primary shadow-lg' 
                  : 'btn-outline hover:bg-primary/5'
                } w-full py-6`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-base">Instagram Story / TikTok</span>
              </button>
            </div>

            {/* Landscape Format Group */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-base-content/70 mb-1">Landscape Format (16:9)</div>
              <button
                type="button"
                onClick={() => setSelectedAspectRatio('16:9')}
                className={`btn btn-lg h-auto flex-col gap-3 normal-case ${
                  selectedAspectRatio === '16:9' 
                  ? 'btn-primary shadow-lg' 
                  : 'btn-outline hover:bg-primary/5'
                } w-full py-6`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-base">Facebook / LinkedIn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Options Section */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-ghost btn-sm gap-2 normal-case"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            Advanced Options
          </button>

          <div className={`transition-all duration-200 ease-in-out ${showAdvanced ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="border-t border-base-300 pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Square 1:1 */}
                <label className="relative cursor-pointer h-full">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value="1:1"
                    checked={selectedAspectRatio === '1:1'}
                    onChange={(e) => setSelectedAspectRatio(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 rounded-xl border-2 border-base-300 bg-base-200 peer-checked:border-primary peer-checked:bg-primary/5 transition-all duration-200 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base-content">Square</h3>
                      <span className="px-2 py-0.5 rounded bg-base-300 text-base-content text-xs font-medium">1:1</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-base-content/80">Perfect for:</p>
                      <ul className="text-sm text-base-content/70 list-disc list-inside space-y-0.5">
                        <li>Instagram feed posts</li>
                        <li>Facebook feed posts</li>
                        <li>LinkedIn company updates</li>
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Portrait 4:5 */}
                <label className="relative cursor-pointer h-full">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value="4:5"
                    checked={selectedAspectRatio === '4:5'}
                    onChange={(e) => setSelectedAspectRatio(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 rounded-xl border-2 border-base-300 bg-base-200 peer-checked:border-primary peer-checked:bg-primary/5 transition-all duration-200 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base-content">Portrait</h3>
                      <span className="px-2 py-0.5 rounded bg-base-300 text-base-content text-xs font-medium">4:5</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-base-content/80">Perfect for:</p>
                      <ul className="text-sm text-base-content/70 list-disc list-inside space-y-0.5">
                        <li>Instagram feed posts</li>
                        <li>Facebook feed posts</li>
                        <li className="opacity-0">Spacer</li>
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Story 9:16 */}
                <label className="relative cursor-pointer h-full">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value="9:16"
                    checked={selectedAspectRatio === '9:16'}
                    onChange={(e) => setSelectedAspectRatio(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 rounded-xl border-2 border-base-300 bg-base-200 peer-checked:border-primary peer-checked:bg-primary/5 transition-all duration-200 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base-content">Story</h3>
                      <span className="px-2 py-0.5 rounded bg-base-300 text-base-content text-xs font-medium">9:16</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-base-content/80">Perfect for:</p>
                      <ul className="text-sm text-base-content/70 list-disc list-inside space-y-0.5">
                        <li>Instagram Stories</li>
                        <li>Facebook Stories</li>
                        <li>TikTok videos</li>
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Landscape 16:9 */}
                <label className="relative cursor-pointer h-full">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value="16:9"
                    checked={selectedAspectRatio === '16:9'}
                    onChange={(e) => setSelectedAspectRatio(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 rounded-xl border-2 border-base-300 bg-base-200 peer-checked:border-primary peer-checked:bg-primary/5 transition-all duration-200 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base-content">Landscape</h3>
                      <span className="px-2 py-0.5 rounded bg-base-300 text-base-content text-xs font-medium">16:9</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-base-content/80">Perfect for:</p>
                      <ul className="text-sm text-base-content/70 list-disc list-inside space-y-0.5">
                        <li>Facebook feed posts</li>
                        <li>LinkedIn posts</li>
                        <li>YouTube thumbnails</li>
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Wide Landscape 1.91:1 */}
                <label className="relative cursor-pointer h-full">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value="1.91:1"
                    checked={selectedAspectRatio === '1.91:1'}
                    onChange={(e) => setSelectedAspectRatio(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 rounded-xl border-2 border-base-300 bg-base-200 peer-checked:border-primary peer-checked:bg-primary/5 transition-all duration-200 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base-content">Wide</h3>
                      <span className="px-2 py-0.5 rounded bg-base-300 text-base-content text-xs font-medium">1.91:1</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-base-content/80">Perfect for:</p>
                      <ul className="text-sm text-base-content/70 list-disc list-inside space-y-0.5">
                        <li>Facebook ads</li>
                        <li>LinkedIn ads</li>
                        <li>Blog headers</li>
                      </ul>
                    </div>
                  </div>
                </label>

                {/* Custom Aspect Ratio */}
                <label className="relative cursor-pointer h-full">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value="custom"
                    checked={selectedAspectRatio === 'custom'}
                    onChange={(e) => setSelectedAspectRatio(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="p-4 rounded-xl border-2 border-base-300 bg-base-200 peer-checked:border-primary peer-checked:bg-primary/5 transition-all duration-200 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base-content">Custom</h3>
                      <span className="px-2 py-0.5 rounded bg-base-300 text-base-content text-xs font-medium">Other</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-base-content/80">Enter custom dimensions:</p>
                      <div className="flex items-center gap-2">
                        <input
                          ref={widthInputRef}
                          type="number"
                          placeholder="Width"
                          min="1"
                          className="input input-bordered input-sm w-full"
                          disabled={selectedAspectRatio !== 'custom'}
                          onChange={updateCustomRatio}
                        />
                        <span className="text-base-content/60">:</span>
                        <input
                          ref={heightInputRef}
                          type="number"
                          placeholder="Height"
                          min="1"
                          className="input input-bordered input-sm w-full"
                          disabled={selectedAspectRatio !== 'custom'}
                          onChange={updateCustomRatio}
                        />
                      </div>
                    </div>
                  </div>
                </label>

                {/* Empty div to maintain grid alignment */}
                <div className="hidden lg:block"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 