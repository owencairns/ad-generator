import React from 'react';

const GenerationLoadingCard: React.FC<{
  template?: string;
}> = ({ template }) => {
  // Format template name for display
  const formatTemplateName = (template?: string): string => {
    if (!template) return 'custom';
    
    // Replace hyphens with spaces and capitalize each word
    return template
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="border border-base-300 bg-base-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square bg-gray-300 dark:bg-gray-700 relative flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70 font-medium text-center px-4">
            Generating {formatTemplateName(template)} ad...
          </p>
        </div>
        
        {/* Processing overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-base-300/80 p-2 flex justify-between items-center">
          <span className="text-xs font-medium">Processing</span>
          <span className="loading loading-dots loading-xs"></span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-base-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default GenerationLoadingCard;