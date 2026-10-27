import { forwardRef, useEffect, useMemo, useRef } from "react";
import { useInView } from "../hooks/useInView";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { cn } from "../lib/utils";

function mergeRefs(...refs) {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  };
}

// `inert` is a boolean attribute that React 18 and React 19 handle differently,
// so set it directly on the element to work with both.
function setInert(element, inert) {
  if (!element) return;
  if (inert) element.setAttribute("inert", "");
  else element.removeAttribute("inert");
}

/** How far, in px, the pointer moves before a press becomes a drag, so taps and clicks on links still work. */
const DRAG_THRESHOLD = 5;

/** The loop's CSS animation on the track, where the browser supports looking it up. */
function loopAnimation(track) {
  return track
    ?.getAnimations?.()
    .find((animation) => animation.animationName?.startsWith("marquee"));
}

/**
 * Content that scrolls in an endless loop: logos, quotes, brand names.
 * One CSS animation of a transform. Copies that make the loop seamless are
 * hidden from screen readers and cannot take focus; the loop stops while a
 * link inside has keyboard focus and pauses off screen. With
 * `prefers-reduced-motion` it holds still and scrolls by hand instead.
 *
 * Props:
 *  - direction     "left" | "right" | "up" | "down"
 *  - duration      seconds for the content to travel its own length
 *  - gap           CSS length between items (and between copies)
 *  - pauseOnHover  hold still while the pointer is over it
 *  - paused        hold still from outside (e.g. while a dialog is open)
 *  - fade          fade the content out at both edges
 *  - fadeAmount    how much of each edge the fade covers, in percent
 *  - repeat        copies of the content in the loop (min 2)
 *  - label         accessible name used in reduced-motion (scroll box) mode
 *  - draggable     let the pointer grab and drag the loop
 *
 * @example
 * <Marquee pauseOnHover gap="3rem">
 *   <span>Rolex</span><span>Omega</span><span>Seiko</span>
 * </Marquee>
 */
