import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Base <Button> primitive with variant, size **and effect** modifiers.
 * Effect variants are **purely decorative**: they rely on Tailwind utility
 * classes (group‑hover, pseudo‑elements, keyframes…) and never interfere with
 * the existing a11y/focus styles you already have.
 *
 * Nothing changes for consumers unless they explicitly set the `effect` prop:
 *   <Button effect="shineHover">Save</Button>
 *   <Button variant="outline" icon={ArrowRight} iconPlacement="right" effect="expandIcon">Continue</Button>
 *
 * All previous behaviour of your "better" button is preserved.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      /**
       * ✨ Fancy effects (opt‑in)
       * Expand, shine, gooey… pulled from the original effects list.
       */
      effect: {
        none: "", // opt‑out (default)
        expandIcon: "group gap-0 relative",
        underline:
          "relative !no-underline after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300",
        hoverUnderline:
          "relative !no-underline after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      effect: "none",
    },
  }
)

// ——————————————————————————————————————————————————————
// Types
// ——————————————————————————————————————————————————————
interface IconProps {
  icon: React.ElementType
  iconPlacement?: "left" | "right"
}
interface IconRefProps {
  icon?: never
  iconPlacement?: never
}
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
export type ButtonIconProps = IconProps | IconRefProps

// ——————————————————————————————————————————————————————
// Component
// ——————————————————————————————————————————————————————
const Button = React.forwardRef<HTMLButtonElement, ButtonProps & ButtonIconProps>(
  (
    {
      className,
      variant,
      size,
      effect,
      icon: Icon,
      iconPlacement = "left",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"

    // Only used by the expandIcon effect
    const hasExpandableIcon = effect === "expandIcon" && Icon

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, effect, className }))}
        {...props}
      >
        {asChild ? (
          props.children
        ) : (
          <>
            {/* icon — left */}
            {Icon && iconPlacement === "left" &&
              (hasExpandableIcon ? (
                <div className="w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-100 group-hover:pr-2 group-hover:opacity-100">
                  <Icon />
                </div>
              ) : (
                <Icon />
              ))}

            {props.children}

            {/* icon — right */}
            {Icon && iconPlacement === "right" &&
              (hasExpandableIcon ? (
                <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
                  <Icon />
                </div>
              ) : (
                <Icon />
              ))}
          </>
        )}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
