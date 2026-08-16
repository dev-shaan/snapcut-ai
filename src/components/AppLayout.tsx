import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  CreditCard as CreditCardIcon,
  History,
  LayoutDashboard,
  Menu,
  Scissors,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard#upload", label: "Remove Background", icon: Scissors },
  { to: "/history", label: "History", icon: History },
  { to: "/pricing", label: "Pricing", icon: CreditCardIcon },
  { to: "/profile", label: "Profile", icon: User },
] as const;

type AppLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
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

  const sidebar = (
    <nav aria-label="Dashboard" className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-sm text-muted-foreground transition-all hover:bg-surface/70 hover:text-foreground",
              isActive && "bg-surface text-foreground border-primary/40",
            )
          }
        >
          <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/60 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline">
              {credits} {credits === 1 ? "credit" : "credits"}
            </span>
            <Link
              to="/profile"
              aria-label="Open profile"
              className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 py-1 pl-1 pr-3 text-xs font-medium transition-colors hover:border-primary/50 hover:bg-surface"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[image:var(--gradient-brand)] text-xs font-semibold text-primary-foreground">
                {initials}
              </span>
              <span className="hidden sm:inline">{displayName.split(" ")[0]}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">{sidebar}</div>
        </aside>

        <div
          className={cn(
            "fixed inset-x-0 top-16 z-40 border-b border-border bg-background p-4 transition-transform duration-300 lg:hidden",
            open ? "translate-y-0" : "-translate-y-[150%]",
          )}
        >
          {sidebar}
        </div>

        <main className="min-w-0 flex-1">
          <PageTransition>
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
