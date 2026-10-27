import { useRouter } from "../lib/router";
import { assetUrl } from "../lib/assets";

/**
 * Cinematic Gold Reveal page transition.
 *
 * Phase "cover":  a golden line draws diagonally from the top-left to the bottom-right corner, the ink-black
 *                 panel follows it, then the logo fades in.
 * Phase "reveal": the new page is already underneath; the panel opens along the same diagonal with the gold line. The overlay is removed (unmounted) as soon as the animation ends,
 *                 so it can never block clicks afterwards. Not rendered at all with reduced motion
 *                 (the router then swaps pages instantly).
 */
export default function GoldReveal() {
  const { transition } = useRouter();
  if (transition === "idle") return null;
  return (
    <div className="gold-reveal" data-phase={transition} aria-hidden="true">
      <div className="gold-reveal__panel" />
      <div className="gold-reveal__line" />
      <img className="gold-reveal__mark" src={assetUrl("brand/logo-mark.webp")} alt="" width="96" height="93" />
    </div>
  );
}
