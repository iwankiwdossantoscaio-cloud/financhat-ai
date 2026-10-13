import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { BarChart3, Lightbulb, MessageCircle, Target, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const profile = await context.queryClient.ensureQueryData(profileQuery);
    if (!profile?.onboarded && location.pathname !== "/onboarding") throw redirect({ to: "/onboarding" });
  },
  component: Layout,
});

const NAV = [
  { to: "/conversar", label: "Conversar", icon: MessageCircle },
  { to: "/painel", label: "Painel", icon: BarChart3 },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/insights", label: "Dicas", icon: Lightbulb },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

function Layout() {
  const { pathname } = useLocation();
  const showNav = pathname !== "/onboarding";
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <main className={cn(showNav && "pb-nav")}>
        <Outlet />
      </main>
      {showNav && (
        <nav
          aria-label="Navegação principal"
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        >
          <ul className="grid grid-cols-5">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold text-muted-foreground"
                  activeProps={{ className: "text-primary", "aria-current": "page" }}
                >
                  {({ isActive }) => (
                    <>
                      <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors", isActive && "bg-primary-soft")}>
                        <Icon aria-hidden className="size-5" />
                      </span>
                      {label}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string | undefined }) {
  return (
    <header className="px-5 pb-4 pt-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>}
    </header>
  );
}
