import * as React from "react";

interface PlayFitLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PlayFitLogo: React.FC<PlayFitLogoProps> = ({ size = "md", className = "" }) => {
  // Define tamanhos em pixels para cada opção
  const sizes = {
    sm: 56,
    md: 96,
    lg: 128,
  };
  const pixelSize = sizes[size] || sizes.md;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Triângulo estilo "play" com cantos arredondados */}
      <polygon
        points="16,13 35,24 16,35"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PlayFitLogo; 