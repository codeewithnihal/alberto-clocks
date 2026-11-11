import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CLOCK_PRODUCTS = [
  {
    id: "clock-001",
    model: "AWC-WC-01",
    name: "Meridian Wall Clock",
    type: "Wall Clock",
    shape: "circle",
    details: "30 cm · Silent Quartz · Brushed Brass",
  },
  {
    id: "clock-002",
    model: "AWC-WC-02",
    name: "Heritage Chime Wall Clock",
    type: "Wall Clock",
    shape: "chime-wall",
    details: "35.6 cm · Quartz Chime · Walnut & Brass",
  },
  {
    id: "clock-003",
    model: "AWC-DC-01",
    name: "Arc Desk Clock",
    type: "Desk Clock",
    shape: "arc-desk",
    details: "15 cm · Silent Quartz · Brushed Brass",
  },
  {
    id: "clock-004",
    model: "AWC-DC-02",
    name: "Atelier Mechanical Desk Clock",
    type: "Desk Clock",
    shape: "mech-desk",
    details: "14 cm · 8-Day Mechanical · Polished Brass",
  },
  {
    id: "clock-005",
    model: "AWC-MC-01",
    name: "Solstice Mantel Clock",
    type: "Mantel Clock",
    shape: "mantel",
    details: "32 cm · Mechanical Pendulum · Walnut",
  },
  {
    id: "clock-006",
    model: "AWC-MC-02",
    name: "Westminster Mantel Clock",
    type: "Mantel Clock",
    shape: "westminster-mantel",
    details: "40 cm · Westminster Chime · Walnut & Brass",
  },
];

