import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Configuration
  const LOGO_VERSION = '4'; // Increment this to bust cache
  const LOGO_BASE_PATH = 'assets/images/';
  const LOGO_FILENAME = 'logo';
  
  // Priority order for formats
  const formats = ['png', 'webp', 'jpg'];
  
  const [currentFormatIndex, setCurrentFormatIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Derived state
  const format = formats[currentFormatIndex];
  // Ensure path is constructed correctly without double slashes
  // If baseUrl ends with /, remove it before joining
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const imageSrc = `${cleanBaseUrl}/${LOGO_BASE_PATH}${LOGO_FILENAME}.${format}?v=${LOGO_VERSION}`;

  const handleError = () => {
    console.warn(`[Logo System] Failed to load logo format: ${formats[currentFormatIndex]}`);
    
    if (currentFormatIndex < formats.length - 1) {
      // Try next format
      setCurrentFormatIndex(prev => prev + 1);
    } else {
      // All formats failed
      console.error('[Logo System] All logo formats failed to load.');
      setHasError(true);
    }
  };

  if (hasError) {
    // Fallback UI if all images fail
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-2 rounded ${className}`} style={{ minWidth: '100px', minHeight: '40px' }}>
        Logo Unavailable
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt="Iridium Logo" 
      className={`object-contain ${className}`}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
}
