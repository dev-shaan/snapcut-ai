import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

export function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to keep cutting out backgrounds.">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Login form">
        <Field label="Email" id="email" type="email" placeholder="you@example.com" />
        <Field label="Password" id="password" type="password" placeholder="••••••••" />

        <div className="flex justify-end">
          <span className="cursor-default text-sm text-primary hover:underline">
            Forgot password?
          </span>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Login
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full" size="lg" type="button">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.4-1.62 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.79 3.95 14.7 3 12.18 3 7.15 3 3.07 7.03 3.07 12s4.08 9 9.11 9c5.26 0 8.74-3.7 8.74-8.9 0-.6-.06-1.05-.57-1z"
          />
        </svg>
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to SnapCut AI?{" "}
        <Link to="/signup" className="text-primary hover:underline">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
