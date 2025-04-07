import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Analyzing your product images...",
    "Crafting the perfect composition...",
    "Generating creative concepts...",
    "Adding artistic touches...",
    "Perfecting the details...",
    "Almost ready..."
];

export default function GenerationLoadingState() {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isMessageVisible, setIsMessageVisible] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Start entrance animation
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        // Message transition timing
        const messageInterval = setInterval(() => {
            setIsMessageVisible(false);
            
            // Wait for fade out, then change message
            setTimeout(() => {
                setCurrentMessageIndex((prev) => 
                    prev === loadingMessages.length - 1 ? prev : prev + 1
                );
                setIsMessageVisible(true);
            }, 500); // Half a second for fade out
            
        }, 3000); // Show each message for 3 seconds

        return () => clearInterval(messageInterval);
    }, []);

    return (
        <div 
            className={`min-h-screen bg-base-100 flex flex-col items-center justify-center transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transformOrigin: 'center' }}
        >
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto px-4">
                {/* Logo or Brand Icon */}
                <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Spinner */}
                <div className="relative">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse"></div>
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>

                {/* Message */}
                <div className="h-8 flex items-center justify-center">
                    <p 
                        className={`text-lg text-base-content/80 text-center transition-opacity duration-500 ${
                            isMessageVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {loadingMessages[currentMessageIndex]}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-2 bg-base-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{
                            width: `${((currentMessageIndex + 1) / loadingMessages.length) * 100}%`
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
} 