function generateClockSvg(product, angle = 1) {
  const angleLabel = angle === 1 ? "Front View" : angle === 2 ? "Angled Profile" : "Detail View";
  const safeDetails = product.details.replace(/&/g, "&amp;");
  let graphic = "";

  if (product.shape === "circle") {
    graphic = `
      <circle cx="320" cy="300" r="170" fill="#181817" stroke="#d9b263" stroke-width="6"/>
      <circle cx="320" cy="300" r="156" fill="none" stroke="#d9b263" stroke-width="1.5" stroke-dasharray="4 6"/>
      <circle cx="320" cy="300" r="148" fill="#121211" stroke="#3a3428" stroke-width="1"/>
      <!-- Hour markers -->
      <line x1="320" y1="160" x2="320" y2="180" stroke="#d9b263" stroke-width="4"/>
      <line x1="320" y1="420" x2="320" y2="440" stroke="#d9b263" stroke-width="4"/>
      <line x1="180" y1="300" x2="200" y2="300" stroke="#d9b263" stroke-width="4"/>
      <line x1="440" y1="300" x2="460" y2="300" stroke="#d9b263" stroke-width="4"/>
      <!-- Hands -->
      <line x1="320" y1="300" x2="320" y2="210" stroke="#f4f1eb" stroke-width="5" stroke-linecap="round"/>
      <line x1="320" y1="300" x2="390" y2="300" stroke="#d9b263" stroke-width="3" stroke-linecap="round"/>
      <circle cx="320" cy="300" r="7" fill="#d9b263"/>
    `;
  } else if (product.shape === "chime-wall") {
    graphic = `
      <!-- Octagonal / Arched wall case -->
      <rect x="200" y="140" width="240" height="340" rx="20" fill="#1e1814" stroke="#8a6136" stroke-width="4"/>
      <rect x="216" y="156" width="208" height="190" rx="10" fill="#141210" stroke="#d9b263" stroke-width="2"/>
      <circle cx="320" cy="250" r="80" fill="#191714" stroke="#d9b263" stroke-width="3"/>
      <!-- Roman numerals / markers -->
      <line x1="320" y1="180" x2="320" y2="195" stroke="#d9b263" stroke-width="3"/>
      <line x1="320" y1="250" x2="320" y2="200" stroke="#f4f1eb" stroke-width="4" stroke-linecap="round"/>
      <line x1="320" y1="250" x2="365" y2="235" stroke="#d9b263" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="320" cy="250" r="6" fill="#d9b263"/>
      <!-- Pendulum chamber -->
      <rect x="270" y="360" width="100" height="100" rx="6" fill="#0d0b09" stroke="#4a3e2e" stroke-width="1.5"/>
      <line x1="320" y1="360" x2="320" y2="425" stroke="#d9b263" stroke-width="3"/>
      <circle cx="320" cy="425" r="20" fill="#d9b263" stroke="#f4f1eb" stroke-width="1.5"/>
    `;
  } else if (product.shape === "arc-desk") {
    graphic = `
      <!-- Arched desk frame -->
      <path d="M 210 420 L 210 260 A 110 110 0 0 1 430 260 L 430 420 Z" fill="#1b1a18" stroke="#d9b263" stroke-width="5"/>
      <rect x="180" y="415" width="280" height="24" rx="4" fill="#24211b" stroke="#d9b263" stroke-width="3"/>
      <!-- Circular clock insert -->
      <circle cx="320" cy="285" r="82" fill="#111110" stroke="#d9b263" stroke-width="3"/>
      <circle cx="320" cy="285" r="74" fill="none" stroke="#544834" stroke-width="1" stroke-dasharray="3 4"/>
      <line x1="320" y1="285" x2="320" y2="230" stroke="#f4f1eb" stroke-width="4" stroke-linecap="round"/>
      <line x1="320" y1="285" x2="360" y2="300" stroke="#d9b263" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="320" cy="285" r="6" fill="#d9b263"/>
    `;
  } else if (product.shape === "mech-desk") {
    graphic = `
      <!-- Mechanical Desk Clock with pillars and escapement -->
      <rect x="190" y="410" width="260" height="25" rx="3" fill="#26221c" stroke="#d9b263" stroke-width="3"/>
      <!-- Brass columns -->
      <rect x="210" y="190" width="16" height="220" fill="#221e18" stroke="#d9b263" stroke-width="2"/>
      <rect x="414" y="190" width="16" height="220" fill="#221e18" stroke="#d9b263" stroke-width="2"/>
      <!-- Top header plate -->
      <rect x="195" y="175" width="250" height="18" rx="2" fill="#26221c" stroke="#d9b263" stroke-width="3"/>
      <!-- Dial -->
      <circle cx="320" cy="295" r="78" fill="#121211" stroke="#d9b263" stroke-width="3"/>
      <!-- Balance wheel indication -->
      <circle cx="320" cy="225" r="22" fill="none" stroke="#c8a96b" stroke-width="2" stroke-dasharray="2 3"/>
      <line x1="320" y1="295" x2="320" y2="245" stroke="#f4f1eb" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="320" y1="295" x2="355" y2="280" stroke="#d9b263" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="320" cy="295" r="5" fill="#d9b263"/>
    `;
  } else if (product.shape === "mantel") {
    graphic = `
      <!-- Classical arched mantel clock -->
      <path d="M 180 420 L 180 230 A 140 100 0 0 1 460 230 L 460 420 Z" fill="#231b15" stroke="#7e542d" stroke-width="5"/>
      <rect x="160" y="415" width="320" height="25" rx="4" fill="#2b2018" stroke="#d9b263" stroke-width="3"/>
      <circle cx="320" cy="265" r="76" fill="#13100e" stroke="#d9b263" stroke-width="3"/>
      <line x1="320" y1="265" x2="320" y2="215" stroke="#f4f1eb" stroke-width="4" stroke-linecap="round"/>
      <line x1="320" y1="265" x2="358" y2="250" stroke="#d9b263" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="320" cy="265" r="6" fill="#d9b263"/>
      <!-- Pendulum cutout -->
      <rect x="280" y="355" width="80" height="55" rx="4" fill="#0d0a08" stroke="#483626" stroke-width="1.5"/>
      <line x1="320" y1="355" x2="320" y2="395" stroke="#d9b263" stroke-width="3"/>
      <circle cx="320" cy="395" r="14" fill="#d9b263"/>
    `;
  } else if (product.shape === "westminster-mantel") {
    graphic = `
      <!-- Tambour architectural mantel clock -->
      <path d="M 140 420 C 140 330 200 210 320 210 C 440 210 500 330 500 420 Z" fill="#221a14" stroke="#7a5028" stroke-width="5"/>
      <rect x="120" y="415" width="400" height="25" rx="4" fill="#2a1f17" stroke="#d9b263" stroke-width="3"/>
      <!-- Brass bezel dial -->
      <circle cx="320" cy="305" r="84" fill="#14110f" stroke="#d9b263" stroke-width="4"/>
      <circle cx="320" cy="305" r="76" fill="none" stroke="#d9b263" stroke-width="1" stroke-dasharray="4 4"/>
      <!-- Chime winding arbors -->
      <circle cx="295" cy="335" r="4" fill="#d9b263"/>
      <circle cx="345" cy="335" r="4" fill="#d9b263"/>
      <line x1="320" y1="305" x2="320" y2="250" stroke="#f4f1eb" stroke-width="4" stroke-linecap="round"/>
      <line x1="320" y1="305" x2="365" y2="320" stroke="#d9b263" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="320" cy="305" r="6" fill="#d9b263"/>
    `;
  }

  return `
<svg width="640" height="640" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#181817"/>
      <stop offset="100%" stop-color="#0c0c0b"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#edd291"/>
      <stop offset="100%" stop-color="#b88f44"/>
    </linearGradient>
  </defs>

  <rect width="640" height="640" fill="url(#bg)"/>
  <rect x="12" y="12" width="616" height="616" rx="8" fill="none" stroke="#2a251b" stroke-width="1.5"/>

  <!-- Top label -->
  <text x="32" y="44" fill="#d9b263" font-family="'Cormorant Garamond', Georgia, serif" font-size="16" font-weight="600" letter-spacing="3">ALBERTO WATCH COMPANY</text>
  <text x="608" y="44" text-anchor="end" fill="#888173" font-family="Inter, system-ui, sans-serif" font-size="12" letter-spacing="1.5">${product.model}</text>

  <!-- Main Illustration -->
  ${graphic}

  <!-- Bottom Title & Angle -->
  <text x="320" y="525" text-anchor="middle" fill="#f4f1eb" font-family="'Cormorant Garamond', Georgia, serif" font-size="24" font-weight="600">${product.name}</text>
  <text x="320" y="548" text-anchor="middle" fill="#d9b263" font-family="Inter, system-ui, sans-serif" font-size="13">${product.type} · ${safeDetails}</text>
  <text x="320" y="570" text-anchor="middle" fill="#888173" font-family="Inter, system-ui, sans-serif" font-size="12">${angleLabel}</text>

  <!-- Notice Banner -->
  <rect x="80" y="592" width="480" height="26" rx="4" fill="#1b1710" stroke="#4a3e26" stroke-width="1"/>
  <text x="320" y="609" text-anchor="middle" fill="#d9b263" font-family="Inter, system-ui, sans-serif" font-size="10.5" font-weight="500" letter-spacing="1">DRAFT PLACEHOLDER · NOT ACTUAL PRODUCT PHOTOGRAPHY</text>
</svg>`;
}

