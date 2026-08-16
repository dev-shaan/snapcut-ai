import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buttonClasses } from "@/components/Button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3.5 py-2 text-sm transition-colors",
                    isActive
                      ? "text-foreground bg-surface/70"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login" className={buttonClasses("ghost", "sm")}>
            Login
          </Link>
          <Link to="/signup" className={buttonClasses("primary", "sm")}>
            Try SnapCut Free
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-10 w-10 place-items-center rounded-lg border border-border text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 transition-[max-height,opacity] duration-300 md:hidden",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="space-y-1 px-4 py-4">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="flex gap-2 pt-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className={cn(buttonClasses("outline", "sm"), "flex-1")}
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className={cn(buttonClasses("primary", "sm"), "flex-1")}
            >
              Try Free
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
