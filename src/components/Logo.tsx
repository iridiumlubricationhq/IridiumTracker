import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12" }) => {
  return (
    <img
      src="/logo.webp"
      alt="Iridium"
      className={`${className} object-contain`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};
