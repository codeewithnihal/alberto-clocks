/**
 * Builds the Clocks collection from the Wall Clocks source package.
 *
 * - Copies each model's original images to public/images/products/clock-NNN/ without re-encoding.
 * - Derivatives: card thumbnail (640 px, WebP q82, only if the original is wider) and
 *   large view (1400 px, WebP q88, only if the original is wider).
 * - Builds the collection cover from the hero image.
 * - Rewrites the "clocks" category and its products in public/data/data.json.
 *
 * Usage:
 *   node tools/make_clock_assets.js [source_folder]
 *
 * Defaults:
 *   source_folder: ./wall clocks (contains alberto_12_clock_models_catalog.json)
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve(process.argv[2] || "wall clocks");
const ROOT = path.resolve(".");
const PUBLIC = path.join(ROOT, "public");
const CATALOG = "alberto_12_clock_models_catalog.json";
const HERO = "alberto-wall-clocks-hero.webp";
const NOTE =
  "AI-generated concept imagery and suggested catalog prices; confirm specifications before publishing.";

const pad = (n) => String(n).padStart(3, "0");

async function copyImage(src, dstDir, stem) {
  const ext = path.extname(src).toLowerCase();
  fs.copyFileSync(src, path.join(dstDir, stem + ext));

  const { width, height } = await sharp(src).metadata();
  const image = { src: stem + ext, large: stem + ext, thumb: stem + ext, width, height };

  if (width > 640) {
    await sharp(src)
      .resize(640, Math.round((height * 640) / width), { fit: "inside", kernel: "lanczos3" })
      .webp({ quality: 82, effort: 4 })
      .toFile(path.join(dstDir, `${stem}-sm.webp`));
    image.thumb = `${stem}-sm.webp`;
  }
  if (width > 1400) {
    await sharp(src)
      .resize(1400, Math.round((height * 1400) / width), { fit: "inside", kernel: "lanczos3" })
      .webp({ quality: 88, effort: 4 })
      .toFile(path.join(dstDir, `${stem}-md.webp`));
    image.large = `${stem}-md.webp`;
  }
  return image;
}

async function buildCover() {
  const hero = path.join(SRC, HERO);
  const dir = path.join(PUBLIC, "images", "covers");
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(hero, path.join(dir, "clocks.webp"));
  const { width, height } = await sharp(hero).metadata();
  await sharp(hero)
    .resize(1400, Math.round((height * 1400) / width), { fit: "inside" })
    .webp({ quality: 88, effort: 4 })
    .toFile(path.join(dir, "clocks-md.webp"));
  await sharp(hero)
    .resize(640, Math.round((height * 640) / width), { fit: "inside" })
    .webp({ quality: 82, effort: 4 })
    .toFile(path.join(dir, "clocks-sm.webp"));
  return { width, height };
}

async function run() {
  const catalogPath = path.join(SRC, CATALOG);
  if (!fs.existsSync(catalogPath)) {
    console.error(`Source catalog file not found: ${catalogPath}`);
    process.exitCode = 1;
    return;
  }
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

  const dataPath = path.join(PUBLIC, "data", "data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const category = data.categories.find((c) => c.id === "clocks");
  const insertAt = data.products.findIndex((p) => p.categoryId === "clocks");

  // Remove the previous clock images before the new ones are written.
  const productsDir = path.join(PUBLIC, "images", "products");
  for (const old of data.products.filter((p) => p.categoryId === "clocks")) {
    fs.rmSync(path.join(productsDir, old.id), { recursive: true, force: true });
  }
  fs.rmSync(path.join(PUBLIC, "images", "covers", "clocks.png"), { force: true });

  console.log("Building Clocks collection cover...");
  const cover = await buildCover();

  const products = [];
  for (const item of catalog.products) {
    const id = `clock-${pad(item.id)}`;
    const dstDir = path.join(productsDir, id);
    fs.mkdirSync(dstDir, { recursive: true });
    console.log(`Processing ${item.name} (${id})...`);

    const images = [];
    for (const [i, file] of item.images.entries()) {
      const image = await copyImage(path.join(SRC, file), dstDir, String(i + 1));
      const dir = `images/products/${id}/`;
      images.push({
        src: dir + image.src,
        large: dir + image.large,
        thumb: dir + image.thumb,
        width: image.width,
        height: image.height,
      });
    }

    const isWall = item.category === "Wall Clock";
    products.push({
      id,
      categoryId: "clocks",
      productType: "clock",
      clockType: isWall ? "Wall Clocks" : "Desk Clocks",
      name: item.name,
      sourceName: item.name,
      brand: "Alberto",
      price: item.price.amount,
      currency: item.price.currency,
      modelNumber: item.sku,
      description: item.description,
      specifications: {
        clockType: isWall ? "Wall Clock" : "Desk Clock",
        movement: item.movement,
        materials: `${item.material}; ${item.finish} finish`,
      },
      style: item.style,
      colors: item.color,
      stock: item.stock,
      images,
      isDemoData: true,
      dataNote: NOTE,
    });
  }

  data.categories[data.categories.indexOf(category)] = {
    ...category,
    description:
      "Wall clocks in brass, gold-tone and marble-style finishes, with a compact desk clock, crafted for distinguished interiors.",
    cover: {
      src: "images/covers/clocks.webp",
      large: "images/covers/clocks-md.webp",
      thumb: "images/covers/clocks-sm.webp",
      width: cover.width,
      height: cover.height,
    },
    productIds: products.map((p) => p.id),
  };
  data.products.splice(
    insertAt,
    data.products.filter((p) => p.categoryId === "clocks").length,
    ...products,
  );

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2).replace(/\n/g, "\r\n"));
  console.log(`Clocks collection updated: ${products.length} models.`);
}

run().catch((err) => {
  console.error("Error building clocks collection:", err);
  process.exit(1);
});
