import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Category card with a stack of images that fans out on hover / keyboard focus.
 *
 * Props:
 *  - title        string
 *  - images       string[]                       image URLs (3 looks best)
 *  - stats        { icon: ReactNode, label }[]   small facts under the images
 *  - description  string
 *  - href         string
 *  - className    string
 */
const AnimatedCategoryCard = React.forwardRef(
  ({ title, images = [], stats = [], description, href = "#", className }, ref) => {
    // The fan-out is driven by state + inline transforms. The original mixed an inline
    // `transform` with Tailwind hover transforms, which override each other, so the
    // hover animation never played reliably.
    const [active, setActive] = React.useState(false);

    return (
      <a
        ref={ref}
        href={href}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        className={cn(
          "group relative block w-full max-w-sm cursor-pointer rounded-2xl border bg-card p-6 text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg lg:max-w-md",
          className
        )}
        aria-label={`Learn more about ${title}`}
      >
        <div className="flex flex-col">
          {/* Header: title and arrow */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tighter">{title}</h2>
            <ArrowRight className="h-6 w-6 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
          </div>

          {/* Stacked images */}
          <div className="relative mb-6 h-32">
            {images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="absolute left-0 top-0 h-full w-[40%] overflow-hidden rounded-lg border-2 border-background shadow-md transition-transform duration-300 ease-in-out"
                style={{
                  transform: active
                    ? `translateX(${index * 80}px) rotate(${index * 5 - 5}deg)`
                    : `translateX(${index * 32}px)`,
                  zIndex: images.length - index,
                }}
              >
                <img
                  src={src}
                  alt={`${title} view ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="mb-4 flex items-center space-x-4 text-sm text-muted-foreground">
              {stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="flex items-center space-x-1.5">
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </a>
    );
  }
);

AnimatedCategoryCard.displayName = "AnimatedCategoryCard";

// Backwards-compatible alias: the original component was called AnimatedHikeCard.
const AnimatedHikeCard = AnimatedCategoryCard;

export { AnimatedCategoryCard, AnimatedHikeCard };
export default AnimatedCategoryCard;
