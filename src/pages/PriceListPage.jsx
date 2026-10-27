import { useMemo } from "react";
import { Input } from "../components/ui/Input";
import { useRouter } from "../lib/router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cleanSpec, formatPrice, plural } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";

const SORTS = {
  category: (a, b) => 0,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

function PriceList({ data }) {
  const { query, setQuery } = useRouter();
  const q = query.q ?? "";
  const cat = query.category ?? "";
  const sort = SORTS[query.sort] ? query.sort : "category";

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = data.products.filter(
      (p) => (!cat || p.categoryId === cat) && (!needle || p.name.toLowerCase().includes(needle))
    );
    return sort === "category" ? list : [...list].sort(SORTS[sort]);
  }, [data, q, cat, sort]);

  return (
    <div className="page">
      <PageHeader title="Price list" intro="Every watch and its price in one place." />
      <p className="notice">{data.note}</p>
      <div className="toolbar" role="search">
        <p className="toolbar__count" role="status" aria-live="polite">
          {plural(rows.length, "watch", "watches")}
        </p>
        <label className="field field--inline">
          <span className="sr-only">Search by name</span>
          <Input type="search" placeholder="Search by name" value={q} onChange={(e) => setQuery({ q: e.target.value })} className="toolbar__search" />
        </label>
        <label className="field field--inline">
          <span className="field__label">Collection</span>
          <select value={cat} onChange={(e) => setQuery({ category: e.target.value })}>
            <option value="">All</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span className="field__label">Sort</span>
          <select value={sort} onChange={(e) => setQuery({ sort: e.target.value === "category" ? "" : e.target.value })}>
            <option value="category">By collection</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
      </div>

      <div className="table-wrap" tabIndex={0} role="region" aria-label="Price list table">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Watch</th>
              <th scope="col">Collection</th>
              <th scope="col">Movement</th>
              <th scope="col" className="num">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <th scope="row">
                  <a href={`#/product/${p.id}`}>{p.name}</a>
                </th>
                <td>{data.categoryById.get(p.categoryId)?.name}</td>
                <td>{cleanSpec(p.specifications.movement)}</td>
                <td className="num tabular">{formatPrice(p.price, p.currency)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No watches match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PriceListPage() {
  useDocumentTitle("Price list");
  return <CatalogGate>{(data) => <PriceList data={data} />}</CatalogGate>;
}
