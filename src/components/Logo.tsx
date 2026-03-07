import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  // Ensure the path starts with a slash and does not have double slashes
  const imagePath = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}logo.webp?t=${Date.now()}`.replace(/\/+/g, '/');
  
  return (
    <img 
      src={imagePath} 
      alt="Iridium Logo" 
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}
