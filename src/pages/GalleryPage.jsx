import { Component, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import SafeImage from "../components/SafeImage";
import PageHeader, { Breadcrumb } from "../features/PageHeader";
import { useRouter } from "../lib/router";
import { plural } from "../lib/format";

function Lightbox({ items, index, onClose, onMove }) {
  const item = items[index];
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onMove(-1);
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "Tab") {
        // keep focus inside the dialog
        const nodes = [...document.querySelectorAll(".lightbox button, .lightbox a")];
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onMove]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button type="button" ref={closeRef} className="lightbox__close" onClick={onClose} aria-label="Close">
        <X size={22} aria-hidden="true" />
      </button>
      <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => onMove(-1)} aria-label="Previous image">
        <ChevronLeft size={26} aria-hidden="true" />
      </button>
      <figure>
        <img src={item.src} alt={item.alt} />
        <figcaption>
          <strong>{item.title}</strong>
          <span>{item.caption}</span>
          {item.href && <a href={item.href} onClick={onClose}>View details</a>}
        </figcaption>
      </figure>
      <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => onMove(1)} aria-label="Next image">
        <ChevronRight size={26} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Level 3: one watch, all of its images – main viewer, thumbnails, fullscreen lightbox. */
function ModelGallery({ data, product, siblings }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);
  const total = product.images.length;
  const category = data.categoryById.get(product.categoryId);
  const go = useCallback((d) => setIndex((i) => (i + d + total) % total), [total]);

  useEffect(() => {
    setIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (zoom) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, zoom]);

  // warm the next / previous image so arrow clicks feel instant
  useEffect(() => {
    [1, -1].forEach((d) => {
      const img = new Image();
      img.src = product.images[(index + d + total) % total].largeUrl;
    });
  }, [index, product, total]);

  const items = product.images.map((image, i) => ({
    id: `${product.id}-${i}`,
    src: image.largeUrl,
    title: product.name,
    caption: `${category?.name} · ${formatPrice(product.price, product.currency)} · image ${i + 1} of ${total}`,
    alt: `${product.name} – image ${i + 1} of ${total}`,
    href: `#/product/${product.id}`,
  }));
  const image = product.images[index];
  const pos = siblings.findIndex((p) => p.id === product.id);
  const prev = siblings[(pos - 1 + siblings.length) % siblings.length];
  const next = siblings[(pos + 1) % siblings.length];

  return (
    <div className="gal-model">
      <div className="gal-viewer">
        <div
          className="gal-viewer__stage"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          }}
        >
          <button type="button" className="gal-viewer__main" onClick={() => setZoom(true)} aria-label={`Enlarge ${items[index].alt}`}>
            <SafeImage key={image.largeUrl} src={image.largeUrl} alt={items[index].alt} width={image.width} height={image.height} decoding="async" />
          </button>
          {total > 1 && (
            <>
              <button type="button" className="gal-viewer__nav gal-viewer__nav--prev" onClick={() => go(-1)} aria-label="Previous image">
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              <button type="button" className="gal-viewer__nav gal-viewer__nav--next" onClick={() => go(1)} aria-label="Next image">
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            </>
          )}
          <span className="gal-viewer__count" aria-live="polite">{index + 1} / {total}</span>
        </div>
        {total > 1 && (
          <ul className="gal-thumbs" aria-label={`${product.name} images`}>
            {product.images.map((img, i) => (
              <li key={img.thumbUrl}>
                <button type="button" className={i === index ? "is-active" : undefined} aria-current={i === index} onClick={() => setIndex(i)} aria-label={`Show image ${i + 1} of ${total}`}>
                  <SafeImage src={img.thumbUrl} alt={`Image ${i + 1}`} loading="lazy" decoding="async" width="96" height="96" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <aside className="gal-info">
        <h2 className="t-h2">{product.name}</h2>
        <p className="muted">{category?.name}</p>
        <p className="gal-info__price">{formatPrice(product.price, product.currency)}</p>
        <a className="text-link" href={`#/product/${product.id}`}>View details</a>
        <div className="gal-info__pager">
          <a href={`#/gallery?category=${product.categoryId}&model=${prev.id}`} aria-label={`Previous model: ${prev.name}`}><ChevronLeft size={16} aria-hidden="true" /> {prev.name}</a>
          <a href={`#/gallery?category=${product.categoryId}&model=${next.id}`} aria-label={`Next model: ${next.name}`}>{next.name} <ChevronRight size={16} aria-hidden="true" /></a>
        </div>
      </aside>
      {zoom && <Lightbox items={items} index={index} onClose={() => setZoom(false)} onMove={go} />}
    </div>
  );
}

function ModelGrid({ models, categoryId }) {
  return (
    <ul className="gal-grid gal-grid--models">
      {models.map((p) => (
        <li key={p.id}>
          <a className="gal-card" href={`#/gallery?category=${categoryId}&model=${p.id}`}>
            <span className="gal-card__media"><SafeImage src={p.images[0].thumbUrl} alt={`${p.name} preview`} loading="lazy" decoding="async" width="320" height="320" /></span>
            <span className="gal-card__body">
              <strong>{p.name}</strong>
              <small>{plural(p.images.length, "image", "images")}</small>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Gallery({ data }) {
  const { query } = useRouter();
  const category = data.categoryById.get(query.category);
  const list = category ? data.productsByCategory.get(category.id) ?? [] : [];
  const product = category ? list.find((p) => p.id === query.model) : undefined;

  // keep the view at the top when moving between levels
  useEffect(() => {
    window.scrollTo?.({ top: 0 });
  }, [category?.id, product?.id]);

  const crumbs = [{ label: "Gallery", to: category ? "/gallery" : undefined }];
  if (category) crumbs.push({ label: category.name, to: product ? `/gallery?category=${category.id}` : undefined });
  if (product) crumbs.push({ label: product.name });

  return (
    <div className="page">
      <PageHeader title="Gallery" intro="Every collection cover and every angle of every watch. Select an image to enlarge it." />
      {category && <Breadcrumb items={crumbs} />}

      {!product && (
        <nav className="gal-filters" aria-label="Gallery categories">
          <a href="#/gallery" aria-current={!category ? "page" : undefined}>All</a>
          {data.categories.map((c) => (
            <a key={c.id} href={`#/gallery?category=${c.id}`} aria-current={category?.id === c.id ? "page" : undefined}>{c.name}</a>
          ))}
        </nav>
      )}

      {!category &&
        data.categories.map((c) => {
          const models = data.productsByCategory.get(c.id) ?? [];
          const images = models.reduce((n, p) => n + p.images.length, 0);
          return (
            <section key={c.id} className="gal-section" aria-labelledby={`gal-${c.id}`}>
              <div className="gal-section__head">
                <h2 className="t-h2" id={`gal-${c.id}`}>{c.name}</h2>
                <a className="text-link" href={`#/gallery?category=${c.id}`}>{plural(models.length, "model", "models")} · {plural(images, "image", "images")}</a>
              </div>
              <ModelGrid models={models} categoryId={c.id} />
            </section>
          );
        })}

      {category && !product && (
        <section className="gal-section" aria-labelledby={`gal-${category.id}`}>
          <h2 className="t-h2" id={`gal-${category.id}`}>{category.name}</h2>
          <ModelGrid models={list} categoryId={category.id} />
        </section>
      )}

      {product && <ModelGallery data={data} product={product} siblings={list} />}
    </div>
  );
}

/** Safety net: a problem inside the gallery shows a way back instead of a blank screen. */
class GalleryBoundary extends Component {
  state = { failed: false, message: "" };
  static getDerivedStateFromError(error) { return { failed: true, message: String(error?.message ?? error) }; }
  componentDidCatch(error) { console.error("Gallery error:", error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="state-card" role="alert">
        <h2 className="t-h2">Gallery</h2>
        {import.meta.env.DEV && <p className="muted" style={{ maxWidth: "40rem", wordBreak: "break-word" }}>{this.state.message}</p>}
        <a className="text-link" href="#/gallery" onClick={() => this.setState({ failed: false })}>Back to gallery</a>
      </div>
    );
  }
}

export default function GalleryPage() {
  useDocumentTitle("Gallery");
  return <GalleryBoundary><CatalogGate>{(data) => <Gallery data={data} />}</CatalogGate></GalleryBoundary>;
}
