"""Re-creates public/images + public/data/data.json from the supplied images.zip (already run once; kept so the
catalogue can be regenerated, e.g. after replacing images). Builds public/images + public/data/data.json from the supplied images.zip.
- originals are copied byte-for-byte (never re-encoded)
- derivatives: `large` (<=1400 px wide, WebP q88, only if the original is wider) and `thumb` (640 px, WebP q82)
- mapping is taken from the supplied watch_products_data.json, then corrected where the audit found problems
"""
import json, os, re, shutil, sys
from multiprocessing import Pool
from PIL import Image

# usage: python tools/build_catalog.py <folder that contains "images/" from images.zip> [public dir]
# needs: pip install pillow
SRC = sys.argv[1] if len(sys.argv) > 1 else "./imgs"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
KEYS = ["front", "angle45", "side", "back", "boxPresentation"]

# --- primary (card / first gallery) image: which supplied view shows the watch face best (checked by eye) ---
PRIMARY = {
    "chronograph-001": "side", "chronograph-005": "side", "chronograph-008": "angle45", "chronograph-009": "angle45",
    "chronograph-011": "angle45", "chronograph-012": "back",
    "vintage-006": "angle45", "vintage-007": "boxPresentation", "vintage-008": "back", "vintage-009": "back",
    "vintage-011": "boxPresentation", "vintage-012": "angle45",
    "smart-004": "side", "smart-006": "back", "smart-007": "angle45",
}
# --- cross-contaminated folders found in the audit (images of chronograph 5 and 8 were swapped) ---
SWAPS = [(("chronograph-005", "side"), ("chronograph-008", "side")),
         (("chronograph-005", "back"), ("chronograph-008", "boxPresentation"))]

def tidy(name, cat, num):
    n = re.sub(r"\s+", " ", name).strip()
    label = {"luxury": "Luxury", "vintage": "Vintage", "chronograph": "Chronograph", "sports": "Sport"}.get(cat)
    if re.match(r"^(luxury|vintage|chronograph)\s+(product image( no)?|model)\s*\d+$", n, re.I): return f"{label} {num:02d}"
    m = re.match(r"^(vintage|sport) model (\d+) (.+)$", n, re.I)
    if m: return f"{label} {int(m.group(2)):02d} · {m.group(3)}"
    return n

def work(job):
    src, dst_dir, stem = job
    os.makedirs(dst_dir, exist_ok=True)
    ext = os.path.splitext(src)[1].lower()
    orig = os.path.join(dst_dir, stem + ext); shutil.copyfile(src, orig)
    im = Image.open(src); im.load(); w, h = im.size
    im = im.convert("RGB")
    t = im.copy(); t.thumbnail((640, 640 * 4), Image.LANCZOS)
    if t.width > 640: t = t.resize((640, round(h * 640 / w)), Image.LANCZOS)
    t.save(os.path.join(dst_dir, stem + "-sm.webp"), "WEBP", quality=82, method=4)
    large = None
    if w > 1400:
        l = im.resize((1400, round(h * 1400 / w)), Image.LANCZOS); l.save(os.path.join(dst_dir, stem + "-md.webp"), "WEBP", quality=88, method=4); large = True
    return (src, w, h, ext, large)

def main():
    d = json.load(open(f"{SRC}/images/watch_products_data.json"))
    P = {p["id"]: p for p in d["products"]}
    for (a, ak), (b, bk) in SWAPS:
        P[a]["images"][ak], P[b]["images"][bk] = P[b]["images"][bk], P[a]["images"][ak]
    # vintage-005: JSON referenced 3 of the 5 files in its folder; use all five
    folder = f"{SRC}/images/vintage/products/model 5"
    P["vintage-005"]["images"] = {"front": f"{folder}/01_front_rock.png".replace(SRC + "/", ""), "angle45": f"{folder}/03_front_straight.png".replace(SRC + "/", ""),
                                  "side": f"{folder}/02_side_crown.png".replace(SRC + "/", ""), "back": f"{folder}/05_box2.png".replace(SRC + "/", ""),
                                  "boxPresentation": f"{folder}/04_box.png".replace(SRC + "/", "")}
    # women: names/descriptors from the supplied README
    readme = open(f"{SRC}/images/women/products/README.txt", encoding="utf-8").read()
    women = {int(m.group(1)): (m.group(2).strip(), m.group(3).strip()) for m in re.finditer(r"^(\d\d) ([^-\n]+?) - (.+)$", readme, re.M)}

    if os.path.exists(f"{OUT}/images"): shutil.rmtree(f"{OUT}/images")
    jobs, plan = [], {}
    for p in d["products"]:
        pid = p["id"]; cat = p["categoryId"]; num = int(pid.split("-")[1])
        primary = PRIMARY.get(pid, "front")
        order = [primary] + [k for k in KEYS if k != primary]
        plan[pid] = []
        for i, k in enumerate(order, 1):
            src = f"{SRC}/{p['images'][k]}"; assert os.path.exists(src), src
            jobs.append((src, f"{OUT}/images/products/{pid}", f"{i}")); plan[pid].append(src)
    covers = {}
    for c in d["categories"]:
        src = f"{SRC}/{c['coverImage']}"; assert os.path.exists(src), src
        jobs.append((src, f"{OUT}/images/covers", c["id"])); covers[c["id"]] = src
    print("jobs", len(jobs), flush=True)
    with Pool(4) as pool:
        res = {}
        for n, r in enumerate(pool.imap_unordered(work, jobs, chunksize=2), 1):
            res[r[0]] = r
            if n % 40 == 0: print(n, "done", flush=True)

    cats = []
    for c in d["categories"]:
        _, w, h, ext, large = res[covers[c["id"]]]
        base = f"images/covers/{c['id']}"
        cats.append({"id": c["id"], "name": c["name"], "description": c["description"],
                     "cover": {"src": base + ext, "large": base + ("-md.webp" if large else ext), "thumb": base + "-sm.webp", "width": w, "height": h},
                     "productIds": c["productIds"]})
    prods = []
    for p in d["products"]:
        pid = p["id"]; cat = p["categoryId"]; num = int(pid.split("-")[1]); imgs = []
        for i, src in enumerate(plan[pid], 1):
            _, w, h, ext, large = res[src]; base = f"images/products/{pid}/{i}"
            imgs.append({"src": base + ext, "large": base + ("-md.webp" if large else ext), "thumb": base + "-sm.webp", "width": w, "height": h})
        name, desc = tidy(p["name"], cat, num), p["description"]
        if cat == "womens" and num in women: name, desc = women[num][0], women[num][1] + "."
        prods.append({"id": pid, "categoryId": cat, "name": name, "sourceName": p["name"], "brand": p["brand"], "price": p["price"], "currency": p["currency"],
                      "modelNumber": p["specifications"].get("modelNumber"), "description": desc,
                      "specifications": {k: v for k, v in p["specifications"].items() if k != "modelNumber"},
                      "images": imgs, "isDemoData": p.get("isDemoData", True), "dataNote": p.get("dataNote")})
    out = {"brand": d["brand"], "currency": d["currency"], "note": d["note"].split(" Image paths")[0] if False else "Demo catalogue: prices and specifications are placeholders for website development and must be verified before production use.",
           "categories": cats, "products": prods}
    os.makedirs(f"{OUT}/data", exist_ok=True)
    json.dump(out, open(f"{OUT}/data/data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("DONE", len(prods), "products,", sum(len(p["images"]) for p in prods), "images", flush=True)

if __name__ == "__main__":
    main()
