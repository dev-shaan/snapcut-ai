import { useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, ShieldCheck, User } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { CreditCard } from "@/components/CreditCard";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const rawName =
    profile?.name ||
    user?.user_metadata?.["name"] ||
    user?.email?.split("@")[0] ||
    "User";

  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const displayEmail = user?.email || profile?.email || "";

  const nameParts = displayName.trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : displayName.substring(0, 2).toUpperCase();

  const credits = profile?.credits ?? 0;
  const totalCredits = 3;
  const plan = profile?.plan ? profile.plan.toUpperCase() : "FREE";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <AppLayout title="Profile" subtitle="Your account details and plan.">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface/50 p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[image:var(--gradient-brand)] font-display text-xl font-bold text-primary-foreground">
                {initials}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold">{displayName}</h2>
                <p className="truncate text-sm text-muted-foreground">{displayEmail}</p>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Plan", value: plan },
                {
                  icon: User,
                  label: "Credits remaining",
                  value: String(credits),
                },
                {
                  icon: CalendarDays,
                  label: "Member since",
                  value: memberSince,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl border border-border bg-background/40 p-4"
                >
                  <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                    <row.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {row.label}
                  </dt>
                  <dd className="mt-2 text-sm font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-surface/50 p-6">
            <h2 className="font-display text-lg font-semibold">Account details</h2>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Account details form"
            >
              <Field label="Name" id="profile-name" type="text" defaultValue={displayName} readOnly />
              <Field
                label="Email"
                id="profile-email"
                type="email"
                defaultValue={displayEmail}
                readOnly
              />
            </form>
          </section>

          <section className="rounded-2xl border border-destructive/30 bg-surface/40 p-6">
            <h2 className="font-display text-lg font-semibold">Session</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Signing out ends this session on this device only.
            </p>
            <Button variant="danger" size="md" className="mt-4" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </Button>
          </section>
        </div>

        <aside className="space-y-6">
          <CreditCard credits={credits} total={totalCredits} />
        </aside>
      </div>
    </AppLayout>
  );
}

export default ProfilePage;
