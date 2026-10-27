import { useCallback, useEffect, useRef, useState } from "react";
import SafeImage from "../components/SafeImage";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Product image gallery: large main image, clickable thumbnails, previous/next,
 * swipe, and zoom.
 *
 * - Images are never cropped (object-fit: contain) and never stretched.
 * - The main image is the 1400 px version; zoom swaps in the untouched original.
 * - Zoom: click the image or the zoom button, move the pointer (or drag) to pan, Esc to leave.
 * - Keyboard: arrows on the thumbnail row, Enter/Space to select, Esc exits zoom.
 */
export default function ProductGallery({ name, images }) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const swipe = useRef({ x: 0, moved: false });
  const thumbs = useRef([]);

  const select = useCallback(
    (next) => {
      setIndex(((next % count) + count) % count);
      setZoom(false);
    },
    [count]
  );

  // Warm the cache with the neighbouring images so switching feels instant.
  useEffect(() => {
    [index + 1, index - 1].forEach((n) => {
      const image = images[((n % count) + count) % count];
      new Image().src = image.largeUrl;
    });
  }, [index, images, count]);

  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (event) => event.key === "Escape" && setZoom(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom]);

  const current = images[index];
  const pan = (event) => {
    if (!zoom) return;
    const box = event.currentTarget.getBoundingClientRect();
    setOrigin({
      x: Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - box.top) / box.height) * 100)),
    });
  };

  const onThumbKey = (event, i) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (i + delta + count) % count;
    select(next);
    thumbs.current[next]?.focus();
  };

  return (
    <div className="pdp-gallery">
      <div
        className={`pdp-gallery__frame${zoom ? " is-zoomed" : ""}`}
        onPointerDown={(e) => {
          swipe.current = { x: e.clientX, moved: false };
          pan(e);
        }}
        onPointerMove={(e) => {
          if (Math.abs(e.clientX - swipe.current.x) > 8) swipe.current.moved = true;
          pan(e);
        }}
        onPointerUp={(e) => {
          const dx = e.clientX - swipe.current.x;
          if (!zoom && Math.abs(dx) > 50) select(index + (dx < 0 ? 1 : -1));
        }}
        onClick={() => {
          if (!swipe.current.moved) setZoom((z) => !z);
        }}
      >
        <SafeImage
          key={index}
          className="pdp-gallery__img"
          src={zoom ? current.srcUrl : current.largeUrl}
          alt={`${name} – image ${index + 1} of ${count}`}
          width={current.width}
          height={current.height}
          decoding="async"
          draggable={false}
          style={zoom ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
        />
        <button type="button" className="pdp-gallery__nav pdp-gallery__nav--prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); select(index - 1); }}>
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <button type="button" className="pdp-gallery__nav pdp-gallery__nav--next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); select(index + 1); }}>
          <ChevronRight size={22} aria-hidden="true" />
        </button>
        <button type="button" className="pdp-gallery__zoom" aria-pressed={zoom} aria-label={zoom ? "Zoom out" : "Zoom in"} onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}>
          {zoom ? <ZoomOut size={18} aria-hidden="true" /> : <ZoomIn size={18} aria-hidden="true" />}
        </button>
        <p className="pdp-gallery__count" aria-live="polite">
          {index + 1} / {count}
        </p>
      </div>

      <ul className="pdp-gallery__thumbs" aria-label={`${name} images`}>
        {images.map((image, i) => (
          <li key={image.src}>
            <button
              ref={(el) => (thumbs.current[i] = el)}
              type="button"
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              tabIndex={i === index ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onThumbKey(e, i)}
            >
              <SafeImage src={image.thumbUrl} alt={`Image ${i + 1}`} width={160} height={Math.round((160 * image.height) / image.width)} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
