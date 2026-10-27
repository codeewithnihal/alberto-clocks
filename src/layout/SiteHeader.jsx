import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Menu as MenuIcon, Moon, Search, ShoppingBag, Sun, X } from "lucide-react";
import { useTheme } from "../lib/theme";
import Navbar from "../components/Navbar";
import { Link, useRouter } from "../lib/router";
import { NAV_LINKS, site } from "../config/site";
import { useCatalogState } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { assetUrl } from "../lib/assets";
import VisitorCounter from "./VisitorCounter";
import SearchOverlay from "./SearchOverlay";

const PRODUCT_PATHS = ["/collections", "/product", "/price-list"];

export default function SiteHeader() {
  const { path } = useRouter();
  const { data } = useCatalogState();
  const cart = useCart();
  const wishlist = useWishlist();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    searchRef.current?.focus();
  }, []);
  const [dark, , toggleTheme] = useTheme();
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const isActive = (link) =>
    link.id === "products"
      ? PRODUCT_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
      : link.to === "/"
        ? path === "/"
        : path === link.to || path.startsWith(`${link.to}/`);

  // Desktop menu data: the Products dropdown lists every collection.
  const menu = useMemo(
    () =>
      NAV_LINKS.map((link) => ({
        id: link.id,
        title: link.title,
        url: `#${link.to}`,
        active: isActive(link),
        dropdown: Boolean(link.dropdown),
        items: link.dropdown
          ? [
              { id: "all", title: "All collections", url: "#/collections" },
              ...(data?.categories ?? []).map((c) => ({ id: c.id, title: c.name, url: `#/collections/${c.id}` })),
              { id: "price-list", title: "Price list", url: "#/price-list" },
            ]
          : undefined,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, path]
  );

  // Close the drawer on navigation, lock page scroll while open, Escape closes.
  useEffect(() => setOpen(false), [path]);
  useEffect(() => setSearchOpen(false), [path]);
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector("a")?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand" aria-label={`${site.name} – home`}>
          <img src={assetUrl("brand/logo-mark.webp")} alt="" width="38" height="37" className="brand__mark" />
          <span className="brand__name">
            Alberto
            <small>Watch Company</small>
          </span>
        </Link>

        <div className="site-header__nav">
          <Navbar list={menu} itemClassName="px-3 py-2 text-sm" />
        </div>

        <div className="site-header__actions">
          <VisitorCounter />
          <button
            ref={searchRef}
            type="button"
            className="icon-link icon-link--search"
            aria-label="Search watches"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
          >
            <Search size={20} aria-hidden="true" />
          </button>
          <Link to="/wishlist" className="icon-link icon-link--wishlist" aria-label={`Wishlist, ${wishlist.count} items`}>
            <Heart size={20} aria-hidden="true" />
            {wishlist.count > 0 && <span className="icon-link__badge">{wishlist.count}</span>}
          </Link>
          <Link to="/cart" className="icon-link" aria-label={`Cart, ${cart.count} items`}>
            <ShoppingBag size={20} aria-hidden="true" />
            {cart.count > 0 && <span className="icon-link__badge">{cart.count}</span>}
          </Link>
          <button
            type="button"
            className="icon-link site-header__theme"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={dark}
            title={dark ? "Light mode" : "Dark mode"}
            onClick={toggleTheme}
          >
            {dark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
          <button
            ref={toggleRef}
            type="button"
            className="icon-link site-header__toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <MenuIcon size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu" data-open={open}>
        <nav aria-label="Mobile">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <Link to={link.to} className="mobile-menu__link" activeClassName="is-active" tabIndex={open ? 0 : -1}>
                  {link.title}
                </Link>
              </li>
            ))}
            {(data?.categories ?? []).map((c) => (
              <li key={c.id} className="mobile-menu__sub">
                <Link to={`/collections/${c.id}`} className="mobile-menu__link" activeClassName="is-active" tabIndex={open ? 0 : -1}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="mobile-menu__link mobile-menu__button"
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
              >
                Search
              </button>
            </li>
            <li>
              <Link to="/wishlist" className="mobile-menu__link" activeClassName="is-active" tabIndex={open ? 0 : -1}>
                Wishlist{wishlist.count > 0 ? ` (${wishlist.count})` : ""}
              </Link>
            </li>
            <li>
              <Link to="/price-list" className="mobile-menu__link" activeClassName="is-active" tabIndex={open ? 0 : -1}>
                Price list
              </Link>
            </li>
            <li>
              <Link to="/contact" className="mobile-menu__link" activeClassName="is-active" tabIndex={open ? 0 : -1}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      {open && <button type="button" className="mobile-menu__scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    </header>
  );
}
