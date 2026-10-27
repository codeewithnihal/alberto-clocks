import { useCallback } from "react";
import BackToTop from "../components/BackToTop";
import Footer from "../components/Footer";
import { RouteView } from "../lib/router";
import { site } from "../config/site";
import { submitForm, NOT_CONNECTED } from "../services/submit";
import SiteHeader from "./SiteHeader";
import GoldReveal from "./GoldReveal";
import TickerBar from "./TickerBar";
import { AnimatedLoadingSkeleton } from "../components/LoadingSkeleton";
import NotFoundPage from "../pages/NotFoundPage";

const QUICK_LINKS = [
  { label: "Home", href: "#/" },
  { label: "Collections", href: "#/collections" },
  { label: "Price list", href: "#/price-list" },
  { label: "Gallery", href: "#/gallery" },
  { label: "About us", href: "#/about" },
  { label: "Contact us", href: "#/contact" },
  { label: "Site map", href: "#/sitemap" },
];

const socialLinks = site.social.map((s) => (s.id === "email" ? { ...s, href: `mailto:${site.contact.email}` } : s));

export default function Layout() {
  const subscribe = useCallback(async (email) => {
    const { delivered } = await submitForm("newsletter", { email });
    return { message: delivered ? "Thank you for subscribing." : NOT_CONNECTED };
  }, []);

  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="site-main">
        <RouteView fallback={<div className="page-loading"><AnimatedLoadingSkeleton /></div>} notFound={NotFoundPage} />
      </main>
      <Footer
        brandName={site.name}
        quickLinks={QUICK_LINKS}
        contact={site.contact}
        socialLinks={socialLinks}
        showMissingLinks={import.meta.env.DEV}
        onSubscribe={subscribe}
      />
      <TickerBar />
      <BackToTop />
      <GoldReveal />
    </>
  );
}
