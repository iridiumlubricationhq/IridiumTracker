import React from 'react';
import logo from '/logo.webp';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12" }) => {
  return (
    <img
      src={logo}
      alt="Iridium"
      className={`${className} object-contain`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};
