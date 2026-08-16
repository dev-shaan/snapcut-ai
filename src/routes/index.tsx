import { Link } from "react-router-dom";
import {
  ArrowRight,
  Download,
  FileImage,
  Gauge,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { BeforeAfter } from "@/components/BeforeAfter";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCard } from "@/components/PricingCard";
import { Gallery } from "@/components/Gallery";
import { buttonClasses } from "@/components/Button";
import { plans, sampleImages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Wand2,
    title: "One-click removal",
    description:
      "No lasso tools, no masks. Drop an image and SnapCut cuts the subject out for you.",
  },
  {
    icon: FileImage,
    title: "Transparent PNGs",
    description:
      "Crisp edges around hair, fur and fine detail, exported with a real alpha channel.",
  },
  {
    icon: Gauge,
    title: "Fast processing",
    description:
      "Most images finish in under five seconds, so you can keep working without waiting.",
  },
  {
    icon: FileImage,
    title: "Multiple formats",
    description: "Bring PNG, JPG, JPEG or WEBP files up to 10 MB each.",
  },
  {
    icon: ShieldCheck,
    title: "Secure processing",
    description:
      "Your uploads stay private and are removed from processing storage after download.",
  },
  {
    icon: Sparkles,
    title: "Studio-ready output",
    description:
      "Drop cutouts straight into your store listings, decks, thumbnails or ad creatives.",
  },
];

const steps = [
  { icon: UploadCloud, title: "Upload", text: "Drag in a PNG, JPG or WEBP from any device." },
  {
    icon: Wand2,
    title: "AI removes background",
    text: "The subject is detected and isolated automatically.",
  },
  { icon: Download, title: "Download", text: "Save a transparent PNG ready for any layout." },
];

export function LandingPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[46rem] -translate-x-1/2 animate-[var(--animate-drift)] rounded-full opacity-60 blur-3xl [background:var(--gradient-brand)] [mask-image:radial-gradient(circle,#000,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="animate-[var(--animate-fade-up)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Fast • Simple • AI-powered
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Remove Backgrounds. <span className="text-gradient">Instantly.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              SnapCut AI strips the background out of any photo in seconds. Upload an image, let the
              model isolate your subject, and download a clean transparent PNG — no editing skills
              required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className={buttonClasses("primary", "lg")}>
                Remove Background
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#how-it-works" className={buttonClasses("outline", "lg")}>
                See How It Works
              </a>
            </div>
          </div>

          <div className="relative animate-[var(--animate-fade-up)]">
            <div
              className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl [background:var(--gradient-brand)]"
              aria-hidden="true"
            />
            <div className="relative rounded-3xl border border-border bg-surface/70 p-4 backdrop-blur-xl">
              <BeforeAfter before={sampleImages.before} after={sampleImages.after} />
              <p className="mt-3 px-1 text-center text-xs text-muted-foreground">
                Drag the handle to compare the original and the cutout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <header className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need to cut out an image
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for sellers, designers and marketers who need clean images fast.
          </p>
        </header>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border/60 bg-surface/25">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="group relative rounded-2xl border border-border bg-background/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <span className="font-display text-sm font-semibold text-primary">
                  Step {index + 1}
                </span>
                <span className="mt-4 grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-brand)] text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Showcase */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Cutouts from SnapCut</h2>
            <p className="mt-3 text-muted-foreground">
              Real categories our users process every day.
            </p>
          </div>
        </header>
        <Gallery className="mt-10" />
      </section>

      {/* Pricing preview */}
      <section className="border-y border-border/60 bg-surface/25">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <header className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Simple pricing</h2>
            <p className="mt-3 text-muted-foreground">
              Start free, upgrade when your volume grows.
            </p>
          </header>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
          <p className="mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Compare all plan details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-surface/60 px-6 py-16 text-center">
          <div
            className="pointer-events-none absolute inset-0 [background:var(--gradient-glow)]"
            aria-hidden="true"
          />
          <h2 className="relative text-3xl font-bold sm:text-4xl">
            Ready to clean up your images?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
            Get three free credits and see the difference on your own photos.
          </p>
          <Link to="/signup" className={cn(buttonClasses("primary", "lg"), "relative mt-8")}>
            Try SnapCut Free
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

export default LandingPage;
