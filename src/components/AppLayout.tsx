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
import { currentUser } from "@/lib/mock-data";
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
  const [open, setOpen] = useState(false);

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
            <span className="hidden rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:inline">
              {currentUser.credits} credits
            </span>
            <Link
              to="/profile"
              aria-label="Open profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-brand)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              {currentUser.initials}
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