function generateCoverSvg() {
  return `
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cover-bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#1c1a16"/>
      <stop offset="100%" stop-color="#0a0a09"/>
    </radialGradient>
    <linearGradient id="cover-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ebd293"/>
      <stop offset="50%" stop-color="#c8a96b"/>
      <stop offset="100%" stop-color="#936d2c"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="800" fill="url(#cover-bg)"/>
  <rect x="24" y="24" width="1152" height="752" rx="12" fill="none" stroke="#362f21" stroke-width="2"/>

  <!-- Background decorative concentric rings -->
  <circle cx="600" cy="380" r="280" fill="none" stroke="#252119" stroke-width="1.5"/>
  <circle cx="600" cy="380" r="220" fill="none" stroke="#2e281e" stroke-width="2" stroke-dasharray="6 8"/>

  <!-- Left: Wall Clock Silhouette -->
  <g transform="translate(320, 360)">
    <circle cx="0" cy="0" r="95" fill="#171513" stroke="#c8a96b" stroke-width="4"/>
    <circle cx="0" cy="0" r="82" fill="none" stroke="#443928" stroke-width="1.5"/>
    <line x1="0" y1="0" x2="0" y2="-50" stroke="#f4f1eb" stroke-width="3" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="35" y2="0" stroke="#c8a96b" stroke-width="2" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="5" fill="#c8a96b"/>
  </g>

  <!-- Center: Westminster Mantel Clock Silhouette -->
  <g transform="translate(600, 350)">
    <path d="M -130 90 C -130 10 -80 -70 0 -70 C 80 -70 130 10 130 90 Z" fill="#201913" stroke="#c8a96b" stroke-width="4"/>
    <rect x="-145" y="85" width="290" height="20" rx="3" fill="#291f16" stroke="#c8a96b" stroke-width="2.5"/>
    <circle cx="0" cy="15" r="55" fill="#13100e" stroke="#c8a96b" stroke-width="3"/>
    <line x1="0" y1="15" x2="0" y2="-20" stroke="#f4f1eb" stroke-width="3" stroke-linecap="round"/>
    <line x1="0" y1="15" x2="25" y2="25" stroke="#c8a96b" stroke-width="2" stroke-linecap="round"/>
    <circle cx="0" cy="15" r="4" fill="#c8a96b"/>
  </g>

  <!-- Right: Arc Desk Clock Silhouette -->
  <g transform="translate(880, 370)">
    <path d="M -60 75 L -60 -10 A 60 60 0 0 1 60 -10 L 60 75 Z" fill="#191714" stroke="#c8a96b" stroke-width="3.5"/>
    <rect x="-70" y="70" width="140" height="14" rx="2" fill="#26211a" stroke="#c8a96b" stroke-width="2"/>
    <circle cx="0" cy="10" r="40" fill="#110f0d" stroke="#c8a96b" stroke-width="2.5"/>
    <line x1="0" y1="10" x2="0" y2="-15" stroke="#f4f1eb" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="0" y1="10" x2="18" y2="10" stroke="#c8a96b" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="0" cy="10" r="3.5" fill="#c8a96b"/>
  </g>

  <!-- Typography -->
  <text x="600" y="110" text-anchor="middle" fill="#d9b263" font-family="'Cormorant Garamond', Georgia, serif" font-size="20" font-weight="600" letter-spacing="6">ALBERTO WATCH COMPANY</text>
  <text x="600" y="170" text-anchor="middle" fill="url(#cover-gold)" font-family="'Cormorant Garamond', Georgia, serif" font-size="52" font-weight="600" letter-spacing="4">The Clocks Collection</text>
  <text x="600" y="210" text-anchor="middle" fill="#f4f1eb" font-family="Inter, system-ui, sans-serif" font-size="16" letter-spacing="2">WALL · DESK · MANTEL</text>

  <!-- Footer Banner -->
  <rect x="250" y="705" width="700" height="34" rx="6" fill="#1a160f" stroke="#4e3f22" stroke-width="1.5"/>
  <text x="600" y="727" text-anchor="middle" fill="#d9b263" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="500" letter-spacing="1.5">DRAFT CATALOG PLACEHOLDER · NOT ACTUAL PHOTOGRAPHY</text>
</svg>`;
}

