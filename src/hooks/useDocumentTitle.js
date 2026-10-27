import { useEffect } from "react";
import { site } from "../config/site";

/** Sets the tab title: "Page · Alberto Watch Company". */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : site.name;
  }, [title]);
}
