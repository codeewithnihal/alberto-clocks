import { useDocumentTitle } from "../hooks/useDocumentTitle";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";
import { plural } from "../lib/format";

export default function SiteMapPage() {
  useDocumentTitle(
    "Site map",
    "Comprehensive directory of all Alberto Watch Company pages, collections, shopping flows, and customer care services.",
  );

  return (
    <CatalogGate>
      {(data) => (
        <div className="page">
          <PageHeader
            title="Site map"
            intro="Explore the full structure of the Alberto Watch Company website with page descriptions and direct links."
          />

          <div className="sitemap-grid mt-8 space-y-12">
            {/* 1. Shopping & Collections */}
            <section aria-labelledby="sm-shop" className="space-y-6">
              <div className="border-b border-border/80 pb-3">
                <h2 id="sm-shop" className="t-h2 text-2xl font-semibold">
                  Shopping &amp; Collections
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Timepiece collections, pricing tables, and shopping flows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/collections" className="hover:text-primary transition-colors">
                        Collections
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/collections</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Overview of Alberto watch collections and dedicated clock range with design notes, representative models, and price ranges.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Collection Subpages
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      <li>
                        <a href="/collections/all" className="hover:text-primary transition-colors flex items-center justify-between">
                          <span>All timepieces</span>
                          <span className="text-xs text-muted-foreground font-mono">({data.products.length})</span>
                        </a>
                      </li>
                      {data.categories.map((c) => {
                        const count = data.productsByCategory.get(c.id)?.length ?? 0;
                        return (
                          <li key={c.id}>
                            <a href={`/collections/${c.id}`} className="hover:text-primary transition-colors flex items-center justify-between">
                              <span>{c.name}</span>
                              <span className="text-xs text-muted-foreground font-mono">({count})</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/price-list" className="hover:text-primary transition-colors">
                        Price List
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/price-list</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete, sortable directory displaying transparent prices, movements, and specifications for all {data.products.length} timepieces and clocks.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    Includes category filter, name search, and column sorting.
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/cart" className="hover:text-primary transition-colors">
                        Cart
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/cart</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Review selected watches, adjust quantities, calculate order subtotals, and proceed to checkout.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    Synced with your local shopping session.
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/checkout" className="hover:text-primary transition-colors">
                        Checkout
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/checkout</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Place order requests with your contact information, shipping address, and delivery preferences.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    Direct order request submission.
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/wishlist" className="hover:text-primary transition-colors">
                        Wishlist
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/wishlist</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your saved timepieces stored locally on your device for fast reference across browsing visits.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    Save any watch with one click using the heart icon.
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Brand & Discovery */}
            <section aria-labelledby="sm-discover" className="space-y-6">
              <div className="border-b border-border/80 pb-3">
                <h2 id="sm-discover" className="t-h2 text-2xl font-semibold">
                  Brand &amp; Discovery
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Brand heritage, technical horology, and photography galleries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/" className="hover:text-primary transition-colors">
                        Home
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Main entry featuring the interactive 3D Gold Diver watch, signature collection highlights, and client testimonials.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/technology" className="hover:text-primary transition-colors">
                        Technology
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/technology</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Engineering specifications covering automatic, quartz, manual-wind, and smart movements, case metals, and sapphire glass.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/gallery" className="hover:text-primary transition-colors">
                        Gallery
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/gallery</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      High-resolution visual showcase with full-screen lightbox inspection for watch dials, case finishes, and packaging.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/about" className="hover:text-primary transition-colors">
                        About Us
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/about</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Alberto Watch Company history, artisanal craftsmanship values, authorized service credentials, and boutique headquarters.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Customer Care & Services */}
            <section aria-labelledby="sm-help" className="space-y-6">
              <div className="border-b border-border/80 pb-3">
                <h2 id="sm-help" className="t-h2 text-2xl font-semibold">
                  Customer Care &amp; Services
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Boutique locations, assistance channels, and direct inquiry forms.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/stores" className="hover:text-primary transition-colors">
                        Store Locator
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/stores</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Authorized boutique directory with contact numbers, opening hours, showroom addresses, and distance calculator.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/support" className="hover:text-primary transition-colors">
                        Support
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/support</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Customer assistance hub guiding visitors to inquiry channels, price lookups, technical details, and direct contact.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold">
                      <a href="/contact" className="hover:text-primary transition-colors">
                        Contact Us
                      </a>
                    </h3>
                    <p className="text-xs text-primary font-mono mt-0.5">/contact</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Direct customer message form with client-side validation, telephone assistance, email channels, and showroom map.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </CatalogGate>
  );
}
