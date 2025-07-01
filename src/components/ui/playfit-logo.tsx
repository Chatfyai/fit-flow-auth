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
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      {/* 
        Triângulo Play Suave - baseado no design fornecido
        Os pontos foram ajustados para acomodar o efeito de bordas arredondadas
        stroke-linejoin="round" arredonda os cantos onde as linhas se encontram
        A espessura do stroke controla o raio do arredondamento
      */}
      <polygon 
        points="20,15 85,50 20,85"
        fill="#facc15"
        stroke="#facc15"
        strokeWidth="15"
        strokeLinejoin="round" 
      />
    </svg>
  );
}; 