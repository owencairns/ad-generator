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
        className={`group bg-base-100 rounded-2xl overflow-hidden border border-base-300 hover:cursor-pointer hover:border-primary transition-all duration-300 ${className}`}
      >
        <div className="relative aspect-square bg-base-200">
          <Image
            src={template.image}
            alt={template.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-base-content mb-2">{template.name}</h3>
          <p className="text-sm text-base-content/70 mb-3">{template.description}</p>
          <div className="flex flex-wrap gap-2">
            {template.platforms.map((platform) => (
              <span key={platform} className="px-2 py-1 bg-base-200 rounded-full text-xs font-medium text-base-content/70">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push(`/generate/templates/${template.id}`)}
      className={`group relative bg-base-100 rounded-3xl overflow-hidden border border-base-300 hover:cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 h-[800px] flex flex-col ${className}`}
    >
      {/* Template Preview */}
      <div className="w-full h-auto">
        <div className="relative aspect-[9/16] bg-base-200">
          <Image
            src={template.image}
            alt={template.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Sliding Info Panel */}
      <div className="absolute inset-x-0 bottom-0 bg-base-100 group-hover:translate-y-0 translate-y-[70%] transition-transform duration-300">
        {/* Basic Info - Always Visible */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-base-content mb-2">{template.name}</h3>
          <p className="text-base-content/70">{template.description}</p>
        </div>

        {/* Extended Info - Revealed on Hover */}
        <div className="px-6 pb-6">
          {/* Details Grid */}
          <div className="grid gap-4">
            {/* Platforms */}
            <div className="flex flex-wrap gap-2">
              {template.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-base-200 rounded-full text-xs font-medium text-base-content/70"
                >
                  {platform}
                </span>
              ))}
            </div>

            {/* Features */}
            {template.features && (
              <div className="space-y-1">
                {template.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-base-content/70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            )}

            {/* Best For Tags */}
            {template.bestFor && (
              <div className="flex flex-wrap gap-2 pt-2">
                {template.bestFor.map((use) => (
                  <span
                    key={use}
                    className="px-3 py-1 bg-primary/5 rounded-full text-xs font-medium text-primary"
                  >
                    {use}
                  </span>
                ))}
              </div>
            )}

            {/* Use Template Button */}
            <div className="pt-4 border-t border-base-200">
              <span className="text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Use Template
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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