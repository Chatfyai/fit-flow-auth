import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  value?: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "gradient" | "success" | "warning"
  showLabel?: boolean
  label?: string
  className?: string
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value = 0,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  label,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  }
  
  const variantClasses = {
    default: "progress-fill",
    gradient: "progress-fill",
    success: "bg-green-500",
    warning: "bg-yellow-500"
  }

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || "Progresso"}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn("progress-bar", sizeClasses[size])}>
        <div
          className={cn(
            variantClasses[variant],
            "transition-all duration-500 ease-out"
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progresso: ${Math.round(percentage)}%`}
        />
      </div>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "light"
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "default",
  className
}) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3"
  }
  
  const variantClasses = {
    default: "border-gray-300 border-t-gray-600",
    primary: "border-primary/20 border-t-primary",
    light: "border-white/20 border-t-white"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-solid",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Carregando"
    />
  )
}

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  completedSteps?: number[]
  className?: string
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = completedSteps.includes(index)
        const isAccessible = index <= currentStep
        
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ease-out",
                  {
                    "gradient-bg text-primary-foreground shadow-md": isActive,
                    "bg-primary text-primary-foreground": isCompleted,
                    "bg-gray-200 text-gray-500": !isAccessible && !isCompleted,
                    "bg-gray-100 text-gray-600 border-2 border-gray-300": isAccessible && !isActive && !isCompleted
                  }
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                "mt-2 text-xs font-medium text-center max-w-20",
                {
                  "text-primary": isActive,
                  "text-gray-900": isCompleted,
                  "text-gray-500": !isAccessible
                }
              )}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all duration-300 ease-out",
                  {
                    "bg-primary": index < currentStep || completedSteps.includes(index + 1),
                    "bg-gray-200": index >= currentStep && !completedSteps.includes(index + 1)
                  }
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
} 