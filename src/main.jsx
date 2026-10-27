import React from "react";
import { createRoot } from "react-dom/client";

// Self-hosted fonts (latin subset). Only the weights the design uses are loaded:
// Cormorant Garamond 500/600 for headings, Inter 400/500/600 for body and UI.
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";

import App from "./App.jsx";
import "./index.css";
import "./styles/site.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
