import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useWishlist } from "../context/WishlistContext";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";
import ProductGrid from "../features/ProductGrid";

export default function WishlistPage() {
  useDocumentTitle("Wishlist");
  const wishlist = useWishlist();
  return (
    <CatalogGate>
      {(data) => {
        const products = wishlist.ids.map((id) => data.byId.get(id)).filter(Boolean);
        return (
          <div className="page">
            <PageHeader title="Wishlist" intro="Watches you have saved on this device." />
            {products.length === 0 ? (
              <div className="state-card state-card--inline">
                <p>Your wishlist is empty. Tap the heart on any watch to save it here.</p>
                <InteractiveHoverButton text="Browse watches" href="#/collections/all" className="w-52" />
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        );
      }}
    </CatalogGate>
  );
}
