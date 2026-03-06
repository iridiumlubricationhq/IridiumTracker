import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  // Ensure we don't get double slashes if baseUrl is '/'
  const imagePath = `${baseUrl === '/' ? '' : baseUrl}/logo.webp`;
  
  return (
    <img 
      src={imagePath} 
      alt="Iridium Logo" 
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}
