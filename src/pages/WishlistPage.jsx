import { Heart } from "lucide-react";
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
        const products = wishlist.ids
          .map((id) => data.byId.get(id))
          .filter(Boolean);
        return (
          <div className="page">
            <PageHeader
              title="Wishlist"
              intro="Watches you have saved on this device."
            />
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-4 my-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <Heart size={24} aria-hidden="true" />
                </div>
                <h2 className="t-h2 text-xl font-semibold">Your wishlist is empty</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Explore our collections and tap the heart icon on any timepiece to save it here.
                </p>
                <div className="pt-2">
                  <InteractiveHoverButton
                    text="Browse watches"
                    href="/collections/all"
                    className="w-56"
                  />
                </div>
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
