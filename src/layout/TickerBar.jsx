import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import Marquee from "../components/MarqueeTicker";
import { useNow } from "../hooks/useNow";

const formatCoord = (value, pos, neg) => `${Math.abs(value).toFixed(3)}° ${value >= 0 ? pos : neg}`;

/**
 * Scrolling ticker at the bottom of every page (SRS): current date, time and the
 * visitor's location from the HTML5 Geolocation API.
 *
 * Privacy: the browser is only asked for the location when the visitor presses
 * "Show my location" (or has already granted it). Coordinates stay in the browser;
 * no reverse-geocoding service is called, so the ticker shows latitude / longitude.
 */
export default function TickerBar() {
  const now = useNow(1000);
  const [geo, setGeo] = useState({ status: "idle", coords: null });

  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const date = useMemo(
    () => new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(now),
    // The date only changes at midnight; recompute when the day changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now.toDateString()]
  );
  const time = new Intl.DateTimeFormat("en-US", { timeStyle: "medium" }).format(now);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "unsupported", coords: null });
      return;
    }
    setGeo({ status: "asking", coords: null });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setGeo({ status: "granted", coords: { lat: coords.latitude, lng: coords.longitude } }),
      (error) => setGeo({ status: error.code === 1 ? "denied" : "error", coords: null }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  // If permission was already granted earlier, use it without prompting again.
  useEffect(() => {
    let cancelled = false;
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((result) => {
        if (!cancelled && result.state === "granted") locate();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locate]);

  const locationText = {
    idle: "Location not shared",
    asking: "Locating…",
    denied: "Location permission denied",
    error: "Location unavailable",
    unsupported: "Geolocation not supported by this browser",
    granted: geo.coords
      ? `Your location: ${formatCoord(geo.coords.lat, "N", "S")}, ${formatCoord(geo.coords.lng, "E", "W")}`
      : "",
  }[geo.status];

  const canAsk = geo.status === "idle" || geo.status === "denied" || geo.status === "error";

  return (
    <section className="ticker" aria-label="Date, time and location">
      {canAsk && (
        <button type="button" className="ticker__locate" onClick={locate}>
          <MapPin size={14} aria-hidden="true" />
          Show my location
        </button>
      )}
      <Marquee pauseOnHover gap="3rem" duration={40} fade label="Date, time and location" className="ticker__marquee">
        <span className="ticker__item">{date}</span>
        <span className="ticker__item ticker__item--time">
          {time} <small>({timeZone})</small>
        </span>
        <span className="ticker__item">{locationText}</span>
      </Marquee>
    </section>
  );
}
