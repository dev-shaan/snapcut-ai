import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

export function SignupPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Set up SnapCut AI in less than a minute.">
      <p className="mb-6 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
        Start with 5 free credits.
      </p>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Sign up form">
        <Field label="Name" id="name" type="text" placeholder="Aarav Mehta" />
        <Field label="Email" id="email" type="email" placeholder="you@example.com" />
        <Field label="Password" id="password" type="password" placeholder="••••••••" />
        <Field
          label="Confirm password"
          id="confirm-password"
          type="password"
          placeholder="••••••••"
        />
        <Button type="submit" className="w-full" size="lg">
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}

export default SignupPage;
