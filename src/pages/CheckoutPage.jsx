import { useState } from "react";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useCart, cartLines } from "../context/CartContext";
import { formatPrice } from "../lib/format";
import { submitForm, NOT_CONNECTED } from "../services/submit";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";

const FIELDS = [
  { name: "fullName", label: "Full name", autoComplete: "name", required: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", required: true },
  { name: "address", label: "Street address", autoComplete: "street-address", required: true },
  { name: "city", label: "City", autoComplete: "address-level2", required: true },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code", required: false },
  { name: "country", label: "Country", autoComplete: "country-name", required: true },
];

function validate(values) {
  const errors = {};
  for (const f of FIELDS) {
    if (f.required && !values[f.name]?.trim()) errors[f.name] = `${f.label} is required.`;
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (values.phone && values.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number.";
  return errors;
}

function Checkout({ data }) {
  const cart = useCart();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | error | done
  const [receipt, setReceipt] = useState(null);

  const lines = cartLines(cart.items, data.byId);
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  if (status === "done" && receipt) {
    return (
      <div className="state-card" role="status">
        <h1 className="t-h1">Order request received</h1>
        <p>
          Reference <strong>{receipt.reference}</strong>
        </p>
        <p className="notice">
          {receipt.delivered ? "Your order request has been sent." : NOT_CONNECTED} No payment was taken.
        </p>
        <InteractiveHoverButton text="Continue browsing" href="#/collections/all" className="w-60" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Checkout" />
        <div className="state-card state-card--inline">
          <p>Your cart is empty, so there is nothing to check out.</p>
          <InteractiveHoverButton text="Browse watches" href="#/collections/all" className="w-52" />
        </div>
      </div>
    );
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const reference = `AW-${Date.now().toString(36).toUpperCase()}`;
      const { delivered } = await submitForm("order", {
        reference,
        customer: values,
        items: lines.map((l) => ({ id: l.product.id, name: l.product.name, qty: l.qty, unitPrice: l.product.price })),
        subtotal,
        currency: data.currency,
      });
      cart.clear();
      setReceipt({ reference, delivered });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="page">
      <PageHeader title="Checkout" />
      <div className="cart">
        <form className="form" onSubmit={onSubmit} noValidate aria-labelledby="page-title">
          {FIELDS.map((f) => (
            <div className="field" key={f.name}>
              <label htmlFor={`field-${f.name}`}>
                {f.label}
                {!f.required && <span className="muted"> (optional)</span>}
              </label>
              <input
                id={`field-${f.name}`}
                name={f.name}
                type={f.type ?? "text"}
                autoComplete={f.autoComplete}
                value={values[f.name] ?? ""}
                aria-invalid={errors[f.name] ? "true" : undefined}
                aria-describedby={errors[f.name] ? `error-${f.name}` : undefined}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              />
              {errors[f.name] && (
                <p className="field__error" id={`error-${f.name}`}>
                  {errors[f.name]}
                </p>
              )}
            </div>
          ))}
          <p className="notice">
            Payment is not connected on this site. Placing the request does not charge you.
          </p>
          <div className="form__actions">
            <InteractiveHoverButton type="submit" text={status === "sending" ? "Sending…" : "Place order request"} className="w-72" disabled={status === "sending"} />
            {status === "error" && (
              <p className="field__error" role="alert">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        </form>

        <aside className="summary" aria-labelledby="summary-title">
          <h2 id="summary-title" className="summary__title">
            Your order
          </h2>
          <ul className="summary__lines">
            {lines.map(({ product, qty, lineTotal }) => (
              <li key={product.id}>
                <span>
                  {product.name} <span className="muted">× {qty}</span>
                </span>
                <span className="tabular">{formatPrice(lineTotal, product.currency)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd className="tabular">{formatPrice(subtotal, data.currency)}</dd>
            </div>
          </dl>
          <p className="muted small">Shipping and taxes are not configured yet.</p>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  useDocumentTitle("Checkout");
  return <CatalogGate>{(data) => <Checkout data={data} />}</CatalogGate>;
}
