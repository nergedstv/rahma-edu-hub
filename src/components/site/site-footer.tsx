import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import { logoUrl } from "@/lib/assets";
import { school } from "@/lib/school";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt={`${school.name} logo`}
              className="size-12 rounded-full object-cover ring-2 ring-accent"
            />
            <div>
              <p className="font-display text-base font-bold">{school.shortName}</p>
              <p className="text-xs uppercase tracking-brand text-navy-foreground/70">
                {school.motto}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-navy-foreground/80">{school.values}</p>
        </div>

        <div className="text-sm">
          <p className="font-display font-semibold">Explore</p>
          <ul className="mt-3 space-y-2 text-navy-foreground/80">
            <li>
              <Link to="/about" className="hover:text-accent">
                About the school
              </Link>
            </li>
            <li>
              <Link to="/academics" className="hover:text-accent">
                Academics &amp; CBC
              </Link>
            </li>
            <li>
              <Link to="/admissions" className="hover:text-accent">
                Admissions
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-accent">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-accent">
                Parent &amp; staff portal
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-display font-semibold">Contact</p>
          <ul className="mt-3 space-y-3 text-navy-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-accent" /> {school.location}
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 text-accent" /> {school.phone}
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 text-accent" /> {school.email}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-navy-foreground/70">
        © {new Date().getFullYear()} {school.name}. All rights reserved.
      </div>
    </footer>
  );
}