async function run() {
  const root = path.resolve(".");
  const coversDir = path.join(root, "public", "images", "covers");
  fs.mkdirSync(coversDir, { recursive: true });

  console.log("Generating Clocks collection cover images...");
  const coverSvg = Buffer.from(generateCoverSvg());
  await sharp(coverSvg).png().toFile(path.join(coversDir, "clocks.png"));
  await sharp(coverSvg).resize(1000, 700).webp({ quality: 85 }).toFile(path.join(coversDir, "clocks-md.webp"));
  await sharp(coverSvg).resize(500, 350).webp({ quality: 80 }).toFile(path.join(coversDir, "clocks-sm.webp"));

  for (const prod of CLOCK_PRODUCTS) {
    const prodDir = path.join(root, "public", "images", "products", prod.id);
    fs.mkdirSync(prodDir, { recursive: true });
    console.log(`Generating images for ${prod.name} (${prod.id})...`);

    // Generate 3 view angles for gallery inspection
    for (let angle = 1; angle <= 3; angle++) {
      const svg = Buffer.from(generateClockSvg(prod, angle));
      const pngPath = path.join(prodDir, `${angle}.png`);
      const mdPath = path.join(prodDir, `${angle}-md.webp`);
      const smPath = path.join(prodDir, `${angle}-sm.webp`);

      await sharp(svg).png().toFile(pngPath);
      await sharp(svg).resize(640, 640).webp({ quality: 85 }).toFile(mdPath);
      await sharp(svg).resize(400, 400).webp({ quality: 80 }).toFile(smPath);
    }
  }

  console.log("Clock placeholder images successfully created.");
}

run().catch((err) => {
  console.error("Error creating clock images:", err);
  process.exit(1);
});
