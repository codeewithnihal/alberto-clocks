/**
 * Re-creates public/images and public/data/data.json from the source images directory.
 *
 * - Originals are copied byte-for-byte without re-encoding.
 * - Derivatives: large (<=1400 px wide, WebP q88, only if original is wider) and thumb (640 px, WebP q82).
 * - Metadata mapping is read from watch_products_data.json with corrections applied.
 *
 * Usage:
 *   node tools/tool.js [source_folder] [output_folder]
 *
 * Defaults:
 *   source_folder: ./imgs
 *   output_folder: ../public (relative to tools/)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage: node tools/tool.js [source_folder] [output_folder]
  source_folder: directory containing images/ (default: ./imgs)
  output_folder: directory to write output to (default: ../public)`);
  process.exit(0);
}

const SRC = process.argv[2] || "./imgs";
const OUT = process.argv[3] || path.resolve(__dirname, "..", "public");
const KEYS = ["front", "angle45", "side", "back", "boxPresentation"];

// Primary (card / first gallery) image: view showing the watch face best
export const PRIMARY = {
  "chronograph-001": "side",
  "chronograph-005": "side",
  "chronograph-008": "angle45",
  "chronograph-009": "angle45",
  "chronograph-011": "angle45",
  "chronograph-012": "back",
  "vintage-006": "angle45",
  "vintage-007": "boxPresentation",
  "vintage-008": "back",
  "vintage-009": "back",
  "vintage-011": "boxPresentation",
  "vintage-012": "angle45",
  "smart-004": "side",
  "smart-006": "back",
  "smart-007": "angle45",
};

// Cross-contaminated folders where images were swapped in the source data
export const SWAPS = [
  [["chronograph-005", "side"], ["chronograph-008", "side"]],
  [["chronograph-005", "back"], ["chronograph-008", "boxPresentation"]],
];

export function tidy(name, cat, num) {
  const n = name.replace(/\s+/g, " ").trim();
  const label = { luxury: "Luxury", vintage: "Vintage", chronograph: "Chronograph", sports: "Sport" }[cat];

  if (/^(luxury|vintage|chronograph)\s+(product image( no)?|model)\s*\d+$/i.test(n)) {
    return `${label} ${String(num).padStart(2, "0")}`;
  }
  const m = n.match(/^(vintage|sport) model (\d+) (.+)$/i);
  if (m) {
    return `${label} ${String(parseInt(m[2], 10)).padStart(2, "0")} · ${m[3]}`;
  }
  return n;
}

async function processImage(job) {
  const [src, dstDir, stem] = job;
  await fs.promises.mkdir(dstDir, { recursive: true });

  const ext = path.extname(src).toLowerCase();
  const orig = path.join(dstDir, stem + ext);
  await fs.promises.copyFile(src, orig);

  const instance = sharp(src);
  const meta = await instance.metadata();
  const w = meta.width;
  const h = meta.height;

  // Thumbnail: 640px wide maximum, aspect ratio maintained
  const thumbWidth = Math.min(w, 640);
  const thumbHeight = Math.round((h * thumbWidth) / w);
  await sharp(src)
    .resize(thumbWidth, thumbHeight, { fit: "inside", kernel: "lanczos3" })
    .webp({ quality: 82, effort: 4 })
    .toFile(path.join(dstDir, `${stem}-sm.webp`));

  let large = false;
  if (w > 1400) {
    const largeHeight = Math.round((h * 1400) / w);
    await sharp(src)
      .resize(1400, largeHeight, { fit: "inside", kernel: "lanczos3" })
      .webp({ quality: 88, effort: 4 })
      .toFile(path.join(dstDir, `${stem}-md.webp`));
    large = true;
  }

  return [src, w, h, ext, large];
}

async function runQueue(jobs, concurrency = 4) {
  const results = new Map();
  let index = 0;
  let doneCount = 0;

  async function worker() {
    while (index < jobs.length) {
      const current = jobs[index++];
      const res = await processImage(current);
      results.set(res[0], res);
      doneCount += 1;
      if (doneCount % 40 === 0) {
        console.log(`${doneCount} done`);
      }
    }
  }

  const pool = Array.from({ length: concurrency }, () => worker());
  await Promise.all(pool);
  return results;
}

export async function main() {
  const dataPath = path.join(SRC, "images", "watch_products_data.json");
  if (!fs.existsSync(dataPath)) {
    console.error(`Source catalog file not found: ${dataPath}`);
    console.error(`Pass the directory that contains the images folder: node tools/tool.js <path-to-imgs>`);
    process.exitCode = 1;
    return;
  }

  const raw = await fs.promises.readFile(dataPath, "utf-8");
  const d = JSON.parse(raw);

  const P = {};
  for (const p of d.products) {
    P[p.id] = p;
  }

  for (const [[a, ak], [b, bk]] of SWAPS) {
    const temp = P[a].images[ak];
    P[a].images[ak] = P[b].images[bk];
    P[b].images[bk] = temp;
  }

  // vintage-005: reference all five files in its directory
  const vintageFolder = `${SRC}/images/vintage/products/model 5`;
  P["vintage-005"].images = {
    front: `${vintageFolder}/01_front_rock.png`.replace(`${SRC}/`, ""),
    angle45: `${vintageFolder}/03_front_straight.png`.replace(`${SRC}/`, ""),
    side: `${vintageFolder}/02_side_crown.png`.replace(`${SRC}/`, ""),
    back: `${vintageFolder}/05_box2.png`.replace(`${SRC}/`, ""),
    boxPresentation: `${vintageFolder}/04_box.png`.replace(`${SRC}/`, ""),
  };

  // Women's collection names and descriptions from README
  const readmePath = path.join(SRC, "images", "women", "products", "README.txt");
  const women = new Map();
  if (fs.existsSync(readmePath)) {
    const readmeContent = await fs.promises.readFile(readmePath, "utf-8");
    const re = /^(\d\d) ([^-\n]+?) - (.+)$/gm;
    let m;
    while ((m = re.exec(readmeContent)) !== null) {
      women.set(parseInt(m[1], 10), [m[2].trim(), m[3].trim()]);
    }
  }

  const imagesOutDir = path.join(OUT, "images");
  if (fs.existsSync(imagesOutDir)) {
    await fs.promises.rm(imagesOutDir, { recursive: true, force: true });
  }

  const jobs = [];
  const plan = new Map();

  for (const p of d.products) {
    const pid = p.id;
    const primary = PRIMARY[pid] || "front";
    const order = [primary, ...KEYS.filter((k) => k !== primary)];
    plan.set(pid, []);

    for (let i = 0; i < order.length; i++) {
      const k = order[i];
      const src = path.join(SRC, p.images[k]);
      if (!fs.existsSync(src)) {
        throw new Error(`Missing source file: ${src}`);
      }
      jobs.push([src, path.join(OUT, "images", "products", pid), String(i + 1)]);
      plan.get(pid).push(src);
    }
  }

  const covers = new Map();
  for (const c of d.categories) {
    const src = path.join(SRC, c.coverImage);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing cover image file: ${src}`);
    }
    jobs.push([src, path.join(OUT, "images", "covers"), c.id]);
    covers.set(c.id, src);
  }

  console.log(`Starting ${jobs.length} image jobs...`);
  const results = await runQueue(jobs, 4);

  const categories = [];
  for (const c of d.categories) {
    const [, w, h, ext, large] = results.get(covers.get(c.id));
    const base = `images/covers/${c.id}`;
    categories.push({
      id: c.id,
      name: c.name,
      description: c.description,
      cover: {
        src: base + ext,
        large: base + (large ? "-md.webp" : ext),
        thumb: `${base}-sm.webp`,
        width: w,
        height: h,
      },
      productIds: c.productIds,
    });
  }

  const products = [];
  for (const p of d.products) {
    const pid = p.id;
    const cat = p.categoryId;
    const num = parseInt(pid.split("-")[1], 10);
    const imgs = [];

    const productSources = plan.get(pid);
    for (let i = 0; i < productSources.length; i++) {
      const src = productSources[i];
      const [, w, h, ext, large] = results.get(src);
      const base = `images/products/${pid}/${i + 1}`;
      imgs.push({
        src: base + ext,
        large: base + (large ? "-md.webp" : ext),
        thumb: `${base}-sm.webp`,
        width: w,
        height: h,
      });
    }

    let name = tidy(p.name, cat, num);
    let desc = p.description;

    if (cat === "womens" && women.has(num)) {
      const [wName, wDesc] = women.get(num);
      name = wName;
      desc = `${wDesc}.`;
    }

    const { modelNumber, ...restSpecs } = p.specifications || {};

    products.push({
      id: pid,
      categoryId: cat,
      name,
      sourceName: p.name,
      brand: p.brand,
      price: p.price,
      currency: p.currency,
      modelNumber: modelNumber || null,
      description: desc,
      specifications: restSpecs,
      images: imgs,
      isDemoData: p.isDemoData ?? true,
      dataNote: p.dataNote,
    });
  }

  const outData = {
    brand: d.brand,
    currency: d.currency,
    categories,
    products,
  };

  const dataDir = path.join(OUT, "data");
  await fs.promises.mkdir(dataDir, { recursive: true });
  await fs.promises.writeFile(
    path.join(dataDir, "data.json"),
    JSON.stringify(outData, null, 1),
    "utf-8"
  );

  const totalImages = products.reduce((acc, p) => acc + p.images.length, 0);
  console.log(`Finished: ${products.length} products, ${totalImages} images processed.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

