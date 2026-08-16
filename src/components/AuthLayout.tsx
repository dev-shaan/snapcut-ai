import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { BeforeAfter } from "@/components/BeforeAfter";
import { PageTransition } from "@/components/PageTransition";
import { sampleImages } from "@/lib/mock-data";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <PageTransition>
            <h1 className="mt-10 font-display text-3xl font-bold">{title}</h1>
            <p className="mt-2 mb-8 text-sm text-muted-foreground">{subtitle}</p>
            {children}
          </PageTransition>
        </div>
      </div>

      <aside className="relative hidden items-center justify-center overflow-hidden border-l border-border bg-surface/30 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 animate-[var(--animate-drift)] rounded-full opacity-30 blur-3xl [background:var(--gradient-brand)]"
          aria-hidden="true"
        />
        <div className="relative w-full max-w-sm">
          <BeforeAfter before={sampleImages.before} after={sampleImages.after} />
          <h2 className="mt-8 font-display text-xl font-semibold">One click. Background gone.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Over 240,000 images cut out by creators, sellers and studios using SnapCut AI.
          </p>
        </div>
      </aside>
    </div>
  );
}
