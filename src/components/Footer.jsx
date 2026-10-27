import { useTheme } from "../lib/theme";
import * as React from "react";
import { Moon, Send, Sun, Mail, ArrowUp } from "lucide-react";
import { BRAND_COLORS, SOCIAL_LABELS, SocialIcon } from "./SocialIcons";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/Tooltip";

/**
 * Site footer with newsletter form, links, contact details, optional social links
 * and a light/dark toggle.
 *
 * Props:
 *  - brandName, newsletterText
 *  - quickLinks    { label, href }[]
 *  - contact       { address: string[], phone, phoneHref, email }
 *  - socialLinks   { id, label?, href }[]   id: email | x | instagram | threads | whatsapp | behance | facebook | linkedin | youtube
 *                  Entries without an `href` are hidden (never a dead link) unless showMissingLinks is true,
 *                  which draws them dimmed and inert so the design can be previewed while developing.
 *  - showMissingLinks  boolean (default false)
 *  - legalLinks    { label, href }[]  (none by default)
 *  - onSubscribe   async (email) => { message? } | void
 *  - defaultDarkMode (default true) and onThemeChange(isDark) to persist the choice
 */
function Footer({
  brandName = "Alberto Watch Company",
  newsletterText = "Collection notes and new arrivals, delivered occasionally.",
  quickLinks = [],
  contact,
  socialLinks = [],
  showMissingLinks = false,
  legalLinks = [],
  onSubscribe,
  defaultDarkMode = true,
  onThemeChange,
}) {
  const [isDarkMode, setIsDarkMode] = useTheme();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState({ state: "idle", message: "" });


  const handleSubscribe = async (event) => {
    event.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      const result = await onSubscribe?.(email);
      setEmail("");
      setStatus({ state: "done", message: result?.message ?? "Thank you for subscribing." });
    } catch {
      setStatus({ state: "error", message: "Something went wrong. Please try again." });
    }
  };

  const visibleSocial = socialLinks.filter((social) => social.href || showMissingLinks);

  const chip =
    "border border-dashed border-border bg-muted/40 text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-muted";

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Newsletter */}
          <div className="relative">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight">Stay in touch</h2>
            <p className="mb-6 text-muted-foreground">{newsletterText}</p>
            <form className="relative" onSubmit={handleSubscribe}>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                aria-label="Email address for the newsletter"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pr-12"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Subscribe"
                disabled={status.state === "sending"}
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p
              role="status"
              aria-live="polite"
              className={`mt-3 min-h-[1.25rem] text-sm ${
                status.state === "error" ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {status.message}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick links</h3>
            <nav className="space-y-2 text-sm" aria-label="Footer">
              {quickLinks.map(({ label, href }) => (
                <a key={href} href={href} className="block transition-colors hover:text-primary">
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact us</h3>
            {contact && (
              <address className="space-y-2 text-sm not-italic text-muted-foreground">
                {contact.address?.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {contact.phone && (
                  <p>
                    Phone:{" "}
                    <a href={contact.phoneHref} className="hover:text-primary">
                      {contact.phone}
                    </a>
                  </p>
                )}
                {contact.email && (
                  <p>
                    Email:{" "}
                    <a href={`mailto:${contact.email}`} className="hover:text-primary">
                      {contact.email}
                    </a>
                  </p>
                )}
              </address>
            )}
          </div>

          {/* Follow Us + theme */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">{visibleSocial.length ? "Follow us" : "Display"}</h3>

            <TooltipProvider>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {visibleSocial.map((social) => {
                  const label = social.label ?? SOCIAL_LABELS[social.id] ?? social.id;
                  const glyph =
                    social.id === "email" ? (
                      <Mail className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
                    ) : (
                      <SocialIcon name={social.id} size={18} />
                    );
                  const tile = `group flex h-11 w-11 items-center justify-center rounded-xl ${chip}`;
                  if (!social.href) {
                    return (
                      <span key={social.id} aria-hidden="true" title={`${label}: link not set yet`} className={`${tile} cursor-not-allowed opacity-40`} style={{ color: BRAND_COLORS[social.id] }}>
                        {glyph}
                      </span>
                    );
                  }
                  const external = /^https?:/i.test(social.href);
                  return (
                    <Tooltip key={social.id}>
                      <TooltipTrigger asChild>
                        <a
                          href={social.href}
                          aria-label={label}
                          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className={`${tile} hover:-translate-y-0.5 hover:border-solid hover:border-primary/60`}
                          style={{ color: BRAND_COLORS[social.id] }}
                        >
                          <span className="transition-transform duration-300 group-hover:scale-110">{glyph}</span>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                {/* Theme + back-to-top controls */}
                <div className="flex h-11 items-center gap-1 rounded-full border border-dashed border-border bg-muted/40 p-1">
                  <button
                    type="button"
                    aria-label="Light mode"
                    aria-pressed={!isDarkMode}
                    onClick={() => setIsDarkMode(false)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      !isDarkMode ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Back to top"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Dark mode"
                    aria-pressed={isDarkMode}
                    onClick={() => setIsDarkMode(true)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isDarkMode ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          {legalLinks.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-4 text-sm" aria-label="Legal">
              {legalLinks.map(({ label, href }) => (
                <a key={href} href={href} className="transition-colors hover:text-primary">
                  {label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}

export { Footer };
export default Footer;
