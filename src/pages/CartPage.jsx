import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "../lib/format";
import { useCart, MAX_QTY } from "../context/CartContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import ProductDetailModal from "../features/ProductDetailModal";

export default function CartPage() {
  useDocumentTitle("Cart");
  const cart = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <CatalogGate>
      {(data) => {
        const lines = cart.items
          .map((item) => {
            const product = data.byId.get(item.id);
            if (!product) return null;
            return {
              product,
              qty: item.qty,
              lineTotal: product.price * item.qty,
            };
          })
          .filter(Boolean);

        return (
          <div className="page">
            <PageHeader title="Your cart" />
            {lines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-4 my-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <ShoppingBag size={24} aria-hidden="true" />
                </div>
                <h2 className="t-h2 text-xl font-semibold">Your cart is empty</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  You have not added any timepieces to your cart yet. Explore our collections to find your signature watch.
                </p>
                <div className="pt-2">
                  <InteractiveHoverButton
                    text="Browse watches"
                    href="/collections/all"
                    className="w-56"
                  />
                </div>
              </div>
            ) : (
              <div className="cart">
                <ul className="cart__lines">
                  {lines.map(({ product, qty, lineTotal }) => (
                    <li key={product.id} className="cart-line">
                      <a
                        href={`/product/${product.id}`}
                        onClick={(e) => {
                          if (
                            e.button === 0 &&
                            !e.metaKey &&
                            !e.altKey &&
                            !e.ctrlKey &&
                            !e.shiftKey
                          ) {
                            e.preventDefault();
                            setSelectedProduct(product);
                          }
                        }}
                        className="cart-line__image"
                      >
                        <img
                          src={product.imageUrl}
                          alt=""
                          width="96"
                          height="96"
                          loading="lazy"
                        />
                      </a>
                      <div className="cart-line__info">
                        <h2 className="cart-line__name">
                          <a
                            href={`/product/${product.id}`}
                            onClick={(e) => {
                              if (
                                e.button === 0 &&
                                !e.metaKey &&
                                !e.altKey &&
                                !e.ctrlKey &&
                                !e.shiftKey
                              ) {
                                e.preventDefault();
                                setSelectedProduct(product);
                              }
                            }}
                          >
                            {product.name}
                          </a>
                        </h2>
                        <p className="muted">
                          {data.categoryById.get(product.categoryId)?.name}
                        </p>
                        <p className="muted tabular">
                          {formatPrice(product.price, product.currency)} each
                        </p>
                        <div
                          className="stepper stepper--inline"
                          role="group"
                          aria-label={`Quantity for ${product.name}`}
                        >
                          <button
                            type="button"
                            onClick={() => cart.set(product.id, qty - 1)}
                            disabled={qty <= 1}
                            aria-label={`Decrease quantity of ${product.name}`}
                          >
                            <Minus size={14} aria-hidden="true" />
                          </button>
                          <output aria-live="polite">{qty}</output>
                          <button
                            type="button"
                            onClick={() => cart.set(product.id, qty + 1)}
                            disabled={qty >= MAX_QTY}
                            aria-label={`Increase quantity of ${product.name}`}
                          >
                            <Plus size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="cart-line__total">
                        <p className="tabular">
                          {formatPrice(lineTotal, product.currency)}
                        </p>
                        <button
                          type="button"
                          className="icon-link"
                          onClick={() => cart.remove(product.id)}
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <aside className="cart__summary" aria-labelledby="summary-head">
                  <h2 id="summary-head" className="t-h2">
                    Summary
                  </h2>
                  <div className="cart__summary-row">
                    <span>Subtotal</span>
                    <span className="tabular">
                      {formatPrice(cart.subtotal, cart.currency)}
                    </span>
                  </div>
                  <p className="muted small">
                    Shipping and taxes are not configured yet, so they are not
                    included.
                  </p>
                  <InteractiveHoverButton
                    text="Checkout"
                    href="/checkout"
                    className="w-full"
                  />
                  <button
                    type="button"
                    className="text-link"
                    onClick={cart.clear}
                  >
                    Empty cart
                  </button>
                </aside>
              </div>
            )}

            {selectedProduct && (
              <ProductDetailModal
                product={selectedProduct}
                category={data.categoryById.get(selectedProduct.categoryId)}
                onClose={() => setSelectedProduct(null)}
              />
            )}
          </div>
        );
      }}
    </CatalogGate>
  );
}
