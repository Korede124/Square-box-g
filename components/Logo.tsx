
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Outer Glow Square */}
        <rect x="5" y="5" width="90" height="90" rx="12" stroke="#00f2ff" strokeWidth="2" className="animate-pulse" />
        
        {/* Main Box Body */}
        <rect x="15" y="15" width="70" height="70" rx="8" fill="#00f2ff" fillOpacity="0.1" stroke="#00f2ff" strokeWidth="4" />
        
        {/* Inner Stylized 'SBG' or Tech Shape */}
        <path d="M30 35H70V45H40V55H70V65H30V35Z" fill="#00f2ff" fillOpacity="0.2" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M45 45V55" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <path d="M55 45V55" stroke="white" strokeWidth="4" strokeLinecap="round" />
        
        {/* Corner Accents */}
        <path d="M15 30V15H30" stroke="white" strokeWidth="2" />
        <path d="M70 15H85V30" stroke="white" strokeWidth="2" />
        <path d="M85 70V85H70" stroke="white" strokeWidth="2" />
        <path d="M30 85H15V70" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default Logo;
