import { Minus, Plus, Trash2 } from "lucide-react";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useCart, cartLines, MAX_QTY } from "../context/CartContext";
import { formatPrice } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";

export default function CartPage() {
  useDocumentTitle("Cart");
  const cart = useCart();
  return (
    <CatalogGate>
      {(data) => {
        const lines = cartLines(cart.items, data.byId);
        const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
        return (
          <div className="page">
            <PageHeader title="Cart" />
            {lines.length === 0 ? (
              <div className="state-card state-card--inline">
                <p>Your cart is empty.</p>
                <InteractiveHoverButton text="Browse watches" href="#/collections/all" className="w-52" />
              </div>
            ) : (
              <div className="cart">
                <ul className="cart__lines">
                  {lines.map(({ product, qty, lineTotal }) => (
                    <li key={product.id} className="cart-line">
                      <a href={`#/product/${product.id}`} className="cart-line__image">
                        <img src={product.imageUrl} alt="" width="96" height="96" loading="lazy" />
                      </a>
                      <div className="cart-line__info">
                        <h2 className="cart-line__name">
                          <a href={`#/product/${product.id}`}>{product.name}</a>
                        </h2>
                        <p className="muted">{data.categoryById.get(product.categoryId)?.name}</p>
                        <p className="muted tabular">{formatPrice(product.price, product.currency)} each</p>
                      </div>
                      <div className="stepper" role="group" aria-label={`Quantity for ${product.name}`}>
                        <button type="button" onClick={() => cart.setQty(product.id, qty - 1)} aria-label={`Decrease quantity of ${product.name}`}>
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <output>{qty}</output>
                        <button type="button" onClick={() => cart.setQty(product.id, qty + 1)} disabled={qty >= MAX_QTY} aria-label={`Increase quantity of ${product.name}`}>
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <p className="cart-line__total tabular">{formatPrice(lineTotal, product.currency)}</p>
                      <button type="button" className="icon-button" onClick={() => cart.remove(product.id)} aria-label={`Remove ${product.name} from cart`}>
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
                <aside className="summary" aria-labelledby="summary-title">
                  <h2 id="summary-title" className="summary__title">
                    Order summary
                  </h2>
                  <dl>
                    <div>
                      <dt>Subtotal</dt>
                      <dd className="tabular">{formatPrice(subtotal, data.currency)}</dd>
                    </div>
                  </dl>
                  <p className="muted small">Shipping and taxes are not configured yet, so they are not included.</p>
                  <InteractiveHoverButton text="Checkout" href="#/checkout" className="w-full" />
                  <button type="button" className="text-link" onClick={cart.clear}>
                    Empty cart
                  </button>
                </aside>
              </div>
            )}
          </div>
        );
      }}
    </CatalogGate>
  );
}
