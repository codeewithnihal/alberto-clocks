import { useDocumentTitle } from "../hooks/useDocumentTitle";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";

export default function SiteMapPage() {
  useDocumentTitle("Site map");
  return (
    <CatalogGate>
      {(data) => (
        <div className="page">
          <PageHeader title="Site map" />
          <div className="sitemap">
            <section aria-labelledby="sm-shop">
              <h2 id="sm-shop" className="sitemap__title">Shop</h2>
              <ul>
                <li><a href="#/collections">Collections</a>
                  <ul>
                    <li><a href="#/collections/all">All watches</a></li>
                    {data.categories.map((c) => (
                      <li key={c.id}><a href={`#/collections/${c.id}`}>{c.name}</a></li>
                    ))}
                  </ul>
                </li>
                <li><a href="#/price-list">Price list</a></li>
                <li><a href="#/wishlist">Wishlist</a></li>
                <li><a href="#/cart">Cart</a></li>
                <li><a href="#/checkout">Checkout</a></li>
              </ul>
            </section>
            <section aria-labelledby="sm-discover">
              <h2 id="sm-discover" className="sitemap__title">Discover</h2>
              <ul>
                <li><a href="#/">Home</a></li>
                <li><a href="#/technology">Technology</a></li>
                <li><a href="#/gallery">Gallery</a></li>
                <li><a href="#/about">About us</a></li>
              </ul>
            </section>
            <section aria-labelledby="sm-help">
              <h2 id="sm-help" className="sitemap__title">Help</h2>
              <ul>
                <li><a href="#/stores">Store locator</a></li>
                <li><a href="#/support">Support</a></li>
                <li><a href="#/contact">Contact us</a></li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </CatalogGate>
  );
}
