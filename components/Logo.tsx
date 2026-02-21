
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">
        {/* Top Face - Letter 'D' */}
        <path d="M50 5L15 25L50 45L85 25L50 5Z" fill="white" />
        <path d="M50 12L28 25L50 38L72 25L50 12Z" fill="#050505" />
        <rect x="48" y="10" width="4" height="28" transform="rotate(-60 48 10)" fill="white" />

        {/* Left Face - Letter 'S' */}
        <path d="M15 30L50 50V90L15 70V30Z" fill="white" />
        <path d="M22 40H30V48H22V40Z" fill="#050505" />
        <path d="M35 55H43V63H35V55Z" fill="#050505" />
        <path d="M22 70H43V78H22V70Z" fill="#050505" />
        
        {/* Right Face - Letter 'B' */}
        <path d="M85 30L50 50V90L85 70V30Z" fill="#00f2ff" />
        <path d="M57 40H78V48H57V40Z" fill="#050505" />
        <path d="M57 55H78V63H57V55Z" fill="#050505" />
        <path d="M57 70H78V78H57V70Z" fill="#050505" />

        {/* Isometric gaps/Styling adjustments to mimic the precise look */}
        <path d="M50 50L15 30" stroke="#050505" strokeWidth="2" />
        <path d="M50 50L85 30" stroke="#050505" strokeWidth="2" />
        <path d="M50 50V90" stroke="#050505" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default Logo;
