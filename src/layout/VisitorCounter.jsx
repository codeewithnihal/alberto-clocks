import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { safeStorage } from "../lib/storage";

const TOTAL_KEY = "alberto.visits.v1";
const SESSION_KEY = "alberto.visit.counted";

/**
 * Visitor count shown at the top right (SRS requirement).
 *
 * It counts visits made from THIS browser (one per session, kept in localStorage).
 * A site-wide number needs a server – see README "Visitor counter".
 */
export default function VisitorCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let total = Number(safeStorage.get(TOTAL_KEY, 0)) || 0;
    try {
      if (!window.sessionStorage.getItem(SESSION_KEY)) {
        total += 1;
        safeStorage.set(TOTAL_KEY, total);
        window.sessionStorage.setItem(SESSION_KEY, "1");
      }
    } catch {
      /* storage blocked: still show at least this visit */
    }
    setCount(Math.max(total, 1));
  }, []);

  if (count === null) return null;
  return (
    <p
      className="visitor-counter"
      title="Visits from this browser. A site-wide count needs a server."
      aria-label={`Visits from this browser: ${count}`}
    >
      <Users size={14} aria-hidden="true" />
      <span className="visitor-counter__label">Visitors</span>
      <span className="visitor-counter__value">{count.toLocaleString("en-US")}</span>
    </p>
  );
}
