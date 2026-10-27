import { useMemo } from "react";
import HoverRevealCards from "../components/Cards";
import { InteractiveHoverButton } from "../components/HoverEffectButton";
import AnimatedTestimonials from "../components/TestimonialsCarousel";
import Aurora from "../components/ui/Aurora";
import { assetUrl } from "../lib/assets";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { site } from "../config/site";
import { cleanSpec, formatPrice, plural } from "../lib/format";
import CatalogGate from "../features/CatalogGate";

function Hero({ data }) {
  // Same tagline text, split at its sentence break so the second sentence can carry the gold accent.
  const [tagA, ...tagRest] = site.tagline.split(/(?<=\.)\s+/);
  const minPrice = Math.min(...data.products.map((p) => p.price));
  return (
    <Aurora theme="dark" className="hero-aurora" duration={26} intensity={0.2} style={{ "--hero-bg": `url(${new URL(assetUrl("images/hero/hero-bg.webp"), document.baseURI).href})` }}>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <h1 id="hero-title" className="t-hero">
          <span className="hero__tag-a">{tagA}</span>
          {tagRest.length > 0 && <span className="hero__tag-b">{tagRest.join(" ")}</span>}
        </h1>
        <p className="hero__lead">
          Discover thoughtfully selected timepieces where precision meets timeless design. A quiet statement,
          for every chapter.
        </p>
        <div className="hero__actions">
          <InteractiveHoverButton text="Explore collections" href="#/collections" className="w-60" />
          <a className="text-link" href="#/price-list">
            View the price list
          </a>
        </div>
        <dl className="hero__facts">
          <div>
            <dt>Watches</dt>
            <dd>{data.products.length}</dd>
          </div>
          <div>
            <dt>Collections</dt>
            <dd>{data.categories.length}</dd>
          </div>
          <div>
            <dt>Prices from</dt>
            <dd>{formatPrice(minPrice, data.currency)}</dd>
          </div>
        </dl>
      </div>
    </section>
    </Aurora>
  );
}

function Collections({ data }) {
  const items = data.categories.map((category) => {
    const list = data.productsByCategory.get(category.id);
    const from = Math.min(...list.map((p) => p.price));
    return {
      id: category.id,
      title: category.name,
      subtitle: `${plural(list.length, "watch", "watches")} · from ${formatPrice(from, data.currency)}`,
      imageUrl: category.coverUrl,
      imagePosition: "25% 50%",
      href: `#/collections/${category.id}`,
    };
  });
  return (
    <section className="section" aria-labelledby="collections-title">
      <div className="section__head">
        <h2 id="collections-title" className="t-h2">
          Find your signature
        </h2>
        <p className="section__intro">
          Six distinct expressions of time. Choose a collection to explore its twelve thoughtfully selected
          timepieces.
        </p>
      </div>
      <HoverRevealCards items={items} className="max-w-none p-0 sm:grid-cols-2 md:grid-cols-3" />
    </section>
  );
}

function Movements({ data }) {
  const counts = useMemo(() => {
    const map = new Map();
    for (const p of data.products) {
      const movement = cleanSpec(p.specifications.movement);
      map.set(movement, (map.get(movement) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);
  return (
    <section className="section section--band" aria-labelledby="tech-title">
      <h2 id="tech-title" className="t-h2">
        What is inside
      </h2>
      <ul className="stat-row">
        {counts.map(([movement, count]) => (
          <li key={movement}>
            <strong>{count}</strong>
            <span>{movement}</span>
          </li>
        ))}
      </ul>
      <InteractiveHoverButton text="Read about the technology" href="#/technology" className="w-72" />
    </section>
  );
}

// Content taken from the supplied customer review cards (customer_review.zip); photos are cropped from those cards.
const REVIEWS = [
  { name: "Alexander Reed", designation: "London, UK", src: "images/reviews/alexander-reed.webp", rating: 5, verified: true,
    quote: "The craftsmanship is simply outstanding. Every detail feels intentional, from the weight to the finish. Alberto has truly set a new standard in luxury watches." },
  { name: "Sophia Martinez", designation: "Los Angeles, USA", src: "images/reviews/sophia-martinez.webp", rating: 5, verified: true,
    quote: "Absolutely in love with my Alberto watch! The design is timeless, the quality is outstanding, and the attention to detail is remarkable. It’s more than just a watch — it’s a statement of elegance and class." },
  { name: "William Carter", designation: "New York, USA", src: "images/reviews/william-carter.webp", rating: 5, verified: true,
    quote: "The Alberto watch is a masterpiece of craftsmanship. The attention to detail, premium materials, and elegant design make it worth every penny. It’s more than just a watch — it’s a statement of success." },
  { name: "Olivia Bennett", designation: "Sydney, Australia", src: "images/reviews/olivia-bennett.webp", rating: 5, verified: true,
    quote: "I’ve owned several luxury watches over the years, but Alberto truly stands out. The craftsmanship, attention to detail, and timeless design are unmatched. It’s not just a watch — it’s a piece of art on my wrist." },
].map((r) => ({ ...r, src: assetUrl(r.src) }));

function Reviews() {
  return (
    <section className="section" aria-labelledby="reviews-title">
      <div className="section__head">
        <h2 id="reviews-title" className="t-h2">Customer reviews</h2>
      </div>
      <AnimatedTestimonials testimonials={REVIEWS} autoplay />
    </section>
  );
}

function Statement() {
  return (
    <section className="statement" aria-label="A note on time">
      <blockquote>
        <p>“The best things in life aren’t rushed. They’re made to last.”</p>
      </blockquote>
    </section>
  );
}

export default function HomePage() {
  useDocumentTitle("");
  return (
    <CatalogGate>
      {(data) => (
        <>
          <Hero data={data} />
          <Collections data={data} />
          <Movements data={data} />
          <Reviews />
          <Statement />
        </>
      )}
    </CatalogGate>
  );
}
