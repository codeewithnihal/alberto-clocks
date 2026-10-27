import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useRouter } from "../lib/router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useCart, MAX_QTY } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, cleanSpec, isUnverifiedSpec } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import { Breadcrumb } from "../features/PageHeader";
import ProductGrid from "../features/ProductGrid";
import ProductGallery from "../features/ProductGallery";

const SPEC_LABELS = {
  movement: "Movement",
  caseMaterial: "Case",
  strapMaterial: "Strap",
  waterResistance: "Water resistance",
  glass: "Glass",
};


function Detail({ data, id }) {
  const product = data.byId.get(id);
  const category = product && data.categoryById.get(product.categoryId);
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  useDocumentTitle(product?.name ?? "Watch not found");

  if (!product) {
    return (
      <div className="state-card">
        <h1 className="t-h1">Watch not found</h1>
        <InteractiveHoverButton text="Browse watches" href="#/collections/all" className="w-52" />
      </div>
    );
  }

  const related = data.productsByCategory.get(product.categoryId).filter((p) => p.id !== product.id).slice(0, 4);
  const wished = wishlist.has(product.id);
  const specEntries = Object.entries(product.specifications);
  const known = specEntries.filter(([, value]) => !isUnverifiedSpec(value));
  const unknown = specEntries.filter(([, value]) => isUnverifiedSpec(value)).map(([key]) => SPEC_LABELS[key] ?? key);

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: "Collections", to: "/collections" },
          { label: category.name, to: `/collections/${category.id}` },
          { label: product.name },
        ]}
      />
      <article className="product">
        <div className="product__media">
          <ProductGallery key={product.id} name={product.name} images={product.images} />
        </div>
        <div className="product__info">
          <p className="product__category">
            <a href={`#/collections/${category.id}`}>{category.name}</a>
          </p>
          <h1 className="t-h1">{product.name}</h1>
          <p className="product__price">{formatPrice(product.price, product.currency)}</p>
          <p className="product__desc">{product.description}</p>

          <div className="product__buy">
            <div className="stepper" role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                <Minus size={16} aria-hidden="true" />
              </button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={qty >= MAX_QTY} aria-label="Increase quantity">
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
            <InteractiveHoverButton
              text="Add to cart"
              className="w-56"
              onClick={() => {
                cart.add(product.id, qty);
                toast.push({ variant: "success", title: "Added to cart", description: `${qty} × ${product.name}` });
              }}
            />
            <button
              type="button"
              className={`wish-button${wished ? " is-on" : ""}`}
              aria-pressed={wished}
              onClick={() => {
                wishlist.toggle(product.id);
                toast.push({ variant: "info", title: wished ? "Removed from wishlist" : "Added to wishlist", description: product.name });
              }}
            >
              <Heart size={18} aria-hidden="true" fill={wished ? "currentColor" : "none"} />
              {wished ? "In your wishlist" : "Add to wishlist"}
            </button>
          </div>

          <h2 className="product__specs-title">Specifications</h2>
          <dl className="specs">
            {product.modelNumber && (
              <div>
                <dt>Model</dt>
                <dd>{product.modelNumber}</dd>
              </div>
            )}
            {known.map(([key, value]) => (
              <div key={key}>
                <dt>{SPEC_LABELS[key] ?? key}</dt>
                <dd>{cleanSpec(value)}</dd>
              </div>
            ))}
          </dl>
          {unknown.length > 0 && <p className="muted small">Not specified yet: {unknown.join(", ").toLowerCase()}.</p>}
          {product.isDemoData && (
            <p className="notice">{product.dataNote ?? "Demo catalogue: prices and specifications are placeholders and must be verified before sale."}</p>
          )}
        </div>
      </article>

      <section className="section" aria-labelledby="related-title">
        <h2 id="related-title" className="t-h2">
          More from {category.name}
        </h2>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}

export default function ProductPage() {
  const { params } = useRouter();
  return <CatalogGate>{(data) => <Detail key={params.id} data={data} id={params.id} />}</CatalogGate>;
}
