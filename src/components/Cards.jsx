import React from "react";
import { cn } from "../lib/utils";

/**
 * Grid of image cards. Hovering (or focusing) one card highlights it while
 * the others shrink, fade and blur.
 *
 * Props:
 *  - items          { id, title, subtitle, imageUrl, href?, imagePosition? }[]
 *                   With `href` a card is a real link; without it a focusable tile.
 *  - className      extra classes for the grid
 *  - cardClassName  extra classes for each card
 */
function HoverRevealCards({ items = [], className, cardClassName }) {
  const cardClasses = cn(
    "relative block h-80 w-full cursor-pointer overflow-hidden rounded-xl bg-cover bg-center shadow-lg transition-all duration-500 ease-in-out",
    // When the grid is hovered or contains focus, every card steps back...
    "group-hover:scale-[0.97] group-hover:opacity-60 group-hover:blur-[2px]",
    "group-focus-within:scale-[0.97] group-focus-within:opacity-60 group-focus-within:blur-[2px]",
    // ...except the one being hovered/focused.
    "hover:!scale-105 hover:!opacity-100 hover:!blur-none focus-visible:!scale-105 focus-visible:!opacity-100 focus-visible:!blur-none",
    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    cardClassName
  );

  return (
    <ul className={cn("group m-0 grid w-full max-w-6xl list-none grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-4", className)}>
      {items.map((item) => {
        const style = {
          backgroundImage: `url("${item.imageUrl}")`,
          backgroundPosition: item.imagePosition ?? "center",
        };
        const content = (
          <>
            {/* Gradient overlay for text contrast */}
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <span className="absolute bottom-0 left-0 block p-6 text-left text-white">
              <span className="block text-sm font-light tracking-wide opacity-90">{item.subtitle}</span>
              <span className="mt-1 block font-heading text-3xl font-semibold leading-tight">{item.title}</span>
            </span>
          </>
        );
        return (
          <li key={item.id}>
            {item.href ? (
              <a href={item.href} className={cardClasses} style={style} aria-label={`${item.title}, ${item.subtitle}`}>
                {content}
              </a>
            ) : (
              <div tabIndex={0} className={cardClasses} style={style} aria-label={`${item.title}, ${item.subtitle}`}>
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { HoverRevealCards };
export default HoverRevealCards;
