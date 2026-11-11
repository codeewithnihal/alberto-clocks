import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { site } from "../config/site";
import { assetUrl } from "../lib/assets";
import { plural } from "../lib/format";
import CatalogGate from "../features/CatalogGate";
import PageHeader from "../features/PageHeader";

export default function AboutPage() {
  useDocumentTitle(
    "About us",
    "Learn about Alberto Watch Company's heritage, dedication to craft, and watchmaking philosophy.",
  );
  return (
    <CatalogGate>
      {(data) => (
        <div className="page">
          <PageHeader title="Timepieces crafted with a distinct point of view." />
          <div className="about">
            <div className="about__copy" data-aos="fade-up">
              <p>
                Alberto Watch Company is a full-service watch repair, appraisal,
                and retail establishment offering fine luxury timepieces and clocks.
                We combine traditional horological craftsmanship with first-class service.
              </p>
              <p>
                Our store presents {plural(data.categories.length, "collection")} – luxury,
                vintage, chronograph, smart, women’s and sports timepieces – with{" "}
                {plural(data.products.length, "watch", "watches")} in our current catalogue,
                alongside authorized service for renowned names such as Rolex, Citizen Eco-Drive,
                Bulova, and Michael Kors.
              </p>
              <div className="rounded-xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm space-y-4 w-full">
                <h2 className="t-h2 text-xl font-semibold">Get in touch</h2>
                <address className="about__contact text-sm">
                  {site.contact.address.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                  <a href={site.contact.phoneHref} className="hover:text-primary transition-colors">
                    {site.contact.phone}
                  </a>
                  <a href={`mailto:${site.contact.email}`} className="hover:text-primary transition-colors">
                    {site.contact.email}
                  </a>
                </address>
                <div className="pt-2">
                  <InteractiveHoverButton
                    text="Contact us"
                    href="/contact"
                    className="w-48"
                  />
                </div>
              </div>
            </div>
            <img
              src={assetUrl("brand/logo-full.webp")}
              alt={`${site.name} logo`}
              width="640"
              height="412"
              className="about__logo"
              loading="lazy"
              data-aos="fade-up"
              data-aos-delay="100"
            />
          </div>
        </div>
      )}
    </CatalogGate>
  );
}
