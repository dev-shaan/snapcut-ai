import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const columns = [
  {
    title: "Product",
    links: [
      { to: "/dashboard", label: "Remove background" },
      { to: "/history", label: "History" },
      { to: "/profile", label: "Profile" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/pricing", label: "Pricing" },
      { to: "/login", label: "Login" },
      { to: "/signup", label: "Create account" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            AI background removal for creators, sellers and teams. Upload, cut out, download — in
            seconds.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 SnapCut AI. All rights reserved.</p>
          <p className="flex gap-5">
            <span className="cursor-default hover:text-foreground">Privacy</span>
            <span className="cursor-default hover:text-foreground">Terms</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
