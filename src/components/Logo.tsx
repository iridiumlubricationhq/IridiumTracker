import React, { useState } from 'react';
import logoPng from '../assets/logo.png';
import logoWebp from '../assets/logo.webp';
import logoJpg from '../assets/logo.jpg';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  // Priority order: WebP -> PNG -> JPG
  // Note: Modern browsers support WebP, but we keep PNG/JPG as fallbacks just in case
  // the specific file is missing or corrupted.
  const logos = [logoWebp, logoPng, logoJpg];
  
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.warn(`[Logo System] Failed to load logo format: ${currentLogoIndex}`);
    
    if (currentLogoIndex < logos.length - 1) {
      // Try next format
      setCurrentLogoIndex(prev => prev + 1);
    } else {
      // All formats failed
      console.error('[Logo System] All logo formats failed to load.');
      setHasError(true);
    }
  };

  if (hasError) {
    // Fallback UI if all images fail
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-2 rounded ${className}`} 
        style={{ minWidth: '100px', minHeight: '40px' }}
      >
        Logo Unavailable
      </div>
    );
  }

  return (
    <img 
      src={logos[currentLogoIndex]} 
      alt="Iridium Logo" 
      className={`object-contain ${className}`}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
}
