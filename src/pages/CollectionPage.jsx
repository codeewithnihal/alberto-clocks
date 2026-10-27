import { useMemo } from "react";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { Input } from "../components/ui/Input";
import { Link, useRouter } from "../lib/router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cleanSpec, plural } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import PageHeader, { Breadcrumb } from "../features/PageHeader";
import ProductGrid from "../features/ProductGrid";

const SORTS = {
  featured: { label: "Featured", fn: null },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  name: { label: "Name: A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
};

function Listing({ data, categoryId }) {
  const { query, setQuery } = useRouter();
  const category = categoryId === "all" ? null : data.categoryById.get(categoryId);
  const q = query.q ?? "";
  const sort = SORTS[query.sort] ? query.sort : "featured";
  const movement = query.movement ?? "";

  const base = category ? data.productsByCategory.get(category.id) : data.products;
  const movements = useMemo(() => [...new Set(base.map((p) => p.specifications.movement))].sort(), [base]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = base.filter(
      (p) => (!needle || p.name.toLowerCase().includes(needle)) && (!movement || p.specifications.movement === movement)
    );
    if (SORTS[sort].fn) list = [...list].sort(SORTS[sort].fn);
    return list;
  }, [base, q, sort, movement]);

  const title = category ? category.name : "All watches";
  useDocumentTitle(title);

  if (categoryId !== "all" && !category) {
    return (
      <div className="state-card">
        <h1 className="t-h1">Collection not found</h1>
        <InteractiveHoverButton text="All collections" href="#/collections" className="w-52" />
      </div>
    );
  }

  const filtered = Boolean(q || movement);

  return (
    <div className="page">
      <Breadcrumb items={[{ label: "Collections", to: "/collections" }, { label: title }]} />
      <PageHeader
        title={title}
        intro={category ? category.description : `Every watch in the catalogue – ${plural(data.products.length, "timepiece")}.`}
      />

      <nav className="chips" aria-label="Collections">
        <Link to="/collections/all" className="chip" activeClassName="is-active">
          All
        </Link>
        {data.categories.map((c) => (
          <Link key={c.id} to={`/collections/${c.id}`} className="chip" activeClassName="is-active">
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="toolbar" role="search">
        <p className="toolbar__count" role="status" aria-live="polite">
          {plural(visible.length, "watch", "watches")}
        </p>
        <label className="field field--inline">
          <span className="sr-only">Search by name</span>
          <Input
            type="search"
            placeholder="Search by name"
            value={q}
            onChange={(e) => setQuery({ q: e.target.value })}
            className="toolbar__search"
          />
        </label>
        <label className="field field--inline">
          <span className="field__label">Movement</span>
          <select value={movement} onChange={(e) => setQuery({ movement: e.target.value })}>
            <option value="">All</option>
            {movements.map((m) => (
              <option key={m} value={m}>
                {cleanSpec(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span className="field__label">Sort</span>
          <select value={sort} onChange={(e) => setQuery({ sort: e.target.value === "featured" ? "" : e.target.value })}>
            {Object.entries(SORTS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ProductGrid
        products={visible}
        empty={
          <>
            No watches match your filters.{" "}
            {filtered && (
              <button type="button" className="text-link" onClick={() => setQuery({ q: "", movement: "", sort: "" })}>
                Clear filters
              </button>
            )}
          </>
        }
      />
    </div>
  );
}

export default function CollectionPage() {
  const { params } = useRouter();
  return <CatalogGate>{(data) => <Listing data={data} categoryId={params.categoryId} />}</CatalogGate>;
}
