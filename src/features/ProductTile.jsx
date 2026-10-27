import ProductCard from "../components/WishlistCart";
import { useCatalogState } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

/** The provided ProductCard wired to real catalogue data, the cart, the wishlist and toasts. */
export default function ProductTile({ product }) {
  const { data } = useCatalogState();
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const category = data?.categoryById.get(product.categoryId);

  return (
    <ProductCard
      name={product.name}
      subtitle={category?.name}
      href={`#/product/${product.id}`}
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
        toast.push({ variant: "success", title: "Added to cart", description: product.name });
      }}
    />
  );
}
