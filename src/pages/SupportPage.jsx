import { InteractiveHoverButton } from "../components/HoverEffectButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { site } from "../config/site";
import PageHeader from "../features/PageHeader";

const HELP = [
  { title: "Message the team", text: "Questions about a watch or an order request.", to: "/contact", cta: "Contact us" },
  { title: "Visit or call", text: "Addresses and phone numbers.", to: "/stores", cta: "Store locator" },
  { title: "Check prices", text: "Every watch and its price on one page.", to: "/price-list", cta: "Price list" },
  { title: "Understand the specifications", text: "What movements, cases and glass mean.", to: "/technology", cta: "Technology" },
];

export default function SupportPage() {
  useDocumentTitle("Support");
  return (
    <div className="page">
      <PageHeader title="Support" intro="Choose the quickest way to get help." />
      <ul className="help-grid">
        {HELP.map((item) => (
          <li key={item.to}>
            <h2 className="help__title">{item.title}</h2>
            <p>{item.text}</p>
            <InteractiveHoverButton text={item.cta} href={`#${item.to}`} className="w-52" />
          </li>
        ))}
      </ul>
      <p className="muted">
        Email <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or call{" "}
        <a href={site.contact.phoneHref}>{site.contact.phone}</a>.
      </p>
    </div>
  );
}
