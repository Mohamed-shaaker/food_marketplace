import { Link, useLocation } from "react-router-dom";
import { Twitter, Facebook, Instagram, MapPin, ExternalLink } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const PARTNER_LINKS = [
  { label: "Register Restaurant", href: "/restaurant-dashboard" },
  { label: "Become a Driver", href: "/driver-dashboard" },
];

const DELIVERY_AREAS = ["Kololo", "Ntinda", "Entebbe", "Bugolobi"];

const SOCIAL_LINKS = [
  { icon: Twitter,   label: "Twitter / X", href: "https://twitter.com" },
  { icon: Facebook,  label: "Facebook",    href: "https://facebook.com" },
  { icon: Instagram, label: "Instagram",   href: "https://instagram.com" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const FooterHeading = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
    {children}
  </h3>
);

const FooterLink = ({ href, children, external = false }) => {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors duration-150 text-sm"
      >
        {children}
        <ExternalLink size={11} className="opacity-50" />
      </a>
    );
  }
  return (
    <Link
      to={href}
      className="text-slate-400 hover:text-white transition-colors duration-150 text-sm"
    >
      {children}
    </Link>
  );
};

// ─── Main Footer ─────────────────────────────────────────────────────────────

const Footer = () => {
  const { pathname } = useLocation();

  // Hide on login page; also hidden on mobile — BottomNav handles mobile nav
  if (pathname === "/login") return null;

  return (
    <footer className="hidden md:block bg-slate-900 mt-auto">
      {/* Subtle top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      <div className="max-w-6xl mx-auto px-8 pt-14 pb-10">
        {/* ── 4-Column Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Col 1 — Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl" role="img" aria-label="pizza">🍕</span>
              <span className="text-white font-bold text-lg tracking-tight">
                Food Marketplace
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">
              The best food in Kampala, delivered fresh to your door.
            </p>

            {/* Location badge */}
            <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <MapPin size={12} className="text-primary shrink-0" style={{ color: "#2563eb" }} />
              <span className="text-xs text-slate-400">Kampala, Uganda</span>
            </div>
          </div>

          {/* Col 2 — Partners */}
          <div>
            <FooterHeading>Partners</FooterHeading>
            <ul className="space-y-3">
              {PARTNER_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Delivery Areas */}
          <div>
            <FooterHeading>Delivery Areas</FooterHeading>
            <ul className="space-y-3">
              {DELIVERY_AREAS.map((area) => (
                <li key={area}>
                  <FooterLink href="/restaurants">{area}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Support */}
          <div>
            <FooterHeading>Support</FooterHeading>
            <ul className="space-y-3 mb-6">
              <li>
                <FooterLink href="mailto:help@foodmarketplace.ug" external>
                  Help Center
                </FooterLink>
              </li>
            </ul>

            {/* Social Icons */}
            <FooterHeading>Follow Us</FooterHeading>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all duration-150"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} Food Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors duration-150">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors duration-150">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
