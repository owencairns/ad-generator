import { FC, useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  onImageUpload?: (files: File[]) => void;
  uploadedImages?: { url: string; file: File }[];
  isFirstMessage?: boolean;
  hasUploadedImages?: boolean;
  requestImage?: boolean | "product" | "inspiration";
  imagePrompt?: string;
  responseType?: 'text' | 'requestImage';
  readyToGenerate?: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ 
  message, 
  isUser, 
  onImageUpload, 
  uploadedImages = [],
  isFirstMessage = false,
  hasUploadedImages = false,
  requestImage = false,
  imagePrompt = '',
  responseType = 'text',
  readyToGenerate = false   
}) => {
  // Check if the message is a JSON string and extract actual content
  let formattedMessage = message;
  
  // Additional check to detect and parse JSON messages that weren't caught by the backend
  if (!isUser && typeof message === 'string') {
    // Function to recursively attempt to parse JSON strings
    const tryParseJson = (jsonString: string, depth = 0): { 
      content: string, 
      responseType?: string, 
      requestImage?: boolean | "product" | "inspiration", 
      imagePrompt?: string,
      readyToGenerate?: boolean 
    } | null => {
      if (depth > 3) return null; // Prevent infinite recursion
      
      try {
        // First try to clean the string if it has extra escaping
        let cleanJsonString = jsonString;
        // Sometimes the string comes with escaped quotes, try to fix that
        if (cleanJsonString.includes('\\"')) {
          try {
            cleanJsonString = cleanJsonString.replace(/\\"/g, '"');
          } catch (e) {
            console.log('Failed to clean JSON string:', e);
          }
        }
        
        const parsed = JSON.parse(cleanJsonString);
        
        // If this is a string that might be another JSON, try to parse it again
        if (typeof parsed === 'string' && parsed.trim().startsWith('{') && parsed.trim().endsWith('}')) {
          console.log(`Detected nested JSON at depth ${depth}, attempting to parse again`);
          const nestedResult = tryParseJson(parsed, depth + 1);
          if (nestedResult) return nestedResult;
        }
        
        // Check if this is a valid response object with content
        if (parsed && typeof parsed === 'object' && parsed.content) {
          console.log(`Successfully parsed JSON at depth ${depth}`);
          return parsed;
        }
        
        return null;
      } catch (error) {
        console.log(`Failed to parse JSON at depth ${depth}:`, error);
        
        // If we're at the first attempt, try a more aggressive approach with regex
        if (depth === 0) {
          try {
            // This is a last resort - try to extract content using regex
            const contentMatch = jsonString.match(/"content"\s*:\s*"([^"]*)"/);
            if (contentMatch && contentMatch[1]) {
              console.log('Extracted content with regex');
              return {
                content: contentMatch[1],
                responseType: "text"
              };
            }
          } catch (e) {
            console.log('Regex extraction failed:', e);
          }
        }
        
        return null;
      }
    };
    
    // Check if the message looks like a JSON object or contains JSON
    const trimmedMessage = message.trim();
    
    // Try direct JSON parsing first
    if (trimmedMessage.startsWith('{') && trimmedMessage.endsWith('}')) {
      // Try to parse it using our recursive function
      const parsedObject = tryParseJson(trimmedMessage);
      
      if (parsedObject) {
        console.log('Successfully extracted content from JSON');
        formattedMessage = parsedObject.content;
        
        // Update flags if they exist in the parsed object
        if (!responseType && parsedObject.responseType) {
          responseType = parsedObject.responseType as 'text' | 'requestImage';
        }
        
        if (parsedObject.requestImage !== undefined) {
          requestImage = parsedObject.requestImage;
        }
        
        if (!imagePrompt && parsedObject.imagePrompt) {
          imagePrompt = parsedObject.imagePrompt;
        }

        if (parsedObject.readyToGenerate !== undefined) {
          readyToGenerate = parsedObject.readyToGenerate;
        }
      } else {
        // If JSON parsing fails, attempt to clean up the raw JSON with regex
        try {
          console.log('Message appears to be JSON but could not be parsed, extracting content manually');
          // Use regex to extract content field - try multiple patterns
          const contentMatch = trimmedMessage.match(/"content"\s*:\s*"([^"]*)"/) || 
                               trimmedMessage.match(/"content"\s*:\s*'([^']*)'/) ||
                               trimmedMessage.match(/"content"\s*:\s*`([^`]*)`/) ||
                               trimmedMessage.match(/"content":\s*"([^"]*)"/);
                               
          if (contentMatch && contentMatch[1]) {
            formattedMessage = contentMatch[1];
          } else {
            // If we can't extract with regex, just strip out the JSON syntax
            formattedMessage = trimmedMessage
              .replace(/^\s*\{\s*|\s*\}\s*$/g, '') // Remove outer braces
              .replace(/"[^"]+"\s*:\s*/g, '') // Remove field names
              .replace(/,\s*/g, '\n') // Replace commas with newlines
              .replace(/["'`]/g, '') // Remove quotes
              .replace(/null|false|true/g, '') // Remove literal values
              .trim();
              
            // Final check - if the message still has JSON structure, just provide a fallback
            if (formattedMessage.includes('"content":') || formattedMessage.includes('"responseType":')) {
              formattedMessage = "I'm sorry, there was an issue with my response. Please try asking your question again.";
            }
          }
        } catch (error) {
          console.error('Failed to clean up JSON message:', error);
          formattedMessage = "I'm sorry, there was an issue with my response. Please try asking your question again.";
        }
      }
    } else if (trimmedMessage.includes('"content":') && trimmedMessage.includes('"responseType":')) {
      // The message might contain a JSON object but not be exclusively JSON
      // Try to extract just the JSON part
      const jsonMatch = trimmedMessage.match(/\{[^{]*"content":[^}]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        const parsedObject = tryParseJson(jsonMatch[0]);
        if (parsedObject) {
          console.log('Successfully extracted content from embedded JSON');
          formattedMessage = parsedObject.content;
          
          // Update flags if they exist in the parsed object
          if (!responseType && parsedObject.responseType) {
            responseType = parsedObject.responseType as 'text' | 'requestImage';
          }
          
          if (parsedObject.requestImage !== undefined) {
            requestImage = parsedObject.requestImage;
          }
          
          if (!imagePrompt && parsedObject.imagePrompt) {
            imagePrompt = parsedObject.imagePrompt;
          }

          if (parsedObject.readyToGenerate !== undefined) {
            readyToGenerate = parsedObject.readyToGenerate;
          }
        } else {
          // If still not parseable, use regex as a fallback
          const contentMatch = jsonMatch[0].match(/"content"\s*:\s*"([^"]*)"/);
          if (contentMatch && contentMatch[1]) {
            formattedMessage = contentMatch[1];
          }
        }
      }
    }
    
    // Final check for any remaining JSON-like text in the formatted message
    if (formattedMessage.startsWith('{') && formattedMessage.endsWith('}') && 
        (formattedMessage.includes('"content":') || formattedMessage.includes('"responseType":'))) {
      // It still looks like JSON, use a fallback message
      formattedMessage = "I'm sorry, there was an issue with my response. Please try asking your question again.";
    }
  }
  
  // Replace single newlines with double newlines to ensure proper markdown parsing
  formattedMessage = isUser ? formattedMessage : formattedMessage.replace(/(?<!\n)\n(?!\n)/g, '\n\n');
  
  // Check if the message is asking for an image based on responseType or fallbacks
  const isAskingForImage = !isUser && !hasUploadedImages && (
    responseType === 'requestImage' || // Primary check - use responseType
    requestImage || // Secondary check - explicit requestImage flag
    isFirstMessage  // Fallback for backward compatibility
  );

  // readyToGenerate is passed to parent components and used there
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!onImageUpload) return;
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onImageUpload(files);
    }
  }, [onImageUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onImageUpload) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImageUpload(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onImageUpload]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && <span className="hidden">{`${readyToGenerate}`}</span>}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary text-primary-content'
            : 'bg-base-200 text-base-content'
        }`}
      >
        {isUser ? (
          <div>
            <p className="whitespace-pre-wrap">{message}</p>
            {uploadedImages.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-full h-40">
                    <Image
                      src={img.url}
                      alt={`Uploaded image ${idx + 1}`}
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h3: (props) => <h3 className="text-lg font-bold mt-4 mb-2 first:mt-0" {...props} />,
                ul: (props) => <ul className="my-2 space-y-1" {...props} />,
                ol: (props) => <ol className="my-2 space-y-1" {...props} />,
                li: (props) => <li className="ml-4" {...props} />,
                p: (props) => <p className="my-2 whitespace-pre-line" {...props} />,
                strong: (props) => <strong className="font-semibold" {...props} />,
                em: (props) => <em className="italic" {...props} />,
                blockquote: (props) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-base-content/80" {...props} />
                ),
              }}
            >
              {formattedMessage}
            </ReactMarkdown>
            
            {isAskingForImage && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-3 relative group bg-base-100 rounded-lg border-2 ${isDragging ? 'border-primary' : 'border-base-300'} border-dashed overflow-hidden cursor-pointer hover:border-primary transition-colors duration-200`}
              >
                <div className="absolute inset-0 bg-base-100/0 group-hover:bg-base-100/50 transition-colors duration-200"></div>
                <div className="relative p-4 flex flex-col items-center justify-center">
                  <div className="bg-base-200 rounded-full p-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {requestImage === "inspiration" 
                      ? "Upload Inspiration Images" 
                      : "Upload Product Images"}
                  </p>
                  <p className="text-xs text-base-content/60 text-center max-w-xs mt-1">
                    {imagePrompt || `Drop ${requestImage === "inspiration" ? "inspiration" : "product"} images here or click to browse (select multiple files)`}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                </div>
              </div>
            )}
            
            {uploadedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-full h-40">
                    <Image
                      src={img.url}
                      alt={`Uploaded image ${idx + 1}`}
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 