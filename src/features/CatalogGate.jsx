import { AnimatedLoadingSkeleton } from "../components/LoadingSkeleton";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useCatalogState } from "../context/CatalogContext";

/**
 * Handles the three catalogue states so pages only deal with the happy path:
 * loading (skeleton), error (message + retry), ready (calls `children(data)`).
 */
export default function CatalogGate({ children }) {
  const { status, data, error, retry } = useCatalogState();

  if (status === "loading") {
    return (
      <div className="page-loading">
        <AnimatedLoadingSkeleton />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="state-card" role="alert">
        <h1 className="t-h2">The catalogue could not be loaded</h1>
        <p>{error?.message ?? "Unknown error."}</p>
        <p className="muted">
          Open the site through a web server (npm run dev / npm run preview) – browsers block loading
          data.json from a file:// address.
        </p>
        <InteractiveHoverButton text="Try again" className="w-40" onClick={retry} />
      </div>
    );
  }
  return children(data);
}
