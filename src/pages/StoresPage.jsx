import { useMemo, useState } from "react";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { STORES, site } from "../config/site";
import { distanceKm } from "../lib/format";
import PageHeader from "../features/PageHeader";

const fallbackStore = {
  id: "main",
  name: site.name,
  address: site.contact.address,
  phone: site.contact.phone,
  email: site.contact.email,
};

export default function StoresPage() {
  useDocumentTitle("Store locator");
  const stores = STORES.length ? STORES : [fallbackStore];
  const canLocate = stores.some((s) => typeof s.lat === "number" && typeof s.lng === "number");
  const [origin, setOrigin] = useState(null);
  const [message, setMessage] = useState("");

  const sorted = useMemo(() => {
    if (!origin) return stores;
    return [...stores]
      .map((s) => ({ ...s, km: typeof s.lat === "number" ? distanceKm(origin, s) : Infinity }))
      .sort((a, b) => a.km - b.km);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin]);

  const locate = () => {
    if (!("geolocation" in navigator)) return setMessage("Geolocation is not supported by this browser.");
    setMessage("Locating…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude });
        setMessage("Stores sorted by distance from you.");
      },
      () => setMessage("Your location could not be read. Check the browser’s location permission."),
      { timeout: 10000 }
    );
  };

  return (
    <div className="page">
      <PageHeader title="Store locator" intro="Find us, call us or write to us." />
      {canLocate && (
        <div className="toolbar">
          <InteractiveHoverButton text="Find the nearest store" className="w-64" onClick={locate} />
          <p role="status" aria-live="polite" className="muted">
            {message}
          </p>
        </div>
      )}
      <ul className="stores">
        {sorted.map((store) => (
          <li key={store.id} className="store">
            <h2 className="store__name">{store.name}</h2>
            <address>
              {store.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <p>
              {store.phone && <a href={`tel:${store.phone.replace(/[^+\d]/g, "")}`}>{store.phone}</a>}
              {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
            </p>
            {Number.isFinite(store.km) && <p className="muted">{store.km.toFixed(1)} km away</p>}
            {typeof store.lat === "number" && (
              <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`} target="_blank" rel="noopener noreferrer">
                Open in maps
              </a>
            )}
          </li>
        ))}
      </ul>
      {!STORES.length && (
        <p className="notice">
          Only the main contact address is listed. Add store locations in <code>STORES</code> (src/config/site.js)
          to publish a full directory.
        </p>
      )}
    </div>
  );
}
