import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 hover:shadow-lg active:shadow-inner",
        destructive:
          "bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 hover:shadow-lg",
        outline:
          "border-2 border-gray-300 bg-transparent text-foreground rounded-xl hover:border-gray-400 hover:bg-gray-50 hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 hover:shadow-md",
        ghost: "rounded-xl hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline rounded-md",
      },
      size: {
        default: "h-11 px-6 py-3 text-sm",
        sm: "h-10 px-4 py-2 text-sm rounded-lg",
        lg: "h-12 px-8 py-4 text-base rounded-xl",
        icon: "h-11 w-11 rounded-xl",
        xl: "h-14 px-10 py-5 text-lg rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="loading-spinner" />
            <span className="opacity-70">Carregando...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
