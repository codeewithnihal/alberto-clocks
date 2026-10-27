import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { InteractiveHoverButton } from "./HoverEffectButton";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { formatPrice } from "../lib/format";

/**
 * Product card: image (carousel when there are several), wishlist heart, optional
 * option pickers, and an "Add to cart" button built on the hover-effect component.
 *
 * Nothing is invented: rating, reviews, badges, colours, sizes, shipping and the
 * original price are only shown when you pass them.
 *
 * Props:
 *  name, subtitle, href (makes image + name a link), price, originalPrice,
 *  currency (ISO code, default "USD"), images[], imageClassName (default "aspect-[3/4]"),
 *  imageFit ("cover" | "contain" – use contain to never crop the photo), imageSize {width,height},
 *  colors[], sizes[], rating, reviewCount, isNew, isBestSeller, discount, freeShipping,
 *  wishlisted (controlled heart; leave undefined for an uncontrolled one),
 *  onAddToCart(item), onToggleWishlist(isWishlisted), className
 */
export function ProductCard({
  name = "Product name",
  subtitle,
  href,
  price = 0,
  originalPrice,
  currency = "USD",
  images = [],
  imageClassName = "aspect-[3/4]",
  imageFit = "cover",
  imageSize = { width: 512, height: 512 },
  colors = [],
  sizes = [],
  rating,
  reviewCount,
  isNew = false,
  isBestSeller = false,
  discount,
  freeShipping = false,
  wishlisted,
  onAddToCart,
  onToggleWishlist,
  className,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [localWishlisted, setLocalWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const timer = useRef(null);

  // Fixed: the original left its setTimeout calls running after unmount.
  useEffect(() => () => clearTimeout(timer.current), []);

  const isWishlisted = wishlisted ?? localWishlisted;
  const discountPercent =
    discount ?? (originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0);

  const imageCount = images.length;
  const nextImage = (event) => {
    event.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageCount);
  };
  const prevImage = (event) => {
    event.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const handleAddToCart = () => {
    if (isAdded) return;
    onAddToCart?.({ name, price, color: selectedColor, size: selectedSize });
    setIsAdded(true);
    timer.current = setTimeout(() => setIsAdded(false), 2000);
  };

  const toggleWishlist = (event) => {
    event.stopPropagation();
    const next = !isWishlisted;
    setLocalWishlisted(next);
    onToggleWishlist?.(next);
  };

  const image =
    imageCount > 0 ? (
      <motion.img
        key={currentImageIndex}
        src={images[currentImageIndex]}
        alt={`${name}${imageCount > 1 ? ` – view ${currentImageIndex + 1}` : ""}`}
        className={cn("h-full w-full", imageFit === "contain" ? "object-contain" : "object-cover")}
        loading="lazy"
        decoding="async"
        width={imageSize.width}
        height={imageSize.height}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    ) : (
      <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" aria-hidden="true" />
    );

  return (
    <Card className={cn("group w-full max-w-sm overflow-hidden rounded-md bg-card text-card-foreground shadow-none", className)}>
      {/* Image */}
      <div className={cn("relative overflow-hidden", imageClassName)}>
        {href ? (
          <a href={href} className="block h-full w-full" aria-label={`${name}, view details`} tabIndex={-1}>
            {image}
          </a>
        ) : (
          image
        )}

        {/* Navigation arrows */}
        {imageCount > 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Previous image"
              className="pointer-events-auto h-8 w-8 rounded-full bg-background/80 shadow-sm backdrop-blur-sm"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Next image"
              className="pointer-events-auto h-8 w-8 rounded-full bg-background/80 shadow-sm backdrop-blur-sm"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Image indicators */}
        {imageCount > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentImageIndex ? "w-4 bg-primary" : "w-1.5 bg-primary/30"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        )}

        {/* Badges (only when asked for) */}
        {(isNew || isBestSeller || discountPercent > 0) && (
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {isNew && <Badge>New</Badge>}
            {isBestSeller && <Badge variant="secondary">Best seller</Badge>}
            {discountPercent > 0 && <Badge variant="destructive">-{discountPercent}%</Badge>}
          </div>
        )}

        {/* Wishlist button */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={isWishlisted}
          className={cn(
            "absolute right-3 top-3 h-9 w-9 rounded-full bg-background/85 shadow-sm backdrop-blur-sm",
            isWishlisted && "text-primary"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </Button>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            <h3 className="line-clamp-1 font-heading text-xl font-semibold leading-snug">
              {href ? (
                <a href={href} className="hover:text-primary focus-visible:text-primary">
                  {name}
                </a>
              ) : (
                name
              )}
            </h3>
            {rating != null && (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden="true" />
                  <span className="ml-1 text-sm font-medium">{rating}</span>
                </div>
                {reviewCount != null && (
                  <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
                )}
              </div>
            )}
            {freeShipping && <p className="mt-1 text-xs text-muted-foreground">Free shipping</p>}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tabular-nums">{formatPrice(price, currency)}</span>
            {originalPrice > price && (
              <span className="text-sm tabular-nums text-muted-foreground line-through">
                {formatPrice(originalPrice, currency)}
              </span>
            )}
          </div>

          {/* Optional colours & sizes */}
          {(colors.length > 0 || sizes.length > 0) && (
            <div className="space-y-3">
              {colors.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs text-muted-foreground">Colors</div>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-6 w-6 rounded-full transition-all ${
                          selectedColor === color
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "ring-1 ring-muted hover:ring-primary"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                        aria-pressed={selectedColor === color}
                      />
                    ))}
                  </div>
                </div>
              )}
              {sizes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs text-muted-foreground">Sizes</div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`h-8 min-w-[2.5rem] rounded-md px-2 text-xs font-medium transition-all ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 hover:bg-muted"
                        }`}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <InteractiveHoverButton
            text={isAdded ? "Added to cart" : "Add to cart"}
            className="w-full"
            onClick={handleAddToCart}
            aria-label={`Add ${name} to cart`}
            aria-live="polite"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
