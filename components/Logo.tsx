import React from 'react';

interface LogoProps {
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10",
  primaryColor = "white",
  secondaryColor = "#00f2ff"
}) => {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_25px_rgba(0,242,255,0.7)]">
        {/* Isometric Cube Logo - SBG */}
        
        {/* Left Face - 'S' (White) */}
        <path 
          d="M10 30 L50 50 V56 L16 39 V49 L50 66 V72 L16 55 V65 L50 82 V90 L10 70 Z" 
          fill={primaryColor} 
        />

        {/* Right Face - 'B' (Cyan) */}
        <path 
          fillRule="evenodd" 
          d="M50 50 L90 30 V70 L50 90 Z M57 47 L83 35 V43 L57 56 Z M57 63 L83 51 V59 L57 72 Z" 
          fill={secondaryColor} 
        />

        {/* Top Face - 'G' (White) */}
        <path 
          fillRule="evenodd" 
          d="M50 10 L90 30 L50 50 L10 30 Z M24 26 L50 39 L76 26 L50 13 Z" 
          fill={primaryColor} 
        />
        {/* The G bar */}
        <path d="M50 39 L70 29" stroke={primaryColor} strokeWidth="14" strokeLinecap="square" />
      </svg>
    </div>
  );
};

export default Logo;
