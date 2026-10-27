import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Pill button: the label slides out and a filled circle expands with an arrow.
 *
 * - Renders an <a> when `href` is given (use it for navigation), otherwise a <button>.
 * - The effect also plays on keyboard focus, so it does not depend on hovering.
 * - Under `prefers-reduced-motion` the transitions are removed (see index.css) and the
 *   button simply swaps to its filled state.
 *
 * Props: text, href, className, type (buttons only, default "button"), …native props.
 */
const InteractiveHoverButton = React.forwardRef(
  ({ text = "Button", className, type = "button", href, ...props }, ref) => {
    const Comp = href ? "a" : "button";
    const elementProps = href ? { href } : { type };

    return (
      <Comp
        ref={ref}
        {...elementProps}
        className={cn(
          "group relative inline-block w-32 cursor-pointer overflow-hidden rounded-full border bg-background p-2 text-center font-semibold",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        {...props}
      >
        <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0 group-focus-visible:translate-x-12 group-focus-visible:opacity-0">
          {text}
        </span>
        <div
          aria-hidden="true"
          className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100 group-focus-visible:-translate-x-1 group-focus-visible:opacity-100"
        >
          <span>{text}</span>
          <ArrowRight className="h-4 w-4" />
        </div>
        <div
          aria-hidden="true"
          className="absolute left-[8%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-focus-visible:left-[0%] group-focus-visible:top-[0%] group-focus-visible:h-full group-focus-visible:w-full group-focus-visible:scale-[1.8]"
        />
      </Comp>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
export default InteractiveHoverButton;
