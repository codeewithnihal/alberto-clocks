import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, Minus, Plus, X } from "lucide-react";
import { formatPrice, cleanSpec, isUnverifiedSpec } from "../lib/format";
import { useCart, MAX_QTY } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useRouter } from "../lib/router";

const SPEC_LABELS = {
  movement: "Movement",
  caseMaterial: "Case",
  strapMaterial: "Strap",
  waterResistance: "Water resistance",
  glass: "Glass",
};

/**
 * Product detail modal popup window.
 * Displays complete watch specifications, image gallery, price, and purchase actions.
 * Traps keyboard focus, isolates background content, and respects user motion preferences.
 */
export default function ProductDetailModal({ product, category, onClose, triggerElement }) {
  const modalRef = useRef(null);
  const closeRef = useRef(null);
  const triggerRef = useRef(triggerElement || null);
  const router = useRouter();

  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();

  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product?.images?.length
    ? product.images.map((img) => img.largeUrl || img.thumbUrl)
    : [product?.imageUrl].filter(Boolean);

  const wished = product ? wishlist.has(product.id) : false;
  const specEntries = product?.specifications ? Object.entries(product.specifications) : [];
  const validSpecs = specEntries.filter(([, val]) => !isUnverifiedSpec(val));

  useEffect(() => {
    // Record opener element if not explicitly passed
    if (!triggerRef.current && document.activeElement) {
      triggerRef.current = document.activeElement;
    }

    // Isolate background content from screen readers and keyboard navigation
    const rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.setAttribute("aria-hidden", "true");
      rootEl.setAttribute("inert", "");
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close control on open
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const modal = modalRef.current;
        if (!modal) return;
        const focusables = modal.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modal.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modal.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      if (rootEl) {
        rootEl.removeAttribute("aria-hidden");
        rootEl.removeAttribute("inert");
      }
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);

      // Restore focus to opener element
      const target = triggerRef.current;
      if (target && typeof target.focus === "function") {
        setTimeout(() => target.focus(), 0);
      }
    };
  }, [onClose]);

  if (!product || typeof document === "undefined") return null;

  const handleAddToCart = () => {
    cart.add(product.id, qty);
    toast.push({
      variant: "success",
      title: "Added to cart",
      description: `${qty} × ${product.name}`,
    });
  };

  const handleToggleWishlist = () => {
    wishlist.toggle(product.id);
    toast.push({
      variant: "info",
      title: !wished ? "Added to wishlist" : "Removed from wishlist",
      description: product.name,
    });
  };

  const handleFullPageClick = (e) => {
    e.preventDefault();
    onClose();
    router.navigate(`/product/${product.id}`);
  };

  return createPortal(
    <div
      className="product-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="product-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="product-modal-close"
          aria-label="Close watch details popup"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="product-modal-body">
          {/* Gallery side */}
          <div className="product-modal-gallery">
            <div className="product-modal-main-img">
              <img
                src={images[activeImageIndex] || product.imageUrl}
                alt={`${product.name} preview`}
                className="product-modal-img"
              />
            </div>
            {images.length > 1 && (
              <div className="product-modal-thumbs">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`product-modal-thumb-btn ${idx === activeImageIndex ? "is-active" : ""}`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details side */}
          <div className="product-modal-info">
            <div className="product-modal-header">
              {category?.name && (
                <span className="product-modal-category">{category.name}</span>
              )}
              <h2 id="product-modal-title" className="product-modal-name">
                {product.name}
              </h2>
              <p className="product-modal-price">
                {formatPrice(product.price, product.currency)}
              </p>
            </div>

            {product.description && (
              <p className="product-modal-desc">{product.description}</p>
            )}

            {/* Specifications */}
            {validSpecs.length > 0 && (
              <div className="product-modal-specs">
                <h3 className="product-modal-specs-title">Specifications</h3>
                <dl className="product-modal-specs-list">
                  {validSpecs.map(([key, val]) => (
                    <div key={key} className="product-modal-spec-row">
                      <dt>{SPEC_LABELS[key] ?? key}</dt>
                      <dd>{cleanSpec(val)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Actions */}
            <div className="product-modal-actions">
              <div className="stepper" aria-label="Quantity">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <output aria-live="polite">{qty}</output>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                  disabled={qty >= MAX_QTY}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`wish-button ${wished ? "is-on" : ""}`}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wished}
              >
                <Heart size={16} fill={wished ? "currentColor" : "none"} aria-hidden="true" />
                <span>{wished ? "Saved" : "Save"}</span>
              </button>
            </div>

            <div className="product-modal-buttons">
              <InteractiveHoverButton
                text="Add to cart"
                className="w-full"
                onClick={handleAddToCart}
              />
              <a
                href={`/product/${product.id}`}
                onClick={handleFullPageClick}
                className="product-modal-page-link"
              >
                View full product page →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
