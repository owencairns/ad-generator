import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  platforms: string[];
  features?: string[];
  bestFor?: string[];
}

interface TemplateCardProps {
  template: Template;
  variant?: 'compact' | 'full';
  className?: string;
}

export default function TemplateCard({ template, variant = 'full', className = '' }: TemplateCardProps) {
  const router = useRouter();

  if (variant === 'compact') {
    return (
      <button
        onClick={() => router.push(`/generate/templates/${template.id}`)}
        className={`group bg-base-100 rounded-xl overflow-hidden border border-base-200 hover:cursor-pointer hover:shadow-lg hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full ${className}`}
      >
        <div className="relative h-64 w-full bg-gradient-to-b from-primary/10 to-transparent overflow-hidden">
          <Image
            src={template.image}
            alt={template.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-base-100/20 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          
          {/* New badge in top corner */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-content text-xs font-medium rounded-lg shadow-md ring-1 ring-white/10">
            Template
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-bold text-lg text-base-content mb-2 group-hover:text-primary transition-colors duration-300">{template.name}</h3>
          <p className="text-sm text-base-content/60 mb-4 line-clamp-2">{template.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {template.platforms.slice(0, 3).map((platform) => (
              <span key={platform} className="px-2.5 py-1 bg-secondary/5 dark:bg-secondary/20 rounded-full text-xs font-medium text-secondary">
                {platform}
              </span>
            ))}
            {template.platforms.length > 3 && (
              <span className="px-2.5 py-1 bg-base-200 rounded-full text-xs font-medium text-base-content/70">
                +{template.platforms.length - 3} more
              </span>
            )}
          </div>
          
          {/* Use button */}
          <div className="mt-auto pt-2 border-t border-base-200">
            <span className="inline-flex items-center justify-center w-full gap-2 py-2 mt-2 text-sm font-medium text-primary group-hover:text-primary-content bg-primary/10 dark:bg-primary/20 group-hover:bg-primary rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300">
              Use Template
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push(`/generate/templates/${template.id}`)}
      className={`group relative bg-base-100 rounded-2xl overflow-hidden border border-base-200 hover:cursor-pointer hover:translate-y-[-6px] hover:shadow-xl transition-all duration-300 h-[800px] flex flex-col ${className}`}
    >
      {/* Template Preview with Brand Overlay */}
      <div className="w-full h-auto relative">
        <div className="absolute top-0 left-0 w-full z-10 p-4 flex justify-between items-start">
          <div className="px-3 py-1.5 bg-primary text-primary-content text-sm font-medium rounded-lg shadow-md ring-1 ring-white/10">
            Premium Template
          </div>
          <div className="h-10 w-10 flex items-center justify-center bg-base-100/80 backdrop-blur-sm rounded-full shadow-md text-primary ring-1 ring-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
        </div>
        
        <div className="relative aspect-[9/16] bg-gradient-to-b from-primary/10 to-transparent overflow-hidden">
          <Image
            src={template.image}
            alt={template.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-base-100/70 via-base-100/20 to-transparent opacity-40 dark:opacity-30"></div>
        </div>
      </div>

      {/* Sliding Info Panel - Repositioned for better visibility */}
      <div className="absolute inset-x-0 bottom-0 bg-base-100/95 backdrop-blur-md group-hover:translate-y-0 translate-y-[65%] transition-transform duration-300 shadow-lg rounded-t-3xl border-t border-primary/10 dark:border-primary/25 dark:bg-base-100/90">
        {/* Basic Info - Always Visible */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors duration-300">{template.name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-accent text-sm font-medium">5.0</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <p className="text-base-content/70 text-sm">{template.description}</p>
        </div>

        {/* Extended Info - Revealed on Hover */}
        <div className="px-6 pb-6">
          {/* Details Grid */}
          <div className="grid gap-5">
            {/* Platforms */}
            <div>
              <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {template.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="px-3 py-1.5 bg-secondary/5 dark:bg-secondary/20 rounded-lg text-xs font-medium text-secondary inline-flex items-center gap-1.5"
                  >
                    {platform === 'Instagram' && (
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    {platform === 'Facebook' && (
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                      </svg>
                    )}
                    {platform === 'TikTok' && (
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    )}
                    {platform === 'Pinterest' && (
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                      </svg>
                    )}
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* Features with better styling */}
            {template.features && (
              <div>
                <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">Features</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {template.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-base-content/80">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best For Tags */}
            {template.bestFor && (
              <div>
                <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">Best For</h4>
                <div className="flex flex-wrap gap-2">
                  {template.bestFor.map((use) => (
                    <span
                      key={use}
                      className="px-3 py-1.5 bg-primary/5 dark:bg-primary/20 rounded-lg text-xs font-medium text-primary"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Use Template Button - More prominent */}
            <div className="pt-4 border-t border-base-200 dark:border-base-200/50">
              <span className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-primary text-primary-content font-medium rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                Use This Template
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
} 