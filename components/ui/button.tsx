import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        pastel: "bg-pastel-blue/40 border-2 border-pastel-border-blue hover:bg-pastel-blue text-pastel-text-blue transition-colors shadow-sm font-bold",
        "pastel-blue": "bg-pastel-blue/40 border-2 border-pastel-border-blue hover:bg-pastel-blue text-pastel-text-blue transition-colors shadow-sm font-bold",
        "pastel-green": "bg-pastel-green/40 border-2 border-pastel-border-green hover:bg-pastel-green text-pastel-text-green transition-colors shadow-sm font-bold",
        "pastel-amber": "bg-pastel-amber/40 border-2 border-pastel-border-amber hover:bg-pastel-amber text-pastel-text-amber transition-colors shadow-sm font-bold",
        "pastel-purple": "bg-pastel-purple/40 border-2 border-pastel-border-purple hover:bg-pastel-purple text-pastel-text-purple transition-colors shadow-sm font-bold",
        "pastel-rose": "bg-pastel-rose/40 border-2 border-pastel-border-rose hover:bg-pastel-rose text-pastel-text-rose transition-colors shadow-sm font-bold",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 px-2 text-[10px] rounded-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-sm",
        xl: "h-12 rounded-lg px-8 text-base font-semibold",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
