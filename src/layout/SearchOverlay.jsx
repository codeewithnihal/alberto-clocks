import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import SearchComponent from "../components/SearchFilterBar";
import { useCatalogState } from "../context/CatalogContext";
import { cleanSpec, formatPrice } from "../lib/format";

/**
 * Instant search: an overlay opened from the navbar icon. Searches the catalogue that is
 * already loaded (data.json) – name, collection, movement, description, model number and price –
 * and updates as you type. No page navigation until a result is opened.
 */
export default function SearchOverlay({ open, onClose }) {
  const { status, data } = useCatalogState();
  const panelRef = useRef(null);

  const items = useMemo(
    () =>
      (data?.products ?? []).map((p) => {
        const category = data.categoryById.get(p.categoryId)?.name;
        const movement = cleanSpec(p.specifications.movement ?? "");
        return {
          id: p.id,
          title: p.name,
          description: p.description,
          tags: [category, movement].filter(Boolean),
          keywords: [p.modelNumber, String(p.price), formatPrice(p.price, p.currency), cleanSpec(p.specifications.strapMaterial ?? "")].filter(Boolean),
          href: `#/product/${p.id}`,
          image: p.imageUrl,
          meta: formatPrice(p.price, p.currency),
        };
      }),
    [data]
  );

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "Tab") {
        const nodes = [...panelRef.current.querySelectorAll("input, button, a[href]")].filter((n) => !n.disabled);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const chips = (
    <div className="search-overlay__idle">
      <p>Browse a collection</p>
      <ul>
        {(data?.categories ?? []).map((c) => (
          <li key={c.id}>
            <a href={`#/collections/${c.id}`} className="chip" onClick={onClose}>
              {c.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return createPortal(
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search watches" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-overlay__panel" ref={panelRef}>
        {status === "ready" ? (
          <div className="search-overlay__bar">
            <SearchComponent
              autoFocus
              showSort={false}
              data={items}
              maxResults={8}
              placeholder="Search by name, collection or movement…"
              onSelect={onClose}
              idleContent={chips}
              listClassName="search-overlay__list"
              emptyMessage={(q) => (
                <>
                  <strong>No watches match “{q}”.</strong>
                  <br />
                  Try a collection name such as “vintage”, or a movement such as “quartz”.
                </>
              )}
            />
            <button type="button" className="search-overlay__close" aria-label="Close search" onClick={onClose}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="search-overlay__bar">
            <p role="status">{status === "error" ? "The catalogue could not be loaded." : "Loading watches…"}</p>
            <button type="button" className="search-overlay__close" aria-label="Close search" onClick={onClose}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        )}
        <p className="search-overlay__hint">Enter opens the first result · Esc closes</p>
      </div>
    </div>,
    document.body
  );
}
