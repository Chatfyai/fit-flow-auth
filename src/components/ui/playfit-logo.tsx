import React from 'react';

interface PlayFitLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayFitLogo: React.FC<PlayFitLogoProps> = ({ 
  className = "", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      <defs>
        <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      
      {/* Botão Play ocupando todo o espaço */}
      <path
        d="M8 6L8 34L32 20L8 6Z"
        fill="url(#yellowGradient)"
        stroke="url(#yellowGradient)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      
      {/* Sombra interna para profundidade */}
      <path
        d="M12 12L12 28L28 20L12 12Z"
        fill="#fbbf24"
        opacity="0.8"
      />
    </svg>
  );
}; 