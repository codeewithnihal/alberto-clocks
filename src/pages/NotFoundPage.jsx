import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { InteractiveHoverButton } from "../components/HoverEffectButton";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="state-card">
      <h1 className="t-h1">Page not found</h1>
      <p>That page does not exist or has moved.</p>
      <InteractiveHoverButton text="Back to home" href="#/" className="w-48" />
    </div>
  );
}
