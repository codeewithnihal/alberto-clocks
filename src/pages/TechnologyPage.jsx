import { useMemo } from "react";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { plural } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";

import { cleanSpec, isUnverifiedSpec } from "../lib/format";

// General explanations of the terms that appear in the catalogue data.
const EXPLAIN = {
  movement: {
    Automatic:
      "A mechanical movement that winds itself from the motion of the wearer’s wrist.",
    Quartz:
      "A battery-powered movement regulated by a vibrating quartz crystal.",
    "Smart wearable":
      "A connected watch with a digital display, powered by a rechargeable battery.",
  },
  strapMaterial: {
    "Silicone or rubber":
      "Flexible, water-friendly strap material used on the sport and smart models.",
  },
};

const GROUPS = [
  { key: "movement", title: "Movements" },
  { key: "caseMaterial", title: "Case" },
  { key: "glass", title: "Glass" },
  { key: "waterResistance", title: "Water resistance" },
  { key: "strapMaterial", title: "Strap" },
];

function Technology({ data }) {
  const tables = useMemo(
    () =>
      GROUPS.map((group) => {
        const counts = new Map();
        for (const p of data.products) {
          const raw = p.specifications[group.key];
          if (raw == null || isUnverifiedSpec(raw)) continue;
          const value = cleanSpec(raw);
          const entry = counts.get(value) ?? {
            total: 0,
            byCategory: new Map(),
          };
          entry.total += 1;
          entry.byCategory.set(
            p.categoryId,
            (entry.byCategory.get(p.categoryId) ?? 0) + 1,
          );
          counts.set(value, entry);
        }
        return {
          ...group,
          rows: [...counts.entries()].sort((a, b) => b[1].total - a[1].total),
        };
      }).filter((group) => group.rows.length > 0),
    [data],
  );

  return (
    <div className="page">
      <PageHeader
        title="Technology"
        intro="What goes into the watches in the catalogue, taken directly from each watch’s specification sheet."
      />

      {tables.map((group) => (
        <section
          key={group.key}
          className="tech"
          aria-labelledby={`tech-${group.key}`}
          data-aos="fade-up"
        >
          <h2 id={`tech-${group.key}`} className="t-h2">
            {group.title}
          </h2>
          <ul className="tech__rows">
            {group.rows.map(([value, entry]) => (
              <li key={value}>
                <div>
                  <h3>{value}</h3>
                  {EXPLAIN[group.key]?.[value] && (
                    <p>{EXPLAIN[group.key][value]}</p>
                  )}
                </div>
                <div className="tech__meta">
                  <strong>{plural(entry.total, "watch", "watches")}</strong>
                  <span className="muted">
                    {[...entry.byCategory.entries()]
                      .map(
                        ([id, n]) =>
                          `${data.categoryById.get(id)?.name} (${n})`,
                      )
                      .join(" · ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="pt-12 pb-6 flex flex-col items-center justify-center text-center">
        <h3 className="t-h2 mb-2">Explore every timepiece</h3>
        <p className="text-muted-foreground mb-6 max-w-lg">
          Browse our complete catalog to find the movement, case material, and strap engineered for you.
        </p>
        <InteractiveHoverButton
          text="Browse all watches"
          href="/collections/all"
          className="w-64"
        />
      </div>
    </div>
  );
}

export default function TechnologyPage() {
  useDocumentTitle(
    "Technology",
    "Discover the engineering, mechanical and quartz movements, sapphire crystals, and cases behind Alberto watches.",
  );
  return <CatalogGate>{(data) => <Technology data={data} />}</CatalogGate>;
}
