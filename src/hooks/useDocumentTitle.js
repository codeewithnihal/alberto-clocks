import { useEffect } from "react";
import { site } from "../config/site";

/** Sets the tab title and page meta description. */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title
      ? `${title} · ${site.name}`
      : `${site.name} – Time, Refined`;

    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute("content", description);
      }
    }
  }, [title, description]);
}
