import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PricingCard } from "@/components/PricingCard";
import { plans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What counts as one credit?",
    a: "One credit removes the background from one image, whatever its size or format.",
  },
  {
    q: "Do unused credits roll over?",
    a: "Monthly credits reset at the start of each billing cycle. Yearly plans are billed once and refreshed monthly.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. You can move between Free, Pro and Business at any time from your profile.",
  },
  {
    q: "What image formats are supported?",
    a: "PNG, JPG, JPEG and WEBP up to 10 MB. Output is always a transparent PNG.",
  },
];

export function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold sm:text-5xl">
            Pricing that scales with your images
          </h1>
          <p className="mt-4 text-muted-foreground">
            Pay for what you cut out. No editors to learn, no seats to manage.
          </p>

          <div
            role="group"
            aria-label="Billing period"
            className="mt-8 inline-flex rounded-full border border-border bg-surface/50 p-1"
          >
            {[
              { label: "Monthly", value: false },
              { label: "Yearly · 2 months free", value: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setYearly(option.value)}
                aria-pressed={yearly === option.value}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  yearly === option.value
                    ? "bg-[image:var(--gradient-brand)] text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} yearly={yearly} />
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
            Frequently asked questions
          </h2>
          <dl className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border bg-surface/50 p-5">
                <dt className="font-medium">{faq.q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </SiteLayout>
  );
}

export default PricingPage;