const Marquee = forwardRef(function Marquee(
  {
    direction = "left",
    duration = 20,
    gap = "1rem",
    pauseOnHover = false,
    paused = false,
    fade = true,
    fadeAmount = 10,
    repeat = 2,
    label = "Scrolling content",
    draggable = false,
    className,
    style,
    children,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClickCapture,
    onDragStart,
    ...props
  },
  ref
) {
  const [observe, inView] = useInView({ rootMargin: "100px" });
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const root = useRef(null);
  const mergedRef = useMemo(() => mergeRefs(ref, observe, root), [ref, observe]);

  // A scroll box has to be reachable from the keyboard. Set on the element, and
  // only while it is one, so the moving marquee stays out of the tab order.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (reduced) element.tabIndex = 0;
    else element.removeAttribute("tabindex");
  }, [reduced]);

  const vertical = direction === "up" || direction === "down";
  const reversed = direction === "right" || direction === "down";
  const copies = Math.max(2, Math.floor(repeat));

  const track = useRef(null);
  const drag = useRef(null);
  // Set when a drag ends, so the click the browser fires after it does not follow a link.
  const dragged = useRef(false);
  const position = (event) => (vertical ? event.clientY : event.clientX);

  // Moves the loop by `distance` px by seeking its animation. Setting the
  // time (rather than calling pause or play) keeps CSS in charge of pausing.
  const seek = (distance) => {
    const animation = loopAnimation(track.current);
    if (!animation || !track.current) return;
    const box = track.current.getBoundingClientRect();
    const length = (vertical ? box.height : box.width) / copies;
    const period = Number(animation.effect?.getComputedTiming().duration);
    if (!length || !period) return;
    // Forwards, the track moves towards the start as time runs; reversed, away from it.
    const time =
      Number(animation.currentTime ?? 0) +
      (distance / length) * period * (reversed ? 1 : -1);
    animation.currentTime = ((time % period) + period) % period;
  };

  const endDrag = (event, cancelled) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (!current.moving) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.removeAttribute("data-dragging");
    dragged.current = !cancelled;
  };

  const dragHandlers = draggable
    ? {
        onPointerDown(event) {
          onPointerDown?.(event);
          dragged.current = false;
          if (event.defaultPrevented || event.button !== 0 || drag.current) return;
          const start = position(event);
          drag.current = { pointerId: event.pointerId, start, last: start, moving: false };
        },
        onPointerMove(event) {
          onPointerMove?.(event);
          const current = drag.current;
          if (!current || current.pointerId !== event.pointerId) return;
          const now = position(event);
          if (!current.moving) {
            if (Math.abs(now - current.start) < DRAG_THRESHOLD) return;
            // Only now, so a plain click still lands on the link under the pointer.
            current.moving = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.setAttribute("data-dragging", "true");
            // Pressing a link focuses it, and focus inside pauses the loop; a drag is not a visit.
            const focused = document.activeElement;
            if (focused instanceof HTMLElement && event.currentTarget.contains(focused)) {
              focused.blur();
            }
          }
          seek(now - current.last);
          current.last = now;
        },
        onPointerUp(event) {
          onPointerUp?.(event);
          endDrag(event, false);
        },
        onPointerCancel(event) {
          onPointerCancel?.(event);
          endDrag(event, true);
        },
        onClickCapture(event) {
          onClickCapture?.(event);
          if (!dragged.current) return;
          dragged.current = false;
          event.preventDefault();
          event.stopPropagation();
        },
        // Links and images would otherwise start a native drag and steal the pointer.
        onDragStart(event) {
          onDragStart?.(event);
          event.preventDefault();
        },
      }
    : { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture, onDragStart };

  const edge = Math.min(Math.max(fadeAmount, 0), 50);
  const mask = fade
    ? `linear-gradient(to ${vertical ? "bottom" : "right"}, transparent, #000 ${edge}%, #000 ${100 - edge}%, transparent)`
    : undefined;

  return (
    <div
      ref={mergedRef}
      data-slot="marquee"
      data-direction={direction}
      data-paused={paused ? "" : undefined}
      data-draggable={draggable ? "" : undefined}
      // Still, it scrolls by hand: a named region, focusable (set above) for the keyboard.
      role={reduced ? "region" : undefined}
      aria-label={reduced ? label : undefined}
      className={cn(
        "group/marquee flex overflow-hidden motion-reduce:overflow-auto",
        vertical && "flex-col",
        // Touch pans across the loop go to the drag; the page still scrolls the other way.
        draggable && "motion-safe:cursor-grab motion-safe:select-none",
        draggable && (vertical ? "motion-safe:touch-pan-x" : "motion-safe:touch-pan-y"),
        draggable && "data-[dragging=true]:cursor-grabbing",
        className
      )}
      style={{
        "--marquee-gap": gap,
        "--marquee-copies": copies,
        maskImage: mask,
        WebkitMaskImage: mask,
        ...style,
      }}
      {...props}
      {...dragHandlers}
    >
      <div
        ref={track}
        data-slot="marquee-track"
        className={cn(
          "flex w-max shrink-0 group-focus-within/marquee:[animation-play-state:paused]",
          // Held while dragged; the drag moves it by seeking the animation.
          "group-data-[dragging=true]/marquee:[animation-play-state:paused]",
          vertical
            ? "h-max w-full flex-col motion-safe:animate-marquee-y"
            : "motion-safe:animate-marquee-x",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]"
        )}
        style={{
          // Each loop moves the track by one copy of the content.
          animationDuration: `${duration}s`,
          animationDirection: reversed ? "reverse" : undefined,
          // Inline only when held or off screen, so hover and focus can still pause it.
          animationPlayState: paused || !inView ? "paused" : undefined,
        }}
      >
        {Array.from({ length: copies }, (_, copy) => (
          <div
            key={copy}
            ref={(node) => setInert(node, copy > 0)}
            data-slot="marquee-group"
            aria-hidden={copy > 0 ? true : undefined}
            className={cn(
              "flex shrink-0 gap-[var(--marquee-gap)]",
              // Trailing space the size of the gap, so every copy is the same length and the loop has no seam.
              vertical ? "flex-col pb-[var(--marquee-gap)]" : "items-center pr-[var(--marquee-gap)]",
              copy > 0 && "motion-reduce:hidden"
            )}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Marquee;
export { Marquee };
