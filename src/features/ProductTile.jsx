import { useRef, useState } from "react";
import { Eye } from "lucide-react";
import ProductCard from "../components/WishlistCart";
import { useCatalogState } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import ProductDetailModal from "./ProductDetailModal";

/**
 * Product tile wired to catalogue data, cart, wishlist, and popup details modal.
 * Clicking the watch or its quick-view action opens full details in a modal popup.
 */
export default function ProductTile({ product }) {
  const { data } = useCatalogState();
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const cardRef = useRef(null);
  const category = data?.categoryById.get(product.categoryId);

  return (
    <>
      <div ref={cardRef} className="product-tile-wrapper relative">
        <ProductCard
          name={product.name}
          subtitle={category?.name}
          href={`/product/${product.id}`}
          onSelect={() => setModalOpen(true)}
          price={product.price}
          currency={product.currency}
          images={[product.imageUrl]}
          imageClassName="aspect-square bg-card"
          imageFit="contain"
          imageSize={product.imageSize}
          className="max-w-none"
          wishlisted={wishlist.has(product.id)}
          onToggleWishlist={(isOn) => {
            wishlist.toggle(product.id);
            toast.push({
              variant: "info",
              title: isOn ? "Added to wishlist" : "Removed from wishlist",
              description: product.name,
            });
          }}
          onAddToCart={() => {
            cart.add(product.id);
            toast.push({
              variant: "success",
              title: "Added to cart",
              description: product.name,
            });
          }}
        />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="product-tile__quick-view"
          aria-label={`Quick view ${product.name} details in popup`}
          title="Quick view details"
        >
          <Eye size={14} aria-hidden="true" />
          <span>Quick view</span>
        </button>
      </div>

      {modalOpen && (
        <ProductDetailModal
          product={product}
          category={category}
          triggerElement={cardRef.current}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
