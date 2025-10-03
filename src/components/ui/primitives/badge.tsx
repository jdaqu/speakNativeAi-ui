import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        // Grammar and language-specific variants
        "grammar-error":
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        // Part of speech variants
        noun:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        verb:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        adjective:
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200",
        adverb:
          "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200",
        preposition:
          "border-transparent bg-pink-100 text-pink-800 hover:bg-pink-200",
        pronoun:
          "border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
        conjunction:
          "border-transparent bg-teal-100 text-teal-800 hover:bg-teal-200",
        interjection:
          "border-transparent bg-rose-100 text-rose-800 hover:bg-rose-200",
        // Formality levels
        formal:
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200",
        informal:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        neutral:
          "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200",
        // Difficulty levels
        easy:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        medium:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        hard:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        className={cn(badgeVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants } 