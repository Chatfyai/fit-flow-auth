import * as React from "react";

interface PlayFitLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PlayFitLogo: React.FC<PlayFitLogoProps> = ({ size = "md", className = "" }) => {
  // Define tamanhos em pixels para cada opção
  const sizes = {
    sm: 24,
    md: 36,
    lg: 48,
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
      {/* Triângulo estilo "play" */}
      <polygon
        points="16,12 36,24 16,36"
        fill="currentColor"
      />
      {/* Círculo de fundo */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
};

export default PlayFitLogo;
