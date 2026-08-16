import { Link } from "react-router-dom";
import { CalendarDays, LogOut, Mail, ShieldCheck, User } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { CreditCard } from "@/components/CreditCard";
import { Field } from "@/components/Field";
import { Button, buttonClasses } from "@/components/Button";
import { currentUser } from "@/lib/mock-data";

export function ProfilePage() {
  return (
    <AppLayout title="Profile" subtitle="Your account details and plan.">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface/50 p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[image:var(--gradient-brand)] font-display text-xl font-bold text-primary-foreground">
                {currentUser.initials}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold">{currentUser.name}</h2>
                <p className="truncate text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Plan", value: currentUser.plan },
                {
                  icon: User,
                  label: "Images processed",
                  value: String(currentUser.imagesProcessed),
                },
                {
                  icon: CalendarDays,
                  label: "Member since",
                  value: currentUser.memberSince,
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
              <Field label="Name" id="profile-name" type="text" defaultValue={currentUser.name} />
              <Field
                label="Email"
                id="profile-email"
                type="email"
                defaultValue={currentUser.email}
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Save changes</Button>
                <Button type="button" variant="ghost">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Change password
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-destructive/30 bg-surface/40 p-6">
            <h2 className="font-display text-lg font-semibold">Session</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Signing out ends this session on this device only.
            </p>
            <Link to="/login" className={`${buttonClasses("danger", "md")} mt-4`}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </Link>
          </section>
        </div>

        <aside className="space-y-6">
          <CreditCard credits={currentUser.credits} total={currentUser.totalCredits} />
        </aside>
      </div>
    </AppLayout>
  );
}

export default ProfilePage;
