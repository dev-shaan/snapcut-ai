import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Sparkles, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buttonClasses } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Navbar() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  const credits = profile?.credits ?? 0;
  const rawName =
    profile?.name ||
    user?.user_metadata?.["name"] ||
    user?.email?.split("@")[0] ||
    "User";

  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const nameParts = displayName.trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : displayName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {publicLinks.map((link) => (
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

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {credits} {credits === 1 ? "credit" : "credits"}
              </span>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 py-1 pl-1 pr-3 text-xs font-medium transition-colors hover:border-primary/50 hover:bg-surface"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[image:var(--gradient-brand)] text-xs font-semibold text-primary-foreground">
                  {initials}
                </span>
                <span>{displayName.split(" ")[0]}</span>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className={buttonClasses("ghost", "sm")}>
                Login
              </Link>
              <Link to="/signup" className={buttonClasses("primary", "sm")}>
                Try SnapCut Free
              </Link>
            </>
          )}
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
          {publicLinks.map((link) => (
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
            {user ? (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className={cn(buttonClasses("outline", "sm"), "w-full text-center")}
              >
                Profile ({displayName.split(" ")[0]} · {credits} {credits === 1 ? "credit" : "credits"})
              </Link>
            ) : (
              <>
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
              </>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}
