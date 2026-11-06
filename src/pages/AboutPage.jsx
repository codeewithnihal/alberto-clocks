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
    "Learn about Alberto Watch Company's heritage, dedication to craft, and watchmaking philosophy."
  );
  return (
    <CatalogGate>
      {(data) => (
        <div className="page">
          <PageHeader title="Timepieces crafted with a distinct point of view." />
          <div className="about">
            <div className="about__copy" data-aos="fade-up">
              <p>
                We believe the right timepiece does more than tell time. It carries your story, marks your
                milestones, and quietly says something about who you are.
              </p>
              <p>
                {site.name} presents {plural(data.categories.length, "collection")} – luxury, vintage,
                chronograph, smart, women’s and sports – with {plural(data.products.length, "watch", "watches")} to
                choose from.
              </p>
              <h2 className="t-h2">Get in touch</h2>
              <address className="about__contact">
                {site.contact.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <a href={site.contact.phoneHref}>{site.contact.phone}</a>
                <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </address>
              <InteractiveHoverButton text="Contact us" href="#/contact" className="w-48" />
            </div>
            <img src={assetUrl("brand/logo-full.webp")} alt={`${site.name} logo`} width="640" height="412" className="about__logo" loading="lazy" data-aos="fade-up" data-aos-delay="100" />
          </div>
        </div>
      )}
    </CatalogGate>
  );
}
