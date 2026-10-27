/**
 * Single place for brand copy and organisation details.
 *
 * !! The contact details below are PLACEHOLDERS (reserved example domain, fictional
 * !! phone number). Replace them with the real company details before launch.
 */
export const site = {
  name: "Alberto Watch Company",
  shortName: "Alberto",
  tagline: "Time, refined. Made to be remembered.",
  description:
    "Six watch collections – luxury, vintage, chronograph, smart, women’s and sports – from Alberto Watch Company.",

  contact: {
    email: "contact@albertowatches.example",
    phone: "+1 (555) 010-0100",
    phoneHref: "tel:+15550100100",
    address: ["123 Example Street", "Your City, Country"],
  },

  /**
   * Footer social tiles, in the order of the design reference. Paste the real profile URLs into `href`.
   * The links below open each platform's home page so every tile works now; replace them with your real profile URLs.
   * Tiles with an empty `href` are hidden in production (no dead links). Email uses `contact.email`.
   * WhatsApp format: https://wa.me/<number with country code, digits only>
   */
  social: [
    { id: "email", href: "" },
    { id: "x", href: "https://x.com/" },
    { id: "instagram", href: "https://www.instagram.com/" },
    { id: "threads", href: "https://www.threads.net/" },
    { id: "whatsapp", href: "https://wa.me/" },
    { id: "behance", href: "https://www.behance.net/" },
    { id: "facebook", href: "https://www.facebook.com/" },
    { id: "linkedin", href: "https://www.linkedin.com/" },
    { id: "youtube", href: "https://www.youtube.com/" },
  ],

  /** The supplied 3D model. It is a showpiece, not a catalogue product, so it carries its own copy. */
  showpiece: {
    src: "models/two_tone_luxury_dive_watch.glb",
    title: "Two-tone dive watch",
    alt: "Interactive 3D model of a two-tone steel and gold dive watch with a black dial and black bezel insert",
    description:
      "A steel case with a gold bezel rim, black elapsed-time bezel insert and black dial, modelled in 3D. Turn it, zoom in and look at it from every side.",
  },
};

/** Primary navigation. `Products` gets its dropdown filled from the catalogue. */
export const NAV_LINKS = [
  { id: "home", title: "Home", to: "/" },
  { id: "products", title: "Products", to: "/collections", dropdown: true },
  { id: "technology", title: "Technology", to: "/technology" },
  { id: "gallery", title: "Gallery", to: "/gallery" },
  { id: "stores", title: "Store Locator", to: "/stores" },
  { id: "support", title: "Support", to: "/support" },
  { id: "about", title: "About", to: "/about" },
];

/**
 * Store locations for the Store Locator page.
 * Leave empty to show the contact address above. To enable "nearest store" sorting add
 * coordinates: { id, name, address: ["line 1", "line 2"], phone, email, lat, lng }.
 */
export const STORES = [];
