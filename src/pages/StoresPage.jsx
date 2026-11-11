import { useState } from "react";
import { MapPin, Phone, Mail, ExternalLink, Clock } from "lucide-react";
import { site, STORES } from "../config/site";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import PageHeader from "../features/PageHeader";
import { InteractiveHoverButton } from "../components/HoverEffectButton";

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function StoresPage() {
  useDocumentTitle(
    "Store locator",
    "Locate an authorized Alberto Watch Company boutique or showroom near you.",
  );
  const [origin, setOrigin] = useState(null);
  const [message, setMessage] = useState("");

  const stores = STORES.length
    ? STORES
    : [
        {
          id: "headquarters",
          name: site.name,
          badge: "Flagship Showroom",
          address: site.contact.address,
          phone: site.contact.phone,
          email: site.contact.email,
          hours: "Mon – Sat: 10:00 AM – 8:00 PM",
        },
      ];

  const sorted = stores
    .map((store) => ({
      ...store,
      km:
        origin && typeof store.lat === "number"
          ? distanceKm(origin.lat, origin.lng, store.lat, store.lng)
          : null,
    }))
    .sort((a, b) => {
      if (a.km == null && b.km == null) return 0;
      if (a.km == null) return 1;
      if (b.km == null) return -1;
      return a.km - b.km;
    });

  const canLocate = STORES.some((s) => typeof s.lat === "number");

  const locate = () => {
    if (!("geolocation" in navigator)) {
      return setMessage("Geolocation is not supported by this browser.");
    }
    setMessage("Locating…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude });
        setMessage("Stores sorted by distance from your location.");
      },
      () =>
        setMessage(
          "Your location could not be read. Please check your browser location permission.",
        ),
      { timeout: 10000 },
    );
  };

  return (
    <div className="page flex flex-col items-center">
      <div className="text-center flex flex-col items-center mb-10 max-w-xl">
        <h1 id="page-title" className="t-h1 text-center">
          Store locator
        </h1>
        <p className="page-header__intro text-center mt-3">
          Find an authorized boutique or contact our flagship showroom directly.
        </p>
      </div>

      {canLocate && (
        <div className="toolbar mb-8 flex flex-col items-center">
          <InteractiveHoverButton
            text="Find the nearest store"
            className="w-64"
            onClick={locate}
          />
          {message && (
            <p role="status" aria-live="polite" className="muted text-sm text-center">
              {message}
            </p>
          )}
        </div>
      )}

      <ul className="stores w-full max-w-xl mx-auto">
        {sorted.map((store) => (
          <li key={store.id} className="store rounded-xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="store__name text-2xl font-heading font-semibold text-foreground">
                {store.name}
              </h2>
              {store.badge && (
                <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {store.badge}
                </span>
              )}
            </div>

            <address className="not-italic text-sm text-muted-foreground flex items-start gap-2.5 mb-3.5">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                {store.address.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </address>

            {store.hours && (
              <div className="text-sm text-muted-foreground flex items-center gap-2.5 mb-3.5">
                <Clock size={16} className="text-primary shrink-0" aria-hidden="true" />
                <span>{store.hours}</span>
              </div>
            )}

            <div className="space-y-2.5 text-sm pt-3 border-t border-border/50">
              {store.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <a href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} className="hover:text-primary transition-colors">
                    {store.phone}
                  </a>
                </div>
              )}
              {store.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <a href={`mailto:${store.email}`} className="hover:text-primary transition-colors">
                    {store.email}
                  </a>
                </div>
              )}
            </div>

            {Number.isFinite(store.km) && (
              <p className="muted text-xs mt-3 pt-2 border-t border-border/50">
                {store.km.toFixed(1)} km away
              </p>
            )}

            <div className="pt-6 mt-auto">
              {typeof store.lat === "number" ? (
                <a
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Open in maps</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              ) : (
                <InteractiveHoverButton
                  text="Contact showroom"
                  href="/contact"
                  className="w-48"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
