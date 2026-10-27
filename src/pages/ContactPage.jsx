import { useCallback, useMemo } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "../components/ContactForm";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { site } from "../config/site";
import { submitForm, NOT_CONNECTED } from "../services/submit";

export default function ContactPage() {
  useDocumentTitle("Contact us");
  const links = useMemo(
    () => [
      { icon: Mail, label: site.contact.email, href: `mailto:${site.contact.email}` },
      { icon: Phone, label: site.contact.phone, href: site.contact.phoneHref },
      { icon: MapPin, label: site.contact.address.join(", "), href: "#/stores" },
    ],
    []
  );
  const onSubmit = useCallback(async (values) => {
    const { delivered } = await submitForm("contact", values);
    return { message: delivered ? "Thank you! Your message has been sent." : NOT_CONNECTED };
  }, []);

  return (
    <ContactForm
      title="Contact us"
      subtitle="We’d love to hear from you"
      description="Questions about a watch, an order or anything else? Send us a message or use the details below."
      contactLinks={links}
      onSubmit={onSubmit}
    />
  );
}
