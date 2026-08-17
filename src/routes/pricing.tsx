import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { PricingCard } from "@/components/PricingCard";
import { plans, type Plan } from "@/lib/mock-data";
import { createPaymentOrder, verifyPayment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("");

  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const handleSelectPlan = async (selectedPlan: Plan) => {
    if (selectedPlan.id === "free") {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/signup");
      }
      return;
    }

    if (!user) {
      toast.info("Please sign in or create an account to upgrade your plan.");
      navigate("/login");
      return;
    }

    if (processingPlanId) return;

    setProcessingPlanId(selectedPlan.id);
    setLoadingText("Opening secure checkout...");

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load Razorpay payment gateway SDK. Please check your internet connection.");
      }

      // Step 1: Create Order via Express Backend
      const orderRes = await createPaymentOrder(selectedPlan.id);

      // Step 2: Open Razorpay Test Checkout Modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: "SnapCut AI",
        description: `${selectedPlan.name} Plan (${selectedPlan.credits})`,
        order_id: orderRes.order.id,
        prefill: {
          name: profile?.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setLoadingText("Verifying payment...");
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success(
              verifyRes.message ||
                `Payment successful! ${verifyRes.credits} credits added.`,
            );

            await refreshProfile();
            navigate("/dashboard");
          } catch (verifyErr: unknown) {
            const errorMsg =
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment could not be verified. No credits were added.";
            toast.error(errorMsg);
          } finally {
            setProcessingPlanId(null);
            setLoadingText("");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment checkout canceled.");
            setProcessingPlanId(null);
            setLoadingText("");
          },
        },
      };

      const razorpayInstance = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay(options);
      razorpayInstance.open();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to initialize payment checkout.";
      toast.error(errorMsg);
      setProcessingPlanId(null);
      setLoadingText("");
    }
  };

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
            <PricingCard
              key={plan.id}
              plan={plan}
              yearly={yearly}
              onSelect={handleSelectPlan}
              isLoading={processingPlanId === plan.id}
              loadingText={loadingText}
              disabled={Boolean(processingPlanId && processingPlanId !== plan.id)}
            />
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
