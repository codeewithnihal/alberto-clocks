import ProductTile from "./ProductTile";

export default function ProductGrid({ products, empty }) {
  if (products.length === 0) return <div className="empty-state">{empty ?? "No watches to show."}</div>;
  return (
    <ul className="product-grid">
      {products.map((product) => (
        <li key={product.id}>
          <ProductTile product={product} />
        </li>
      ))}
    </ul>
  );
}
