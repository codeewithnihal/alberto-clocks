import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import Marquee from "../components/MarqueeTicker";
import { useNow } from "../hooks/useNow";

const formatCoord = (value, pos, neg) =>
  `${Math.abs(value).toFixed(3)}° ${value >= 0 ? pos : neg}`;

/**
 * Scrolling marquee ticker positioned below the footer.
 * Displays current date, time, and user's actual location obtained via the
 * browser Geolocation API without external tracking or third-party servers.
 */
export default function TickerBar() {
  const now = useNow(1000);
  const [geo, setGeo] = useState({ status: "asking", coords: null });

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const city = useMemo(() => {
    const parts = timeZone.split("/");
    return (parts[parts.length - 1] || timeZone).replace(/_/g, " ");
  }, [timeZone]);

  const date = useMemo(
    () => new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(now),
    // The date only changes at midnight; recompute when the day changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now.toDateString()],
  );
  const time = new Intl.DateTimeFormat("en-US", { timeStyle: "medium" }).format(
    now,
  );

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "unsupported", coords: null });
      return;
    }
    setGeo((prev) =>
      prev.status === "granted" ? prev : { status: "asking", coords: null },
    );
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setGeo({
          status: "granted",
          coords: { lat: coords.latitude, lng: coords.longitude },
        }),
      (error) =>
        setGeo({ status: error.code === 1 ? "denied" : "error", coords: null }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }, []);

  // Request location on mount, respecting existing browser permissions
  useEffect(() => {
    locate();
  }, [locate]);

  const locationText = useMemo(() => {
    switch (geo.status) {
      case "granted":
        return geo.coords
          ? `${city ? `${city} · ` : ""}${formatCoord(geo.coords.lat, "N", "S")}, ${formatCoord(geo.coords.lng, "E", "W")}`
          : city || "Location found";
      case "asking":
        return `Locating${city ? ` near ${city}` : ""}…`;
      case "denied":
        return `Location denied (${city})`;
      case "unsupported":
        return `Location unavailable (${city})`;
      case "error":
      default:
        return `Location unavailable (${city})`;
    }
  }, [geo, city]);

  return (
    <aside
      className="ticker"
      aria-label="Current date, time, and location ticker"
    >
      <Marquee
        pauseOnHover
        repeat={4}
        gap="2.5rem"
        duration={35}
        fade
        label="Date, time and location"
        className="ticker__marquee"
      >
        <span className="ticker__item">
          <span className="ticker__label">Date:</span> {date}
        </span>
        <span className="ticker__dot" aria-hidden="true">
          ◆
        </span>
        <span className="ticker__item ticker__item--time">
          <span className="ticker__label">Local Time:</span> {time}{" "}
          <small>({timeZone})</small>
        </span>
        <span className="ticker__dot" aria-hidden="true">
          ◆
        </span>
        <span className="ticker__item ticker__item--loc">
          <MapPin
            size={12}
            className="inline mr-1 -mt-0.5 opacity-80"
            aria-hidden="true"
          />
          <span className="ticker__label">Location:</span> {locationText}
        </span>
        <span className="ticker__dot" aria-hidden="true">
          ◆
        </span>
        <span className="ticker__item ticker__item--brand">
          Alberto Watch Company{" "}
          <span className="opacity-60">· Time, Refined</span>
        </span>
        <span className="ticker__dot" aria-hidden="true">
          ◆
        </span>
      </Marquee>
    </aside>
  );
}
